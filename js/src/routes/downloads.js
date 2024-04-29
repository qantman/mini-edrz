const router = require('express').Router()
const http = require('@/services/httpService')

router.get('*', [
  http.downloadsGET,
  http.browseFilesGET,
])

module.exports = router
