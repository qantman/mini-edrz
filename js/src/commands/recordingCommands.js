const fs = require('fs')
const path = require('path')
const _get = require('lodash/get')
const _set = require('lodash/set')
const mongo = require('@/services/mongoService')
const us = require('@/services/userService')
const ds = require('@/services/deviceService')
const dateFilter = require('@/filters/date.filter')
const fsRecords = require('@/configs/server').fsRecords

var rc = {}

rc.startRecording = function (req, res, next) {
  const ctch = (e) => {
    // console.log('startRecording ERROR', e.message)
    let name = e.name ? e.name : 'recording'
    e = res.return.setError(e, name)
    if (next) { return next(e) }
    return e
  }
  var session = {}
  try {
    var id =
      _get(req, 'body.session.id') ||
      _get(req, 'session.id') ||
      _get(req, 'body.id') ||
      req.id

    req.user.stor.addSession(req.body.session)

    session = req.user.stor.sessions[id]
    // session.start()
    req.body.session = session
  } catch (e) { return ctch(e) }

  // write to csv file

  try {
    // reading group_name line
    let append = 'date;time;sec;'
    append += ds.allReadingsString()
    append += ';comments\n'
    fs.appendFileSync(session.csvPath, append)

    // units line
    append = 'date;time;s;'
    append += ds.allUnitsString()
    append += ';#\n'
    fs.appendFileSync(session.csvPath, append)

    console.log('User:',
      session.username,
      '- Recording started:',
      path.parse(session.csvPath).base)
  } catch (e) {
    res.return.setError(e, 'csv')
    _set(session, 'errors.csv', e.message)
  }

  // write to txt file

  if (session.comments && session.comments.current) {
    try {
      fs.writeFileSync(
        session.txtPath,
        session.comments.current)
      console.log('Comments file:',
        path.parse(session.txtPath).base)
    } catch (e) {
      res.return.setError(e, 'txt')
      _set(session, 'errors.txt', e.message)
    }
  }

  // write to DB

  var str = '' + session.startTime
  return req.db.createCollection(str).then(() => {
    session.start(session.startTime)
    _set(res, 'return.session', session.sendStatus())

    fsRecords.refresh(true)

    let send = 'Recording started.' 
    if (_get(req, 'body.session.filename')) {
      send = send +
        ' File: ' + _get(req, 'body.session.filename')
    }
    res.return.toSend = session.sendStatus()
    res.return.send = send

    var dbInsert = {
      _id: str,
      ...session
    }
    req.db.collection(mongo.sessionsCol)
      .insertOne(dbInsert).then(() => {
      return mongo.updateSessionsList()
    }).catch(e => {
      console.log(e.message)
    })

    if (next) { return next() }
    return res.return
  }).catch(e => { return ctch(e) })
}

rc.stopRecording = function (req, res, next) {
  const ctch = (e) => {
    // console.log('stopRecording', e.message)
    let name = e.name ? e.name : 'recording'
    e = res.return.setError(e, name)
    if (next) { return next(e) }
    return e
  }

  try {
    var session = _get(req, 'body.session')

    session.stop()
    _set(res, 'return.session', {
      id: session.id,
      settings: {
        run: false,
        recording: false,
        recLen: session.recLen,
        stopTime: session.stopTime
      }
    })
    // req.user.stor.deleteSession(session.id)
  } catch (e) { return ctch(e) }

  // write to txt file

  if (session.comments && session.comments.current) {
    try {
      fs.writeFileSync(
        session.txtPath,
        session.comments.current)
      fs.appendFileSync(
        session.txtPath,
        '\n' + dateFilter(
          _get(res, 'return.session.settings.stopTime'),
          'datetime') +
        ': Recording stopped')

      console.log('User:',
        session.username,
        '- Recording stopped, textfile:',
        path.parse(session.txtPath).base)
    } catch (e) {
      res.return.setError(e, 'txt')
      _set(session, 'errors.txt', e.message)
    }
  }

  // write to DB

  var str = '' + session.startTime
  var dbInsert = {
    _id: str,
    ...session
  }
  // console.log('session size',
  //   Buffer.byteLength(JSON.stringify(session)))

  return req.db.collection(mongo.sessionsCol).updateOne(
    { _id: str },
    { $set: dbInsert })
  .then(r => {
    res.return.toSend.dbReply = r
  }).catch(e => {
    let name = e.name ? e.name : 'recording'
    res.return.setError(e, name)
  }).finally(() => {
    let send = 'Recording stopped.' 
    if (session.filename) {
      send = send + ' File: ' + session.filename
    }
    res.return.send = send
    res.return.toSend = session.sendStatus()

    mongo.updateSessionsList().catch(e => {
      console.log(e.message)
    })
    if (next) { return next() }
    return res.return
  })
}

rc.writeComments = function (req, res, next) {
  const ctch = (e) => {
    // console.log('writeComments', e.message)
    let name = e.name ? e.name : 'comments'
    e = res.return.setError(e, name)
    if (next) { return next(e) }
    return e
  }

  if (!res.return || !res.return.user || !res.return.session) {
    us.findUser(req, res)
    us.findSession(req, res)
    return us.writeComments(req, res, next)
  }

  // console.log('writeComments: !!res.return', !!res.return)
  if (!res.return.user.commentsWrite) {
    return ctch('User ' + req.user.name +
      ' has no rights to write comments')
  }

  var session = res.return.session
  // write one line via writeRecord function
  if (req.body.commentLine && session) {
    session.comment = req.body.commentLine
  }

  // write whole comments textarea
  if (req.body.commentsCurrent) {
    // write txt file
    try {
      fs.writeFileSync(
        session.txtPath,
        req.body.commentsCurrent)
      // _set(res, 'return.toSend.txtPath', session.txtPath)
      console.log('User:',
        session.username,
        'Comments updated:',
        path.parse(session.txtPath).base)
    } catch (e) {
      res.return.setError(e, 'txt')
      _set(session, 'errors.txt', e.message)
    }

    // write comments to DB
    if (session && session.id) {
      mongo.setInColByQuery(
      mongo.sessionsCol,
      { _id: '' + session.id },
      { 'settings.comments.current': req.body.commentsCurrent })
    }
  }
  res.return.toSend.nocomments = true
  res.return.send = 'Comments updated'
  if (next) { return next() }
  return res.return
}

module.exports = rc
