const decode = require('urldecode')
const path = require('path')
const fs = require('fs')

const dirService = require('@/services/dirService')

const links = require('@/configs/links')
const recordsDir = require('@/configs/server').recordsDir

const fsRecords = require('@/configs/server').fsRecords
const fsDownloads = require('@/configs/server').fsDownloads

var rc = {}

rc.getRecordsInfo = function (req, res, next) {
  var url = decode(req.url)
  const sendRes = () => {
    res.return.send = 'File(s) found'
    res.return.toSend.nocomments = true
    // console.log('getRecordsInfo: res.return', res.return)
    if (next) { return next() }
    return res.return
  }
  const ctch = (e) => {
    e = e || 'error'
    let name = e.name ? e.name : 'getRecordsInfo'
    e = res.return.setError(e, name)
    if (next) { return next(e) }
    return res.return
  }
  const catchNotFound = () => {
    return ctch(url + ' not found')
  }
  try {
    var current = fsRecords.contentRelativeUrl(url)
    if (!current || !current.exists) {
      return catchNotFound()
    }
    if (current.dir) {
      res.return.toSend.files = current.firstLevelArraySend
      res.return.toSend.files.forEach(f => {
        f.url = path.join(url, f.name)
      })
    } else {
      res.return.toSend.files = [current.sendLongShortLines]
      res.return.toSend.files[0].url = url
      res.return.toSend.isFile = true
    }
    if (url !== '/') {
      res.return.toSend.parentDirUrl = path.join(url, '..')
    }
    return sendRes()
  } catch (e) { ctch(e) }
}

rc.downloadFiles = async function (req, res, next) {
  var url = decode(req.url)
  const sendRes = pathToGET => {
    res.return.toSend = {
      nocomments: true,
      pathToGET: pathToGET
    }
    if (next) { return next() }
    return res.return
  }
  const ctch = (e) => {
    e = e || 'error'
    let name = e.name ? e.name : 'downloadFiles'
    e = res.return.setError(e, name)
    console.log('downloadFiles: ctch e.message', e.message)
    if (next) { return next(e) }
    return res.return
  }
  const catchNotFound = () => {
    return ctch('File(s) not found')
  }

  try {
    var files = []
    for (let f in req.body.files) {
      let full = path.join(
        recordsDir,
        req.body.files[f])
      if (fs.existsSync(full)) {
        files.push({
          dir: fs.lstatSync(full).isDirectory(),
          full: full,
          rel: path.join(
            links.short.records,
            req.body.files[f])
        })
      }
    }
    if (!files.length) { return catchNotFound() }

    var down
    if (files.length > 1 || files[0].dir) {
      down = await dirService.createZip(files.map(x => x.full))
    } else {
      down = files[0].rel
    }
    return sendRes(down)
  } catch (e) { ctch(e) }
}

rc.deleteFiles = function (req, res, next) {
  var url = decode(req.url)
  const sendRes = () => {
    res.return.send = 'File(s) found'
    res.return.toSend.nocomments = true
    if (next) { return next() }
    return res.return
  }
  const ctch = (e) => {
    e = e || 'error'
    let name = e.name ? e.name : 'deleteFiles'
    e = res.return.setError(e, name)
    console.log('deleteFiles: ctch e.message', e.message)
    if (next) { return next(e) }
    return res.return
  }
  const catchNotFound = () => {
    return ctch('File(s) not found')
  }
  try {

    for (let f in req.body.files) {
      fsRecords.deleteRelativeUrl(req.body.files[f])
    }
    fsRecords.refresh(true)
    return sendRes()
  } catch (e) { ctch(e) }
}

rc.mkdir = function (req, res, next) {
  var url = decode(req.url)
  const sendRes = () => {
    res.return.send = 'Directory made'
    res.return.toSend.nocomments = true
    // console.log('res.return.send', res.return.send)
    if (next) { return next() }
    return res.return
  }
  const ctch = (e) => {
    e = e || 'error'
    let name = e.name ? e.name : 'mkdir'
    e = res.return.setError(e, name)
    console.log('mkdir: ctch e.message', e.message)
    if (next) { return next(e) }
    return res.return
  }
  try {

    if (req.body.dirname) {
      let dirname = path.parse(req.body.dirname).base
      res.return.toSend.dirname = fsRecords
        .contentRelativeUrl(url)
        .mkdir(dirname)
        .name
      return sendRes()
    } else {
      return ctch('No directory name')
    }
  } catch (e) { ctch(e) }
}

rc.move = function (req, res, next) {
  const sendRes = () => {
    res.return.send = 'File(s) moved'
    res.return.toSend.nocomments = true
    // console.log('res.return.send', res.return.send)
    if (next) { return next() }
    return res.return
  }
  const ctch = (e) => {
    e = e || 'error'
    let name = e.name ? e.name : 'move'
    e = res.return.setError(
      'Some of the files were not moved', name)
    console.log('move: ctch e.message', e.message)
    if (next) { return next(e) }
    return res.return
  }
  try {
    fsRecords.moveSubDirent(
      req.body.oldPaths,
      req.body.newPath)
    return sendRes()
  } catch (e) { ctch(e) }
}

rc.editFile = function (req, res, next) {
  var url = decode(req.url)
  const sendRes = () => {
    res.return.send = '\"' + url + '\" edited'
    res.return.toSend.nocomments = true
    // console.log('res.return.send', res.return.send)
    if (next) { return next() }
    return res.return
  }
  const ctch = (e) => {
    e = e || 'error'
    let name = e.name ? e.name : 'move'
    e = res.return.setError(e, name)
    console.log('editFile: ctch e.message', e.message)
    if (next) { return next(e) }
    return res.return
  }
  try {
    if (req.body.newName) {
      fsRecords.renameRelativeUrl(url, req.body.newName)
    }
    return sendRes()
  } catch (e) { ctch(e) }
}


module.exports = rc
