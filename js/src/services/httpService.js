const decode = require('urldecode')
const path = require('path')
const fs = require('fs')
const _get = require('lodash/get')
const _set = require('lodash/set')

const device = require('./../services/deviceService')
const dirService = require('./../services/dirService')

const controlsCommands = require('./../commands/controlsCommands')
const recordsCommands = require('./../commands/recordsCommands')
const recordingCommands = require('./../commands/recordingCommands')
const sessionsCommands = require('./../commands/sessionsCommands')

const dateFilter = require('./../ilters/date.filter')
const Package = require('./../classes/Package')

const links = require('./../configs/links')
const downloadsDir = require('./../configs/server').downloadsDir
const recordsDir = require('./../configs/server').recordsDir
const trans = require('./../configs/translation')

const readingsStr = function (
  values,
  errors,
  lastReadingTime,
  lastErrorTime,
  session = {}
  ) {
  if (Array.isArray(errors)) {
    errors.join('. ')
  }
  if (typeof errors === 'object') {
    if (session.settings && session.settings.errors) {
      _merge(session.settings.errors, errors)
    } else {
      _set(session, 'settings.errors', errors)
    }
  } else {
    _set(session, 'settings.errors.other', errors)
  }
  session.data = values || {}
  _set(session, 'settings.lastRead', lastReadingTime || '')
  _set(session, 'settings.lastError', lastErrorTime || '')
  return session
}

var hs = {}

// CHECK IP //

hs.checkIP = function (req, res, next) {
  // console.log('x-forwarded-for',
  //   req.headers['x-forwarded-for'])
  // console.log('req.connection.remoteAddress',
  //   req.connection.remoteAddress)
  // console.log('req.ip', req.ip)
  req.IP = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress || req.ip
  if (next) { return next() }
  return req.IP
}

// PACKAGE //

hs.createPackage = function (req, res, next) {
  if (!res.return || !(res.return instanceof Package)) {
    res.return = new Package(res.return)
  }
  if (next) { return next() }
  return res.return
}

// GET //

hs.readingsGET = function (req, res, next) {
  try {
    res.json(readingsStr(
      device.allValues,
      device.errors,
      device.lastReadingTime,
      device.lastErrorTime
    ))
  } catch (e) {
    e = res.return.setError(e, 'readings')
    if (next) { next(e) }
    return res.return
  }
}

hs.indexGET = function (req, res, next) {
  try {
    res.render('index', {
      title: trans.indexTitle,
      allValues: device.allValues
    })
  } catch (e) {
    e = res.return.setError(e, 'home')
    if (next) { next(e) }
    return res.return
  }
}

hs.recordsGET = function (req, res, next) {
  req.browseFilesRootUrl = links.full.records
  req.browseFilesUrl = decode(req.url)
  req.browseFilesPath = path.join(
    recordsDir,
    req.browseFilesUrl)
  if (next) { next() }
  return
}

hs.downloadsGET = function (req, res, next) {
  req.browseFilesRootUrl = links.full.downloads
  req.browseFilesUrl = decode(req.url)
  req.browseFilesPath = path.join(
    downloadsDir,
    req.browseFilesUrl)
  if (next) { next() }
  return
}

hs.browseFilesGET = function (req, res, next) {
  let ex = fs.existsSync(req.browseFilesPath)
  if (!ex) {
    res.redirect('/')
    return
  }
  if (fs.lstatSync(req.browseFilesPath).isFile()) {
    res.download(req.browseFilesUrl)
    return
  }
  dirService.readDir(req.browseFilesPath)
  .then(list => {
    list.unshift({
      dir: true,
      name: '..'
    })
    list.forEach(f => {
      f.url = path.join(
        req.browseFilesRootUrl,
        req.browseFilesUrl,
        f.name)
      if (f.mtimeMs) {
        f.mtimeMs = dateFilter(f.mtimeMs, 'datetime')
      }
    })
    res.return.list = list

    res.render('browseFiles', res.return)
    return
  }).catch(e => {
    e = res.return.setError(e, 'staticDir')
    if (next) { next(e) }
    return
  })
}

hs.errorGET = function (err, req, res, next) {
  var e = {
    name: err.name || err,
    message: err.message || err,
    error: err
  }
  if (res) {
    res.render('error', e)
  }
  return e
}

// POST //

hs.readingsPOST = function (req, res, next) {
  try {
    let ses = _get(res, 'return.session')
    res.json(ses.sendStatus({
      values: device.allValues,
      errors: device.errors,
      lastRead: device.lastReadingTime,
      lastError: device.lastErrorTime
    }))
  } catch (e) {
    res.return.setError(e, 'readings')
    if (next) { return next(e) }
    // res.json(res.return.send)
    return res.return
  }
}

hs.controlsPOST = function (req, res, next) {
  // console.log('controlsPOST: req.body', req.body)
  if (req.body.command &&
    (req.body.command in controlsCommands)) {
    controlsCommands[req.body.command](req, res, next)
  } else {
    let e = { name: 'controls', message: 'Invalid request' }
    if (next) { return next(e) }
    return res.return
  }
}

hs.recordsPOST = function (req, res, next) {
  // console.log('recordsPOST: req.body', req.body)
  // console.log('recordsPOST: req.body.command', req.body.command)
  if (req.body.command &&
    (req.body.command in recordsCommands)) {
    recordsCommands[req.body.command](req, res, next)
  } else {
    let e = { name: 'records', message: 'Invalid request' }
    if (next) { return next(e) }
    return res.return
  }
}

hs.recordingPOST = function (req, res, next) {
  // console.log('recordingPOST: req.body', req.body)
  if (req.body.command &&
    (req.body.command in recordingCommands)) {
    recordingCommands[req.body.command](req, res, next)
  } else {
    let e = { name: 'recording', message: 'Invalid request' }
    if (next) { return next(e) }
    return res.return
  }
}

hs.sessionsPOST = function (req, res, next) {
  // console.log('sessionsPOST: req.body', req.body)
  if (req.body.command &&
    (req.body.command in sessionsCommands)) {
    sessionsCommands[req.body.command](req, res, next)
  } else {
    let e = { name: 'sessions', message: 'Invalid request' }
    if (next) { return next(e) }
    return res.return
  }
}

hs.returnPOST = function (req, res, next) {
  // console.log('returnPOST res.return.result', res.return.result)
  // console.log('returnPOST res.return.toSend', res.return.toSend)
  // console.log('returnPOST res.return.errors', res.return.errors)
  if (res.return instanceof Package) {
    res.json(res.return.send)
  } else {
    let e = { name: 'server', message: 'No Package' }
    if (next) { return next(e) }
    return res.return
  }
}

hs.errorPOST = function (err, req, res, next) {
  // console.log('errorPOST res.return.errors', res.return.errors)
  // console.log('errorPOST err', err)
  if (res.return instanceof Package) {
    // console.log('errorPOST err', err)
    res.return.setError(err)
    console.log('errorPOST res.return.errors', res.return.errors)
    // res.status(500).json(res.return.send)
    res.json(res.return.send)
  } else {
    // res.status(500).json({
    res.json({
      errors: {
        server: 'No Package',
        other: err.message || err
      }
    })
  }
}

module.exports = hs
