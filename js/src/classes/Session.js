const path = require('path')
const _merge = require('lodash/merge')
const _set = require('lodash/set')
const NamedSet = require('@/classes/NamedSet')
const dateFormat = require('@/filters/date.filter')
const recordsDir = require('@/configs/server').recordsDir

const defaultToolbar = require('@/configs/defaultToolbar')
const defaultSessionName = require('@/configs/defaultSessionName')

const Session = class Session extends NamedSet {
  static _defaultSettings = {
    // client:
    title: defaultSessionName,
    toolbarClsName: defaultToolbar.toolbarClsName,
    user: { name: 'Guest', roles: {} },
    run: false,
    onPause: false,
    stopTime: null,
    pauseTimes: [],
    chartConfigs: {},
    comments: {},
    // server:
    namePostfix: defaultSessionName,
    filename: '',
    recording: false,
    recLen: 0,
    lastRead: null,
    lastRecord: null,
    lastError: null,
    errors: {}
  }

  static _clsConf = {
    mapSettings: true,
    defaultSettings: Session._defaultSettings
  }

  setFilename (time) {
    time = time || new Date().getTime()
    var pf = this.namePostfix ? '-' + this.namePostfix : ''
    this.filename = '' + dateFormat(time, 'reverse') + pf
  }

  constructor (obj, id) {
    obj = obj || {}
    obj.clsName = obj.clsName || 'Session'
    obj.id = id || obj.id || new Date().getTime()

    super(obj, Session._clsConf)

    // toolbar comes from the client; startTime is in toolbar
    this.toolbar = obj.toolbar || {}
    // this.startTime = this.startTime || obj.id
    if (!this.filename) {
      this.setFilename(obj.id)
    }
  }

  start (time) {
    time = time || new Date().getTime()
    this.id = time
    this.startTime = time
    this.stopTime = null
    this.run = true
    this.recording = true
    this.recLen = 0
    // this.title = this.namePostfix // from client
    if (!this.filename) {
      this.setFilename(time)
    }
    return this.startTime
  }

  stop (time) {
    time = time || new Date().getTime()
    // this.run = false
    this.recording = false
    this.stopTime = time
  }

  inc () {
    this.recLen++
  }

  merge (session) {
    _merge(this, session)
  }

  sendStatus (conf = {}) {
    // conf: id, values, errors, recording, recLen,
    // lastRead, lastError, lastRecord
    if (Array.isArray(conf.errors)) { errors.join('. ') }
    else if (typeof conf.errors === 'object') {
      _merge(this.errors, conf.errors)
    } else {
      this.errors.other = conf.errors
    }
    return {
      id: conf.id || this.id,
      data: conf.values || this.values,
      settings: {
        recording: conf.recording || this.recording,
        recLen: conf.recLen || this.recLen,
        lastRead: conf.lastRead || this.lastRead,
        lastRecord: conf.lastRecord || this.lastRecord,
        lastError: conf.lastError || this.lastError,
        errors: this.errors
      }
    }
  }

  get startTime () {
    if (this.toolbar) {
      return this.toolbar.startTime
    }
  }

  set startTime (v) {
    v = v || this.startTime // || this.id
    _set(this, 'toolbar.startTime', v)
  }

  get csvPath () {
    return path.join(recordsDir, this.filename + '.csv')
  }
    
  get txtPath () {
    return path.join(recordsDir, this.filename + '.txt')
  }

  get username () {
    try {
      return this.user.name
    } catch (e) { return }
  }

  get sendListElement () {
    return {
      id: this.id,
      settings: {
        title: this.title,
        filename: this.filename,
        run: this.run,
        recording: this.recording,
        recLen: this.recLen,
        stopTime: this.stopTime
      },
      toolbar: {
        startTime: this.toolbar.startTime,
        secs: this.toolbar.secs
      }
    }
  }

  get values () {
    if (this.toolbar && this.toolbar.groups) {
      var values = {}
      for (const g in this.toolbar.groups) {
        values[g] = { readings: {}, controls: {} }
        for (const r in this.toolbar.groups[g].readings) {
          values[g].readings[r] = this.toolbar.groups[g].readings[r].val
        }
        for (const c in this.toolbar.groups[g].controls) {
          values[g].controls[c] = this.toolbar.groups[g].controls[c]
        }
      }
      return values
    }
  }

  set values (source) {
    // merge source readings values
    for (const g in this.toolbar.groups) {
      if ((g in source)) {
        // record readings
        this.toolbar.groups[g].recordReadings(source[g].readings)
        this.toolbar.groups[g].controls = source[g].controls
      } else {
        // for all group readings
        for (const r in this.toolbar.groups[g].readings) {
          // set reading value to '-'
          this.toolbar.groups[g].readings[r].val = '-'
        }
      }
    }
    // merge source controls values
    for (const c in this.toolbar.controls) {
      if ((c in source)) {
        for (const s in this.toolbar.controls[c]) {
          if (source[c].controls && (s in source[c].controls)) {
            this.toolbar.controls[c][s] = source[c].controls[s]
          }
        }
      }
    }
  }
}

module.exports = Session
