const userModel = require('../../models/users')
const { buildResponse } = require('../../utils/responseService')
const validator = require('./logoutValidation')

module.exports = (req, res) => {
  const { error, value } = validator.validate(req.body)
  if (error) return buildResponse(res, 400, { message: 'bad request', reason: error.details[0].message})

  userModel.logout(value)
    .then(() => buildResponse(res, 200, { message: 'Successfully logged out'}))
    .catch((error) => buildResponse(res, 500, { message: 'Something aweful happend and we couldn\'t log out', error}))
}