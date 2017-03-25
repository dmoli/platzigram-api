'use strict'

import micro from 'micro'
import test from 'ava'
import listen from 'test-listen'
import request from 'request-promise'
import users from '../users'
import fixtures from './fixtures'

test.beforeEach(async t => {
  const service = micro(users)
  t.context.url = await listen(service)
})

test('POST /', async t => {
  var user = fixtures.getUser()
  var url = t.context.url
  var options = {
    method: 'POST',
    uri: url,
    json: true,
    body: {
      name: user.name,
      username: user.username,
      password: user.password,
      email: user.email
    },
    resolveWithFullResponse: true
  }

  // for security, in the response object, will remove the password an email
  delete user.email
  delete user.password
  var response = await request(options)
  t.is(response.statusCode, 201)
  t.deepEqual(response.body, user)
})

test('GET /:username', async t => {
  let user = fixtures.getUser()
  let url = t.context.url
  var options = {
    method: 'GET',
    uri: `${url}/${user.username}`,
    json: true
  }
  var body = await request(options)
  // for security, in the response object, will remove the password an email
  delete user.email
  delete user.password
  t.deepEqual(body, user)
})
