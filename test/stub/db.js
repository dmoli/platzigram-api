'use strict'
const fixtures = require('../fixtures')

module.exports = class Db {
  connect () {
    return Promise.resolve(true)
  }
  disconnect () {
    return Promise.resolve(true)
  }
  getImage (id) {
    return Promise.resolve(fixtures.getImage())
  }
  getImages () {
    return Promise.resolve(fixtures.getImages())
  }
  getImagesByTag () {
    return Promise.resolve(fixtures.getImagesByTag())
  }
  getImagesByUser () {
    return Promise.resolve(fixtures.getImagesByUser())
  }
  saveImage (image) {
    return Promise.resolve(fixtures.getImage())
  }
  likeImage (id) {
    let image = fixtures.getImage()
    image.liked = true
    image.like = 1
    return Promise.resolve(image)
  }
  saveUser (user) {
    return Promise.resolve(fixtures.getUser())
  }
  getUser (username) {
    return Promise.resolve(fixtures.getUser())
  }
  authenticate (username, pass) {
    return Promise.resolve(true)
  }
}
