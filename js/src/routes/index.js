const router = require('express').Router()
const http = require('@/services/httpService')

router.get('/', http.indexGET)

module.exports = router
