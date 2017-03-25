'use strict'

import micro from 'micro'
import test from 'ava'
import listen from 'test-listen'
import request from 'request-promise'
// import uuid from 'uuid-base62'
// import HttpHash from 'http-hash'
// const hash = HttpHash()
import pictures from '../pictures'
import fixtures from './fixtures'
import utils from '../lib/utils'
import config from '../config'

test.beforeEach(async t => {
  const service = micro(pictures)
  t.context.url = await listen(service)
})

test('GET /:id', async t => {
  let image = fixtures.getImage()
  let url = t.context.url
  let body = await request({ uri: `${url}/${image.publicId}`, json: true })

  t.deepEqual(body, image)
})

test('no token POST /', async t => {
  let image = fixtures.getImage()
  let url = t.context.url

  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      description: image.description,
      src: image.src,
      userId: image.userId
    },
    resolveWithFullResponse: true
  }
  t.throws(request(options), /Authorization/)
})

test('secure POST /', async t => {
  let image = fixtures.getImage()
  let url = t.context.url
  let token = await utils.signToken({ userId: image.userId }, config.secret) // eslint-disable-line no-unused-vars
  // console.log(`1 token ${token}`)
  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      description: image.description,
      src: image.src,
      userId: image.userId
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }
  let response = await request(options)
  t.is(response.statusCode, 201)
  t.deepEqual(response.body, image)
})

test('invalid token POST /', async t => {
  let image = fixtures.getImage()
  let url = t.context.url
  let token = await utils.signToken({ userId: 'hacky' }, config.secret) // eslint-disable-line no-unused-vars
  let options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      description: image.description,
      src: image.src,
      userId: image.userId
    },
    headers: {
      'Authorization': `Bearer ${token}`
    },
    resolveWithFullResponse: true
  }
  t.throws(request(options), /invalid token/)
})

test('POST /:id/like', async t => {
  let image = fixtures.getImage()
  let url = t.context.url

  let options = {
    method: 'POST',
    uri: `${url}/${image.id}/like`,
    json: true, // req and res in json
    body: {
      id: image.id
    },
    resolveWithFullResponse: true
  }

  let response = await request(options)
  image.liked = true
  image.like = 1
  t.deepEqual(response.body, image)
})

test('GET /', async t => {
  let images = fixtures.getImages()
  let url = t.context.url
  let options = {
    method: 'GET',
    uri: `${url}/list`,
    json: true
  }
  let body = await request(options)
  t.deepEqual(body, images)
})

test('GET /:tag/tag', async t => {
  var tag = 'platzigram'
  let images = fixtures.getImagesByTag()
  let url = t.context.url
  let options = {
    method: 'GET',
    uri: `${url}/tag/${tag}`,
    json: true
  }
  let body = await request(options)
  t.deepEqual(body, images)
})

test('GET /:userId/userId', async t => {
  var userId = 'skumblue'
  let images = fixtures.getImagesByUser()
  let url = t.context.url
  let options = {
    method: 'GET',
    uri: `${url}/userId/${userId}`,
    json: true
  }
  let body = await request(options)
  t.deepEqual(body, images)
})

 /*
test('test i.e', async t => {
  const service = micro(async (req, res) => {
    micro.send(res, 200, {
      test: 'woot'
    })
  })

  const url = await listen(service)
  const body = await request(url)

  t.deepEqual(JSON.parse(body).test, 'woot')
})

*/

 /*
test('test Pictures async native', async t => {
  let id = uuid.v4()
  const service = micro(async (req, res) => {
    hash.set('GET /:id', async function getPicture (req, res, params) {
      micro.send(res, 200, params)
    })

    let { method, url } = req
    let match = hash.get(`${method.toUpperCase()} ${url}`)
    if (match.handler) {
      try {
        await match.handler(req, res, match.params)
      } catch (e) {
        micro.send(res, 500, { error: e.message })
      }
    } else {
      micro.send(res, 404, { error: 'page not found' })
    }
  })

  const url = await listen(service)
  const body = await request({ uri: `${url}/${id}`, json: true })

  t.deepEqual(body, { 'id': id })
})
*/

 /*
test('test Pictures whith co', async t => {
  let id = uuid.v4()
  const service = micro(pictures)

  const url = await listen(service)
  const body = await request({ uri: `${url}/${id}`, json: true })

  t.deepEqual(body, { 'id': id })
})
*/
