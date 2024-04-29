// const _merge = require('lodash/merge')
const _set = require('lodash/set')
const OrderedSet = require('@/classes/OrderedSet')
const Session = require('@/classes/Session')
const dateFormat = require('@/filters/date.filter')

const Storage = class Storage extends OrderedSet {
  static _classes = {
    Session: Session
  }

  // static _defaultSettings = {
  //   recLen: 0
  // }

  static _clsConf = {
    mapSettings: true,
    classes: Storage._classes,
    subsets: {
      sessions: {
        mapGetters: false,
        hideAll: false
      }
    }
    // defaultSettings: Storage._defaultSettings
  }

  constructor (obj, id) {
    obj = obj || {}
    obj.clsName = obj.clsName || 'Storage'
    obj.id = id || obj.id || new Date().getTime()

    super(obj, Storage._clsConf)
  }

  get order () {
    var tsr = this._order || {}
    return tsr.sessions || []
  }

  set order (v) {
    var tsr = this._order || {}
    tsr.sessions = v
  }

  get orderedSessions () {
    var to = this.order || []
    // show ordered sessions
    return to.map(x => this.sessions[x])
  }

  checkIdInSessions (id) {
    return OrderedSet.checkIdInObj(id, this.sessions)
  }

  setOrder (order) {
    OrderedSet.prototype.setOrder.call(
      this, order, 'sessions')
  }

  addSession (session, id, unique = false) {
    session = session || {}
    session.clsName = session.clsName || 'Session'
    return OrderedSet.prototype.addUniqueObjToSubset.call(this, {
      obj: session,
      id: id,
      subset: 'sessions',
      unique: unique,
      classes: Storage._classes,
      order: session._order
    })
  }

  mergeSession (session) {
    var id = session.id || session
    if (id in this.sessions) {
      this.sessions[id].merge(session)
      return true
    } else { return false }
  }

  deleteSession (session) {
    var id = session.id || session
    delete this.sessions[id]
    this.setOrder()
  }

  clearRecords () {
    this.sessions = {}
    this.setOrder()
  }
}

module.exports = Storage
