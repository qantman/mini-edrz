// const _set = require('lodash/set')
const _merge = require('lodash/merge')

var ds = {
  lastReadingTime: 0,
  lastErrorTime: 0,
  devices: require('@/configs/devices'),
  allGroups: {},
  allValues: {}, // without addr
  errors: {}
}

ds.startLoop = function (ms) {
  var devServ = this
  return setInterval(() => {
    devServ.updateDevices()
  }, ms)
}

ds.updateDevices = function () {
  for (let d in this.devices) {
    this.devices[d].readAll()
    .then(res => {
      // console.log('updateDevices:', d, 'res', res)
      _merge(this.allValues, res)
      _merge(this.allGroups, this.devices[d].groups)
      this.lastReadingTime = new Date().getTime()
    }).catch(e => {
      this.lastErrorTime = new Date().getTime()
      this.errors[d] = this.devices[d].errors
      // this.errors[d].readAll = e.message
    })
  }
}

ds.allReadingsString = function () {
  let str = ''
  for (let g in this.allValues) {
    for (let r in this.allValues[g].readings) {
      str += '' + g + '_' + r + ';'
    }
  }
  if (str) { str = str.slice(0, -1) }
  return str
}

ds.allUnitsString = function () {
  let str = ''
  for (let g in this.allGroups) {
    for (let r in this.allGroups[g].readings) {
      str += '' + this.allGroups[g].readings[r].units + ';'
    }
  }
  if (str) { str = str.slice(0, -1) }
  return str
}

ds.allValuesString = function () {
  let str = ''
  for (let g in this.allValues) {
    for (let r in this.allValues[g].readings) {
      str += '' + this.allValues[g].readings[r] + ';'
    }
  }
  if (str) { str = str.slice(0, -1) }
  return str
}

module.exports = ds
