const userModel = require('../../models/users')
const { buildResponse } = require('../../utils/responseService')

function singleUser (req, res) {
  userModel.findOne(req.params.username)
    .then(user => buildResponse(res, 200, { user }))
    .catch(err => buildResponse(res, 500, err))
}

function allUsers (req, res) {
  userModel.getAllUsers()
    .then(users => buildResponse(res, 200, { users }))
    .catch(err => buildResponse(res, 500, err))
}

function singleUserHistory (req, res) {
  const username = req.params.username
  if (!username) return buildResponse(res, 400, { message: 'supply the username of the user whose history you want to view.'})

  userModel.getSingleUserHistory(username)
    .then(history => buildResponse(res, 200, { user: history }))
    .catch(err => buildResponse(res, 500, err))
}

module.exports = {
  allUsers,
  singleUser,
  singleUserHistory
}