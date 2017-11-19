const userModel = require('../../models/users.js')
const validator = require('./registerValidation')
const { buildResponse } = require('../../utils/responseService') 

module.exports = async (req, res) => {
  const {error, value} = validator.validate(req.body)
  if (error) {
    return buildResponse(res, 400, { message: error.details[0].message })
  }

  try {
    const user = await userModel.findOne(value.username)
    if (user) return buildResponse(res, 422, { message: 'user already exists' })

    const newUser = userModel.createUser(value)
    buildResponse(res, 200, { message: 'successfully created user.', user: newUser })
    } catch (error) {
      buildResponse(res, 500, { message: 'something happened', error })
  }
}
