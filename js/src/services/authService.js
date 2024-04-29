const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const _get = require('lodash/get')
const _set = require('lodash/set')

const User = require('@/classes/User')
const mongo = require('@/services/mongoService')
const authconf = require('@/configs/auth')

const saltRounds = 10

var auth = {}

// checkToken is used globally in app.use
auth.checkToken = function (req, res, next) {
  if (req.body.command === 'login' ||
    req.body.command === 'register') {
    if (next) { return next() }
    return res.return
  }
  var token = req.headers['x-access-token'] || req.headers['authorization']
  if (token) {
    if (token.startsWith('Bearer ')) {
      // Remove Bearer from string
      token = token.slice(7, token.length)
    }
    jwt.verify(token,
      authconf.secret,
      (e, decoded) => {
      if (e) {
        res.return.setError(e, 'authentication')
      } else {
        res.return.deleteError('authentication')
        res.return.decoded = decoded
        req.decoded = decoded
      }
    })
  } else {
    res.return.setError(
      'Authentification failure, please login',
      'authentication')
  }
  // console.log('checkToken url', req.url)
  // console.log('checkToken errors', res.return.errors)
  if (next) { return next() }
  return res.return
}

auth.register = function (req, res, next) {
  const ctch = (e) => {
    // console.log('register ERROR', e)
    e = res.return.setError(e, 'register')
    if (next) { return next(e) }
    return e
  }
  mongo.findInColByQuery(
    mongo.usersCol,
    { name: _get(req, 'body.username') })
  .then(userFound => {
    if (userFound.length) {
      throw 'User ' + req.body.username + ' already exists'
    }
    let newUser = {
      name: req.body.username,
      password: bcrypt.hashSync(
        req.body.password, saltRounds),
      ips: [req.IP]
    }
    req.user = new User(newUser)
    return req.db.collection(mongo.usersCol)
      .insertOne(req.user.writeToDB)
  }).then(insert => {
    return mongo.findInColByQuery(
      mongo.usersCol,
      { name: req.user.name })
  }).then(created => {
    // req.user = new User(created[0])
    console.log('User registered:', req.user.name)
    var token = jwt.sign(
      req.user.sign,
      authconf.secret,
      { expiresIn: authconf.expires })
    res.return.send = 'User ' + req.user.name + ' registered'
    res.return.toSend = {
      auth: true,
      token: token,
      user: req.user.send,
      nocomments: true
    }
    if (next) { return next() }
    return res.return
  }).catch(e => { return ctch(e) })
}

auth.login = function (req, res, next) {
  const ctch = (e) => {
    // console.log('login ERROR', e)
    e = res.return.setError(e, 'login')
    if (next) { return next(e) }
    return e
  }
  mongo.connect().then(db => {
    req.db = db
    return mongo.findInColByQuery(
      mongo.usersCol,
      { name: _get(req, 'body.username') })
  }).then(userFound => {
    if (!userFound.length) {
      throw 'User ' + req.body.username + ' is not found'
    }

    req.user = new User(userFound[0])
    const pass = userFound[0].password
    let passwordIsValid = bcrypt.compareSync(
      req.body.password, pass)
    if (!passwordIsValid) {
      throw 'Incorrect password'
    }

    if (req.IP) {
      if(req.user.ips.indexOf(req.IP) === -1) {
        req.user.ips.push(req.IP)
      }
      req.db.collection(mongo.usersCol).updateOne(
        { _id: req.user._id || req.user.id },
        { $addToSet: { ips: req.IP } })
    }
    // req.db.close()
    
    let token = jwt.sign(
      req.user.sign,
      authconf.secret,
      { expiresIn: authconf.expires })

    console.log('User logged in:', req.user.name)

    res.return.send = 'User ' + req.user.name + ' logged in'
    res.return.toSend = {
      auth: true,
      token: token,
      user: req.user.send,
      nocomments: true
    }
    if (next) { return next() }
    return res.return
  }).catch(e => { return ctch(e) })
}

auth.changePassword = function (req, res, next) {
  const ctch = (e) => {
    // console.log('changePassword ERROR', e)
    e = res.return.setError(e, 'changePassword')
    if (next) { return next(e) }
    return e
  }
  // console.log('changePassword req.body', req.body)
  if (!req.decoded || res.authError) { return ctch(res.authError) }
  return mongo.connect().then(db => {
    req.db = db
    return mongo.findInColByQuery(
      mongo.usersCol,
      { _id: _get(req, 'decoded.id') })
      // { name: req.body.username })
  }).then(userFound => {
    if (!userFound.length) {
      throw 'User ' + req.decoded.name + ' is not found'
    } else {
      req.user = new User(userFound[0])
      const pass = userFound[0].password

      let passwordIsValid = bcrypt.compareSync(
        req.body.currentPassword, pass)
      if (!passwordIsValid) {
        throw 'Current password is incorrect'
      }

      if (req.IP) {
        if(req.user.ips.indexOf(req.IP) === -1) {
          req.user.ips.push(req.IP)
        }
        req.db.collection(mongo.usersCol).updateOne(
          { _id: req.user._id || req.user.id },
          { $addToSet: { ips: req.ip }
        })
      }

      let password = bcrypt.hashSync(
        req.body.password, saltRounds)
      req.user.password = password

      return req.db.collection(mongo.usersCol).updateOne(
        { _id: req.user._id || req.user.id },
        { $set: { password: password }
      })
    }
  }).then(update => {
    console.log('User password changed:', req.user.name)
    res.return.toSend.nocomments = true
    res.return.send = 'Password changed'
    if (next) { return next() }
    return res.return
  }).catch(e => { return ctch(e) })
}

module.exports = auth