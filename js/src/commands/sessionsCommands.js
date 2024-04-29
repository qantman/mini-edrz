// const fs = require('fs')
// const path = require('path')
// const _get = require('lodash/get')
// const _set = require('lodash/set')
const _isEmpty = require('lodash/isEmpty')
const mongo = require('@/services/mongoService')
// const us = require('@/services/userService')
// const ds = require('@/services/deviceService')
// const dateFilter = require('@/filters/date.filter')
// const fsRecords = require('@/configs/server').fsRecords

var sc = {}

sc.loadSessionsList = function (req, res, next) {
  const ctch = (e) => {
    // console.log('loadSessionsList ERROR', e.message)
    let name = e.name ? e.name : 'sessions'
    e = res.return.setError(e, name)
    if (next) { return next(e) }
    return e
  }
  try {
    res.return.toSend.sessionsList = mongo.sessionsList
    res.return.toSend.nocomments = true
    res.return.send = 'Sessions list loaded'
    if (next) { return next() }
    return res.return
  } catch (e) { return ctch(e) }
}

sc.loadSession = function (req, res, next) {
  const ctch = (e) => {
    // console.log('loadSession ERROR', e.message)
    let name = e.name ? e.name : 'sessions'
    e = res.return.setError(e, name)
    if (next) { return next(e) }
    return e
  }
  req.db.collection(mongo.sessionsCol)
    .findOne({ id: req.body.sessionId }).then(ses => {
    res.return.toSend.session = ses
    res.return.toSend.nocomments = true
    res.return.send = 'Session loaded'
    if (next) { return next() }
    return res.return
  }).catch(e => { return ctch(e) })
}

sc.saveSession = function (req, res, next) {
  const ctch = (e) => {
    console.log('saveSession ERROR:', e.message)
    let name = e.name ? e.name : 'sessions'
    e = res.return.setError(e, name)
    if (next) { return next(e) }
    return e
  }

  var session = req.body.session
  if (_isEmpty(session)) { return ctch('Session is empty') }

  var str = '' + session.startTime
  req.db.collection(mongo.sessionsCol)
    .countDocuments({ _id: str }, { limit: 1 }).then(found => {
    if (found) {
      delete session._id
      return req.db.collection(mongo.sessionsCol)
        .updateOne(
        { _id: str },
        { $set: session })
    } else {
      return req.db.collection(mongo.sessionsCol)
        .insertOne({
          _id: str,
          ...session
        })
    }
  }).then(resp => {
    mongo.updateSessionsList().catch(e => {
      console.log(e.message)
    })
    console.log('Session', str, 'saved')
    console.log('dbReply:', resp.result)
    res.return.toSend.dbReply = resp.result
    res.return.toSend.nocomments = true
    res.return.send = 'Session saved'
    if (next) { return next() }
    return res.return
  }).catch(e => { return ctch(e) })
}

sc.deleteSession = function (req, res, next) {
  const ctch = (e) => {
    console.log('deleteSession ERROR', e.message)
    let name = e.name ? e.name : 'sessions'
    e = res.return.setError(e, name)
    if (next) { return next(e) }
    return e
  }
  var id = req.body.sessionId
  req.db.collection(mongo.sessionsCol)
    .deleteOne({ id: id }).then(resp => {
    console.log('Session', id, 'deleted')
    console.log('dbReply:', resp.result)
    res.return.toSend.dbReply = resp.result
    return req.db.collection(String(id)).drop()
  }).then(resp => {
    if (resp) {
      console.log('Collection', id, 'dropped')
      res.return.toSend.collectionDroppedId = id
    }

    mongo.updateSessionsList().catch(e => {
      console.log(e.message)
    })

    res.return.toSend.nocomments = true
    res.return.send = 'Session deleted'
    if (next) { return next() }
    return res.return
  }).catch(e => { return ctch(e) })
}

module.exports = sc
