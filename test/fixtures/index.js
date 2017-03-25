const gravatar = require('gravatar')

module.exports = {
  getImage () {
    return {
      id: 'rethinkId',
      publicId: 'id62',
      userId: 'platzigram',
      src: 'http://platzigram.test/id-62.jpg',
      description: '#awesome',
      liked: false,
      like: 0,
      tags: [ 'awesome' ],
      createAt: '' // new Date().toString()
    }
  },
  getImages () {
    return [
      this.getImage(),
      this.getImage(),
      this.getImage()
    ]
  },
  getImagesByTag () {
    return [
      this.getImage(),
      this.getImage()
    ]
  },
  getImagesByUser () {
    return [
      this.getImage(),
      this.getImage(),
      this.getImage(),
      this.getImage()
    ]
  },
  getUser () {
    let email = 'skumblue@gmail.com'
    let avatar = gravatar.url(email)
    return {
      id: 'rethinkId',
      name: 'Diego Molina',
      username: 'skumblue',
      email: email,
      password: 'aurora',
      avatar: avatar,
      createAt: '' // new Date().toString()
    }
  }
}
