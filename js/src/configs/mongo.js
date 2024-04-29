var {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DB
} = process.env

var user = MONGO_USERNAME || 'edrzadmin'
var password = MONGO_PASSWORD || 'edrzadmin'
var hostname = MONGO_HOSTNAME || 'localhost'
var port = MONGO_PORT || '27017'
var db = MONGO_DB || 'edrz'
var opts = '?authSource=admin'
// var opts = ''
var url = 'mongodb://' +
  user + ':' +
  password + '@' +
  hostname + ':' +
  port + '/' +
  db +
  opts

var options = {
  useNewUrlParser: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500,
  connectTimeoutMS: 10000,
}

module.exports = {
  user: user,
  password: password,
  hostname: hostname,
  port: port,
  db: db,
  url: url,
  options: options
}
