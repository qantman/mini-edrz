const router = require('express').Router()
const http = require('@/services/httpService')

router.get('*', [
  http.recordsGET,
  http.browseFilesGET,
])
router.post('*', http.recordsPOST)

module.exports = router
