const jwt = require('jsonwebtoken')
const userModel = require('../users/index')
const { buildResponse } = require('../../utils/responseService')
const validator = require('./auth.validation')

module.exports.login = async (req, res) => {
    // extra security layer. Client should not cache the request
    // only for the /login route
    res.header('Cache-Control', 'no-store')
      .header('Pragma', 'no-store')

    const { error, value } = validator.login.validate(req.body)
    if (error) return buildResponse(res, 400, { message: error.details[0].message})

    // validate desktop requests
    if (req.query.app) {
      if (req.query.app === 'desktop' && !req.query.computer_name) {
        return buildResponse(res, 400, { message: 'The name of the computer attempting to login has not been provided.'  })
      }
    }

    value.computer_name = req.query.computer_name
    try {
      const userApi = new userModel()
      const user = await userApi.login(value)
      const token = user.token
      delete user.token

      buildResponse(res, 200, { message: 'success', token, user })
    } catch(error) {
        if (error && error.status === 401) return buildResponse(res, 401, { message: error.message })
        buildResponse(res, 500, { message: 'Internal server error'})
    }
}

module.exports.logout = async (req, res) => {
  const { error, value } = validator.logout.validate(req.body)
  if (error) return buildResponse(res, 400, { message: 'bad request', reason: error.details[0].message})

  try {
    const userApi = new userModel()
    await userApi.logout(value)
    buildResponse(res, 200, { message: 'Successfully logged out'})
  } catch (error) {
    buildResponse(res, 500, { message: 'Something aweful happend and we couldn\'t log out', error })
  }
}
