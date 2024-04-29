// const _get = require('lodash/get')
// const _set = require('lodash/set')
const ds = require('@/services/deviceService')

var cc = {}

cc.setGroup = async function (req, res, next) {
  const ctch = (e) => {
    // console.log('setGroup ERROR', e)
    let name = e.name ? e.name : 'setGroup'
    e = res.return.setError(e, name)
    if (next) { return next(e) }
    return e
  }
  // console.log('setGroup: req.body.key', req.body.key)
  // console.log('setGroup: req.body.value', req.body.value)

  var changesStr = ''
  try {
    if (!req.user.devicesExec) {
      return ctch('User ' + req.user.name +
        ' has no rights to execute this command')
    }

    if (req.body && req.body.key && req.body.value) {
      for (let d in ds.devices) {
        // console.log('setGroup d', d)
        let ch = await ds.devices[d].setGroup(
          req.body.key, req.body.value)
        // console.log('setGroup ch', ch)
        if (ch) {
          changesStr = changesStr + d + ' ' + ch + '. '
        }
      }
    } else {
      return ctch('Empty request')
    }
  } catch (e) { return ctch(e) }

  res.return.deleteError('setGroup')
  res.return.send = changesStr
  res.return.toSend.nocomments = true

  try { // write comment to csv file
    req.body.session.comment = changesStr
  } catch (e) {}

  if (next) { return next() }
  return res.return
}

module.exports = cc
