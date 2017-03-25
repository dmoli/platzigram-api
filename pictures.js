'use strict'

const co = require('co')
const micro = require('micro')
const httpHash = require('http-hash')
const hash = httpHash()
const utils = require('./lib/utils')
// db setting
const Db = require('platzigram-db')
const config = require('./config')
let db = new Db(config.db)
const DbStub = require('./test/stub/db')

// get environment
const env = process.env.NODE_ENV || 'production'

// if is a test environment, then override db var to stub
if (env === 'test') {
  db = new DbStub()
}

hash.set('GET /userId/:userId', co.wrap(function * getImagesByUser (req, res, params) {
  let userId = params.userId
  yield db.connect()
  let images = yield db.getImagesByUser(userId)
  yield db.disconnect()
  micro.send(res, 200, images)
}))

hash.set('GET /tag/:tag', co.wrap(function * getImagesByTag (req, res, params) {
  let tag = params.tag
  yield db.connect()
  let images = yield db.getImagesByTag(tag)
  yield db.disconnect()
  micro.send(res, 200, images)
}))

hash.set('GET /list', co.wrap(function * getImages (req, res, params) {
  yield db.connect()
  let images = yield db.getImages()
  yield db.disconnect()
  return micro.send(res, 200, images)
}))

hash.set('GET /:id', co.wrap(function * getImage (req, res, params) {
  let id = params.id
  yield db.connect()
  let image = yield db.getImage(id)
  yield db.disconnect()
  return micro.send(res, 200, image)
}))

hash.set('POST /', co.wrap(function * saveImage (req, res, params) {
  // get body var
  let image = yield micro.json(req)
  // token
  try {
    // extract token from header
    let token = yield utils.extractToken(req)
    // verify and get decode payload
    let decoded = yield utils.verifyToken(token, config.secret)
    // if a middle man change the payload, the token is equally decoded, but we must to validate the userId
    if (decoded && decoded.userId !== image.userId) {
      throw new Error('invalid token')
    }
  } catch (e) {
    return micro.send(res, 401, { error: e.message })
  }

  yield db.connect()
  let created = yield db.saveImage(image)
  yield db.disconnect()
  micro.send(res, 201, created)
}))

hash.set('POST /:id/like', co.wrap(function * likeImage (req, res, params) {
  let id = params.id
  yield db.connect()
  let image = yield db.likeImage(id)
  yield db.disconnect()
  micro.send(res, 200, image)
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
