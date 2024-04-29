const fs = require('fs')
const path = require('path')
const FsElement = require('@/classes/FsElement')
const links = require('@/configs/links')

var rootPath = process.env.SERVER_ROOT_PATH ||
  path.join(__dirname, '../..')

var publicDirRelativeRoot = process.env.PUBLIC_DIR_RELATIVE_ROOT ||
  'public'

var publicDir = process.env.PUBLIC_DIR ||
  path.join(rootPath, publicDirRelativeRoot)

var recordsDir = path.join(publicDir, links.short.records)

var downloadsDir = path.join(publicDir, links.short.downloads)

var favicon = process.env.FAVICON_PATH ||
  path.join(publicDir, 'favicon.ico')

// Make dirs
let exRD = fs.existsSync(recordsDir)
if (!exRD) {
  fs.mkdir(recordsDir, { recursive: true }, e => {
    if (e) { console.log('Make dirs error:', e.message) }
  })
}
let exDD = fs.existsSync(downloadsDir)
if (!exDD) {
  fs.mkdir(downloadsDir, { recursive: true }, e => {
    if (e) { console.log('Make dirs error:', e.message) }
  })
}

var fsRecords = new FsElement(recordsDir, true)
var fsDownloads = new FsElement(downloadsDir, true)

var lang = 'en'
var loc = (
  process.env.LOCALE ||
  process.env.LANG ||
  'en_US').slice(0, 5)
// console.log('locale:', loc)
switch (loc) {
  case 'ru':
  case 'RU':
  case 'rus':
  case 'RUS':
  case 'RUSSIAN':
  case 'russian':
  case 'ru_RU':
    lang = 'ru'
    break
  case 'en':
  case 'EN':
  case 'ENGLISH':
  case 'english':
  case 'en_US':
  case 'en_GB':
    lang = 'en'
    break
  default:
    lang = 'en'
}

module.exports = {
  lang: lang,
  port: process.env.SERVER_PORT || 8082,
  // Loop intervals:
  DEVICE_LOOP_MS: process.env.DEVICE_LOOP_MS || 293, // prime
  RECORD_LOOP_MS: process.env.RECORD_LOOP_MS || 1000,
  DIR_LOOP_MS: process.env.DIR_LOOP_MS || 9967, // prime
  // Paths:
  publicDir: publicDir,
  publicDirRelativeRoot: publicDirRelativeRoot,
  recordsDir: recordsDir,
  downloadsDir: downloadsDir,
  fsRecords: fsRecords,
  fsDownloads: fsDownloads,
  favicon: favicon
}
