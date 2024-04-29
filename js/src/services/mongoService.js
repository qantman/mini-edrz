const _get = require('lodash/get')
const _set = require('lodash/set')
const mongo = require('@/configs/mongo')
const mongodb = require('mongodb')

mdb = {
  usersCol: 'users',
  sessionsCol: 'sessions',
  sessionsList: [],
  db: {},
  client: {}
}

mdb.id = function (id) {
  return mongodb.ObjectID(id)
}

mdb.isConnected = function () {
  return this.db &&
    this.db.serverConfig &&
    this.db.serverConfig.isConnected()
}

mdb.connect = function () {
  return new Promise((resolve, reject) => {
    if (this.isConnected()) {
      return resolve(this.db)
    } else {
      this.client = require('mongodb').MongoClient
      return this.client.connect(
        mongo.url,
        { useUnifiedTopology: true })
        .then(res => {
          this.db = res.db()
          return resolve(this.db)
        }).catch (e => {
          return reject(e)
        })
    }
  })
}

mdb.close = function () {
  return this.client.close()
}

mdb.getCol = function (colName) {
  return new Promise((resolve, reject) => {
    this.db.collection(colName).find()
      .toArray((e, res) => {
        if (e) { return reject(e) }
        return resolve(res)
    })
  })
}

mdb.findInColByQuery = function (colName, q) {
  return new Promise((resolve, reject) => {
    this.db.collection(colName).find(q)
      .toArray((e, res) => {
        if (e) { return reject(e) }
        return resolve(res)
    })
  })
}

mdb.setInColByQuery = async function (colName, q, update) {
  await this.db.collection(colName).updateOne(q, { $set: update })
}

mdb.listIdCollections = function () {
  return new Promise((resolve, reject) => {
    this.db.listCollections().toArray((err, collInfos) => {
      // collInfos is an array of collection info objects:
      // { name: 'test', options: {} }
      var collNames = collInfos.map(c => c.name)
        .filter(x => ((x !== 'users') && (x !== 'sessions')))
      return resolve(collNames)
    })
  })
}

mdb.updateSessionsList = function () {
  return mdb.findInColByQuery(
    mdb.sessionsCol,
    {}).then(colls => {
    var list = colls.map(col => {
      return {
        id: col.id,
        settings: {
          title: col.settings.title,
          filename: col.settings.filename,
          run: col.settings.run,
          recording: col.settings.recording,
          recLen: col.settings.recLen,
          stopTime: col.settings.stopTime
        },
        toolbar: {
          startTime: col.toolbar.startTime,
          secs: col.toolbar.secs
        }
      }
    })
    mdb.sessionsList = list
  })
}

mdb.connectReqResNext = function (req, res, next) {
  if (!req.db || _get(res, 'return.db')) {
    return mdb.connect().then(db => {
      req.db = db
      _set(res, 'return.db', db)
      if (_get(res, 'return.errors.database')) {
        delete res.return.errors.database
      }
      // console.log('connectReqResNext good...')
      if (next) { return next() }
      return res.return
    }).catch(e => {
      _set(res, 'return.errors.database', e.message)
      // console.log('connectReqResNext errors', res.return.errors)
      if (next) { return next(e) }
      return res.return
    })
  }
}

module.exports = mdb
