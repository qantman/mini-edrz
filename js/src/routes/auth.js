const router = require('express').Router()
const auth = require('@/services/authService')
const authRouter = require('@/configs/links').authRouter

router.post(authRouter.register, auth.register)
router.post(authRouter.login, auth.login)
router.post(authRouter.changePassword, auth.changePassword)

module.exports = router
