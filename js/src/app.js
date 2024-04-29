const express = require('express')
const path = require('path')
const logger = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const fs = require('fs')
const favicon = require('serve-favicon')
const createError = require('http-errors')

// configs
const server = require('@/configs/server')
const links = require('@/configs/links')

// services (the order is important)
const mongoService = require('@/services/mongoService')
const authService = require('@/services/authService')
const deviceService = require('@/services/deviceService')
const dirService = require('@/services/dirService')
const httpService = require('@/services/httpService')
const userService = require('@/services/userService')

// main object:
const app = express()

/////////// HTTP SETUP ///////////

app.use(logger(
  ':remote-addr :remote-user :method :url :status\
  :res[content-length] - :response-time ms'))
app.use(express.json())
// app.use(express.urlencoded({ extended: false }))
app.use(express.urlencoded({
  parameterLimit: 100000,
  limit: '50mb',
  extended: true
}))
app.use(helmet())
app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

////// INTERNAL SERVER LOGIC //////

// Static dir + favicon
app.use(links.full.index, express.static(server.publicDir))
app.use(favicon(server.favicon))

// Start readings loop
const device_interval =
  deviceService.startLoop(server.DEVICE_LOOP_MS)

// Start rescan fs loop
const dir_interval =
  dirService.startLoop(server.DIR_LOOP_MS)

// Start active users loop (recording)
const users_interval =
  userService.startLoop(server.RECORD_LOOP_MS)

// Create short list of sessions from DB
mongoService.connect().then(() => {
  mongoService.updateSessionsList()
})

////// HTTP PRE-HANDLERS //////

// check IP
app.use(httpService.checkIP)

// create Package instance in res.return:
// { result, errors ... }
app.use(httpService.createPackage)

// check user token, create res.decoded
app.use(authService.checkToken)

// Check all POST requests for user and session:
app.post('*', [
  mongoService.connectReqResNext,
  userService.findUser,
  userService.findSession
])

///////// HTTP ROUTES /////////

app.use(links.full.auth, require('@/routes/auth'))
app.use(links.full.controls, require('@/routes/controls'))
app.use(links.full.downloads, require('@/routes/downloads'))
app.use(links.full.readings, require('@/routes/readings'))
app.use(links.full.recording, require('@/routes/recording'))
app.use(links.full.records, require('@/routes/records'))
app.use(links.full.sessions, require('@/routes/sessions'))
app.use(links.full.index, require('@/routes/index'))

////// HTTP END-HANDLERS //////

// POST requests handler, uses Package
app.post('*', httpService.returnPOST)

// catch 404 and forward to universal error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// universal error handler
app.use(function(err, req, res, next) {
  if (req.method === 'GET') {
    httpService.errorGET(err, req, res, next)
    return
  }
  if (req.method === 'POST') {
    httpService.errorPOST(err, req, res, next)
    return
  }

  console.log('404 error', err)
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error =
    req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
