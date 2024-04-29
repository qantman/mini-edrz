const path = require('path')
const fs = require('fs')
const archiver = require('archiver')

const dateFilter = require('./../filters/date.filter')

const server = require('./../configs/server')
const links = require('./../configs/links')

var ds = {}

ds.startLoop = function (ms) {
  return setInterval(() => {
    server.fsRecords.refresh(true)
  }, ms)
}

ds.readDir = function (dirPath) {
  return new Promise((resolve, reject) => {
    try {
      var files = fs.readdirSync(dirPath, { withFileTypes: true })
      var filesList = []
      var dirList = []
      files.forEach(dirEnt => {
        let pt = path.join(dirPath, dirEnt.name)
        let mtimeMs = fs.lstatSync(pt).mtimeMs
        if (dirEnt.isDirectory()) {
          dirList.push({
            dir: true,
            name: dirEnt.name,
            mtimeMs: mtimeMs
          })
        } else {
          filesList.push({
            dir: false,
            name: dirEnt.name,
            mtimeMs: mtimeMs
          })
        }
      })
      return resolve(dirList.concat(filesList))
    } catch (e) {
      return reject(e)
    }
  })
}

ds.createZip = function (files, zipPath) {
  return new Promise((resolve, reject) => {
    try {
      if (!files) { throw 'No files to archive' }
      if (!Array.isArray(files)) { files = [files] }

      if (!zipPath) {
        zipPath = path.join(
          server.downloadsDir,
          dateFilter(new Date(), 'reverse') + '.zip')
      }
      var zipRel = path.relative(server.publicDir, zipPath)

      var output = fs.createWriteStream(zipPath)
      var archive = archiver('zip')

      output.on('close', function () {
        console.log(archive.pointer() + ' total bytes')
        return resolve(zipRel)
      })

      archive.on('error', err => {
        throw err
      })

      archive.pipe(output)

      for (let f in files) {
        let name = path.parse(files[f]).base
        if (fs.lstatSync(files[f]).isDirectory()) {
          // archive.directory(files[f])
          archive.directory(files[f], name)
        } else {
          // archive.file(files[f])
          archive.file(files[f], { name: name })
        }
      }
      // finalize the archive
      // (ie we are done appending files but streams have to finish yet)
      // 'close', 'end' or 'finish' may be fired right after calling this method
      // so register to them beforehand
      archive.finalize()
    } catch (e) {
      return reject(e)
    }
  })
}

ds.fullRefresh = function () {
  server.fsRecords = new FsElement(server.recordsDir, true)
  server.fsDownloads = new FsElement(server.downloadsDir, true)
}

module.exports = ds
