const router = require('express').Router()
const http = require('@/services/httpService')

router.post('/', http.sessionsPOST)

module.exports = router
