const { generateToken } = require('../../utils/authService')
const moment = require('moment')

function successResponseToApi (dbUser) {
  // do not send the password to the client
  delete dbUser.password

  return {
    user: dbUser,
    token: generateToken({
      username: dbUser.username,
      exp: moment().add(7, 'd').unix()
    })
  }
}

module.exports = {
  successResponseToApi
}