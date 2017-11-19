const User = require('./')
const { buildResponse } = require('../../utils/responseService')

async function create (req, res) {
  try {
    const user = new User()
    let newUser = req.body
    const createdUser = await user.create(newUser)
    buildResponse(res, 200, { message: 'successfully created user.', user: createdUser })
  } catch (error) {
    if (error.status) return buildResponse(res, error.status, { message: error.message, error })
    buildResponse(res, 500, { message: 'something happened', error })
  }
}

module.exports = { create }