const fs = require('fs')
const path = require('path')

const _get = require('lodash/get')
const _set = require('lodash/set')
const _merge = require('lodash/merge')
// const _remove = require('lodash/remove')
// const _find = require('lodash/find')
// const _findIndex = require('lodash/findIndex')

const mongo = require('@/services/mongoService')
const auth = require('@/services/authService')
const device = require('@/services/deviceService')
const dateFilter = require('@/filters/date.filter')

const User = require('@/classes/User')
const Session = require('@/classes/Session')
const Package = require('@/classes/Package')

us = {} // default export

us.colSizeLimit = 86400 // !!!
us.usersLimit = 10 // !!!
us.activeUsers = []
us.error = null

us.startLoop = function (ms) {
  var req = {}
  var res = { return: new Package() }
  return mongo.connect().then(db => {
    req.db = db
  }).finally(() => {
    var usersServ = this
    return setInterval(() => {
      usersServ.updateDB(req, res)
      if (us.error) {
        console.log('us.error', us.error)
      }
    }, ms)
  })
}

us.updateDB = function (req = {}, res) {
  // console.log('activeUsers', Object.keys(us.activeUsers))
  if (!req.db) {
    return mongo.connect().then(db => {
      req.db = db
    }).then(() => {
      return us.updateDB(req, res)
    }).catch(e => { us.error = e })
  }

  // console.log('updateDB: activeUsers', us.activeUsers)
  us.activeUsers.forEach(au => {
    // console.log('updateDB: au', au)
    // console.log('updateDB: au.name', au.name)
    // console.log('updateDB: au.recordsWrite', au.recordsWrite)
    // console.log('updateDB: au.stor.sessions', Object.keys(au.stor.sessions))
    Object.values(au.stor.sessions).forEach((ses) => {
      if (!au.hold && ses.recording && au.recordsWrite) {
        // console.log('updateDB: ses', ses)
        au.hold = true

        req.user = au
        _set(req, 'body.session', ses)
        req.recTime = new Date().getTime()
        // req.values = device.allValues

        us.writeRecord(req, res)
        au.hold = false
      }
    })
  })
}

us.findUserInActiveUsers = function (req, res, next) {
  try {
    let auIndex = us.activeUsers.findIndex((au) => {
      return (String(_get(au, 'id')) ===
        String(_get(req, 'decoded.id')))
    })
    if (auIndex !== -1) {
      req.user = us.activeUsers[auIndex]
      req.user.auIndex = auIndex
      res.return.deleteError('user')
    }
  } catch (e) {
    res.return.setError(e, 'user')
  }
  res.return.user = req.user
  if (next) { return next() }
  return res.return
}

us.findUserInDB = function (req, res, next) {
  // console.log('findUserInDB req.decoded', req.decoded)
  return mongo.findInColByQuery(
    mongo.usersCol,
    { _id: _get(req, 'decoded.id') })
  .then(userFound => {
    // console.log('findUserInDB: userFound.length',
    //   userFound.length)
    if (!userFound.length) {
      res.return.setError(
        'User ' + _get(req, 'decoded.name', '') + ' is not found',
        'user')
    } else {
      res.return.deleteError('user')
      req.user = new User(userFound[0])
    }
  }).catch(e => {
    res.return.setError(e, 'user')
  }).finally(() => {
    res.return.user = req.user
    if (next) { return next() }
    return res.return
  })
}

us.findUser = function (req, res, next) {
  if (req.body.command === 'login' ||
    req.body.command === 'register') {
    if (next) { return next() }
    return res.return
  }
  // if (!req.decoded || _get(res, 'return.errors.authentication')) {
  //   _set(res, 'return.errors.user',
  //     _get(res, 'return.errors.authentication'))
  // }
  var foundAU = us.findUserInActiveUsers(req, res).user
  if (!foundAU) {
    return us.findUserInDB(req, res).then(() => {
      // console.log('findUser dbUser.id', _get(req, 'user.id'))
      if (req.user) {
        us.activeUsers.push(req.user)
      }
      if (us.activeUsers.length > us.usersLimit) {
        us.activeUsers.shift()
      }
      if (next) { return next() }
      return res.return
    }).catch(e => {
      res.return.setError(e, 'user')
    })
  }
  // res.return.user = req.user
  if (next) { return next() }
  return res.return
}

us.findSession = function (req, res, next) {
  if (req.body.command === 'login' ||
    req.body.command === 'register') {
    if (next) { return next() }
    return res.return
  }
  
  try {
    var id =
      _get(req, 'body.session.id') ||
      _get(req, 'session.id') ||
      _get(req, 'body.id') ||
      req.id

    var filename =
      _get(req, 'body.session.settings.filename') ||
      _get(req, 'body.session.filename') ||
      _get(req, 'session.filename') ||
      _get(req, 'body.filename') ||
      req.filename

    var ses = {}
    if (req.user && req.user.stor && req.user.stor.sessions &&
      req.user.stor.sessions[id]) {
      ses = req.user.stor.sessions[id]
    }

    _merge(ses, req.body.session)

    if (filename) {
      _set(ses, 'settings.filename', filename)
    }

    // console.log('findSession req.user', req.user)
    if (req.user) {
      _set(ses, 'settings.user', req.user.send)
    }

    if (!(ses instanceof Session)) {
      ses = new Session(ses)
    }
    _set(req, 'body.session', ses)
    res.return.deleteError('session')
  } catch (e) {
    _set(req, 'body.session.settings.recording', false)
    res.return.setError(e, 'session')
  }
  _merge(req.body.session.settings.errors, res.return.errors)
  res.return.session = req.body.session
  if (next) { return next() }
  return res.return
}

us.writeRecord = function (req, res, next) {
  const ctch = (e) => {
    us.error = e
    e = res.return.setError(e, 'recording')
    if (next) { return next(e) }
    return e
  }

  if (!req.recTime) {
    return ctch('Clock error')
  }

  // console.log('req.user', !!req.user, 'req.db',
  //   !!req.db, 'req.body.session', !!req.body.session)
  if (!req.user || !req.db || !req.body || !req.body.session) {
    // console.log('writeRecord: !!!findSession!!!')
    us.findSession(req, res, next)
    return us.writeRecord(req, res, next)
  }

  if (!req.user.recordsWrite) {
    return ctch('User ' + req.user.name + ' has no rights to write records')
  }

  var session = req.body.session
  if (session.recLen > us.colSizeLimit) {
    us.stopRecording(req, res, next)
    return ctch('Maximum record length is reached')
  }

  try {
    session.inc()
    var date = dateFilter(req.recTime, 'date')
    var time = dateFilter(req.recTime, 'time')
    var sec = Math.floor((req.recTime -
      (session.startTime || session.id)) / 1000)

    var str = '' + session.id
    var dbInsert = {
      _id: req.recTime,
      values: device.allValues
    }

    // write to csv file

    var append = '' + date + ';' + time + ';' + sec + ';' 
    append += '' + device.allValuesString() + ';'
    // console.log(device.allValuesString())

    // session.comment is from us.writeComments
    if (session.comment) {
      dbInsert.comment = '' + session.comment
      append += dbInsert.comment
      session.comment = ''
    }

    append += '\n'
  } catch (e) { return ctch(e) }

  if (session.csvPath) {
    try {
      fs.appendFileSync(session.csvPath, append)
    } catch (e) {
      // _set(res, 'return.errors.csv', e.message)
      res.return.setError(e, 'csv')
      _set(session, 'errors.csv', e.message)
    }
  }

  // write to DB

  return req.db.collection(str).insertOne(dbInsert)
  .then(r => {
    _set(res, 'return.toSend.dbInsert', r)
    if (next) { return next() }
    return res.return
  }).catch(e => { return ctch(e) })
}

module.exports = us
