const router = require('express').Router()
const http = require('@/services/httpService')

router.get('/', http.readingsGET)
router.post('/', http.readingsPOST)

module.exports = router
