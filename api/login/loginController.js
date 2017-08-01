const jwt = require('jsonwebtoken')
const userModel = require('../../models/users')
const { buildResponse } = require('../../utils/responseService')
const validator = require('./loginValidation')

module.exports = (req, res) => {
    // extra security layer. Client should not cache the request
    // only for the /login route
    res.header('Cache-Control', 'no-store')
      .header('Pragma', 'no-store')

    const { error, value } = validator.validate(req.body)
    if (error) return buildResponse(res, 400, { message: 'bad request', reason: error.details[0].message})

    value.computer_name = req.query.computer_name
    userModel.login(value)
      .then(userData => {
        const { token, user } = userData
        buildResponse(res, 200, { message: 'success', token, user })
      })
      .catch(error => {
        if (error && error.status === 401) return buildResponse(res, 401, { message: error.message })
        buildResponse(res, 500, { message: 'Internal server error'})
      })
}
