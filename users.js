'use strict'

const co = require('co')
const micro = require('micro')
const httpHash = require('http-hash')
const hash = httpHash()
// db setting
const Db = require('platzigram-db')
const gravatar = require('gravatar')
const config = require('./config')
let db = new Db(config.db) // eslint-disable-line no-unused-vars
const DbStub = require('./test/stub/db')

// get environment
const env = process.env.NODE_ENV || 'production'

// if is a test environment, then override db var to stub
if (env === 'test') {
  db = new DbStub()
}

hash.set('GET /:username', co.wrap(function * getUser (req, res, params) {
  let username = params.username
  yield db.connect()
  let user = yield db.getUser(username)
  user.avatar = gravatar.url(user.email) // get avatar url from gravatar
  yield db.disconnect()
  // remove this secury info
  delete user.email
  delete user.password
  micro.send(res, 200, user)
}))

hash.set('POST /', co.wrap(function * saveUser (req, res, params) {
  let user = yield micro.json(req)
  yield db.connect()
  let created = yield db.saveUser(user)
  yield db.disconnect()
  delete created.email
  delete created.password
  micro.send(res, 201, created)
}))

module.exports = co.wrap(function * (req, res) {
  let { method, url } = req
  let match = hash.get(`${method.toUpperCase()} ${url}`)
  if (match.handler) {
    try {
      yield match.handler(req, res, match.params)
    } catch (e) {
      micro.send(res, 500, { error: e.message })
    }
  } else {
    micro.send(res, 404, { error: 'page not found' })
  }
})
