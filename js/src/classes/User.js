// const _merge = require('lodash/merge')
const _set = require('lodash/set')
const NamedSet = require('@/classes/NamedSet')
const Storage = require('@/classes/Storage')
const dateFormat = require('@/filters/date.filter')

const User = class User extends NamedSet {
  static _defaultSettings = {
    name: 'Guest',
    password: '',
    roles: {
      comments: 'rw',
      devices: 'r',
      records: 'r'
    },
    ips: [],
    hold: false
  }

  static _clsConf = {
    mapSettings: true,
    defaultSettings: User._defaultSettings
  }

  constructor (obj, id) {
    // EXAMPLE load from DB:
    // let loadUser = loadUserFromDB()
    // loadUser.stor = loadStorFromDB()
    // var user = new User(loadUser)

    // console.log('User: obj', obj)
    obj = obj || {}
    obj.clsName = obj.clsName || 'User'
    obj.id = id || obj.id || obj._id || new Date().getTime()
    obj.settings = obj.settings || obj

    super(obj, User._clsConf)
    // console.log('User this', this)

    this.stor = new Storage(obj.stor)
    this._id = obj._id || obj.id
  }

  get send () {
    return {
      name: this.name,
      roles: this.roles
    }
  }

  get sign () {
    return {
      id: this._id,
      name: this.name,
      roles: this.roles
    }
  }

  get writeToDB () {
    return {
      _id: this._id,
      id: this.id,
      name: this.name,
      password: this.password,
      roles: this.roles,
      ips: this.ips
    }
  }

  get recordsWrite () {
    return (typeof this.roles.records === 'string' &&
      this.roles.records.includes('w'))
  }

  get commentsWrite () {
    return (typeof this.roles.comments === 'string' &&
      this.roles.records.includes('w'))
  }

  get devicesExec () {
    return (typeof this.roles.devices === 'string' &&
      this.roles.records.includes('x'))
  }
}

module.exports = User
