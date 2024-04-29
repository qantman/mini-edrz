var backPrefix =
  process.env.BACKEND_PREFIX || '/edrz'

const auth = '/auth'
const authRouter = {
  login: '/login',
  register: '/register',
  changePassword: '/change'
}

// ALL SHORT ROUTES
var short = {
  index: '/',

  auth: auth,
  login: auth + authRouter.login,
  register: auth + authRouter.register,
  changePassword: auth + authRouter.changePassword,

  controls: '/controls',
  readings: '/readings',
  users: '/users',
  downloads: '/downloads',
  records: '/records',
  recording: '/recording',
  sessions: '/sessions'
}

// ALL FULL ROUTES
var full = {}
for (var s in short) {
  full[s] = backPrefix + short[s]
}

module.exports = {
  backPrefix: backPrefix,
  short: short,
  full: full,
  authRouter: authRouter
}
