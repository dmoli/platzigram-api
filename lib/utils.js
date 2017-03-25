'use strict'

const co = require('co')
const jwt = require('jsonwebtoken')
const bearer = require('token-extractor')

module.exports = {
  // signature token
  signToken (payload, secret, options) {
    let result = co.wrap(function * (payload, secret, options) {
      return new Promise((resolve, reject) => {
        jwt.sign(payload, secret, options, (err, token) => {
          if (err) return reject(err)
          resolve(token)
        })
      })
    })
    return Promise.resolve(result(payload, secret, options))
  },

  // verify token and get decode payload
  verifyToken (token, secret, options) {
    let result = co.wrap(function * (token, secret, options) {
      return new Promise((resolve, reject) => {
        jwt.verify(token, secret, options, (err, decoded) => {
          if (err) return reject(err)
          resolve(decoded)
        })
      })
    })
    return Promise.resolve(result(token, secret, options))
  },

  // extract totken form request
  extractToken (req) {
    let result = co.wrap(function * (req) {
      return new Promise((resolve, reject) => {
        // extract token of request
        bearer(req, (err, token) => {
          if (err) return reject(err)
          resolve(token)
        })
      })
    })
    return Promise.resolve(result(req))
  }
}
