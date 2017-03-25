'use strict'

const co = require('co')
const micro = require('micro')
const httpHash = require('http-hash')
const hash = httpHash()
const utils = require('./lib/utils')
// db setting
const Db = require('platzigram-db')
const config = require('./config')
let db = new Db(config.db) // eslint-disable-line no-unused-vars
const DbStub = require('./test/stub/db')

// get environment
const env = process.env.NODE_ENV || 'production'

// if is a test environment, then override db var to stub
if (env === 'test') {
  db = new DbStub()
}

hash.set('POST /', co.wrap(function * authenticate (req, res, params) {
  let credentials = yield micro.json(req)
  yield db.connect()
  try {
    let auth = yield db.authenticate(credentials.username, credentials.password)
    if (!auth) {
      throw new Error('invalid credentials')
      // return micro.send(res, 401, { error: 'invalid credentials' })
    }
  } catch (e) {
    return micro.send(res, 401, { error: e.message })
  }
  let payload = { userId: credentials.username }
  let token = yield utils.signToken(payload, config.secret)
  yield db.disconnect()

  micro.send(res, 200, token)
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
