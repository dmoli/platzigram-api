'use strict'

import micro from 'micro'
import test from 'ava'
import listen from 'test-listen'
import request from 'request-promise'
import auth from '../auth'
import fixtures from './fixtures'
import utils from '../lib/utils'
import config from '../config'

test.beforeEach(async t => {
  const service = micro(auth)
  t.context.url = await listen(service)
})

test('success POST /', async t => {
  let user = fixtures.getUser()
  let url = t.context.url

  let options = {
    method: 'POST',
    uri: url,
    body: {
      username: user.username,
      password: user.password
    },
    json: true
  }

  let token = await request(options)
  let decoded = await utils.verifyToken(token, config.secret)
  t.is(decoded.userId, user.username)
})
