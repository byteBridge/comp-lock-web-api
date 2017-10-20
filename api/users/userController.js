const userModel = require('../../models/users')
const { buildResponse } = require('../../utils/responseService')

function singleUser (req, res) {
  userModel.findOne(req.params.username)
    .then(user => buildResponse(res, 200, { user }))
    .catch(err => buildResponse(res, 500, err))
}

function deleteUser (req, res) {
  const { username } = req.params
  userModel.deleteUser(username)
    .then(users => buildResponse(res, 200, { message: 'Successfully deleted user account' }))
    .catch(err => buildResponse(res, 500, err))
}

function allUsers (req, res) {
  userModel.getAllUsers()
    .then(users => buildResponse(res, 200, { users }))
    .catch(err => buildResponse(res, 500, err))
}

function allOnlineUsers (req, res) {
  userModel.getAllOnlineUsers()
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

function blockUser (req, res) {
  const username = req.params.username
  if (!username) return buildResponse(res, 400, { message: 'supply the username of the user you want to block'})

  userModel.blockUser({ username, block: true })
  .then(() => buildResponse(res, 200, { message: 'successfully blocked user account' }))
  .catch(() => buildResponse(res, 500, { message: 'Something really nasty happened. Contact the developer of the software <kgparadzayi@gmail.com>'}))
}

function unblockUser (req, res) {
  const username = req.params.username
  if (!username) return buildResponse(res, 400, { message: 'supply the username of the user you want to block'})

  userModel.blockUser({ username, block: false })
    .then(() => buildResponse(res, 200, { message: 'successfully unblocked user account' }))
    .catch(() => buildResponse(res, 500, { message: 'Something really nasty happened. Contact the developer of the software <kgparadzayi@gmail.com>'}))
}

function getUserTypeTimelimits (req, res) {
  const userType = req.params.userType
  if (!userType) return buildResponse(res, 400, { message: 'supply the account type you want to get timelimits for' })
  
  userModel.getUserTypeTimelimits(userType)
    .then((data) => buildResponse(res, 200, { message: 'success', data }))
    .catch(() => buildResponse(res, 500, { message: 'Something really nasty happened. Contact the developer of the software <kgparadzayi@gmail.com>'}))
}

function createUserTypeTimelimits (req, res) {
  const { timeLimitsSchema } = require('./userValidation')
  const { timeLimits, userType } = req.body

  if (!timeLimits) return buildResponse(res, 400, { message: 'Supply the timelimits for the new user type' })
  if (!userType || userType.length < 3) return buildResponse(res, 400, { message: 'Supply the account type for the new user type. It is at least 3 letter long.' })
  
  const opts = {}
  const limits = timeLimits.split(':')
  opts.hours = limits[0]
  opts.minutes = limits[1]

  // check if the timelimits provided are numbers in the allowed ranges
  const { error, value } = timeLimitsSchema.validate(opts)
  if (error) return buildResponse(res, 400, { message: error.details[0].message})
  
  userModel.createUserTypeTimelimits({ userType, timeLimits })
    .then((data) => buildResponse(res, 200, {
      message: 'successfully created time limits',
      data: {
        user_type: userType,
        time_limit: timeLimits
      }}))
    .catch(({ message, status }) => buildResponse(res, status, { message }))
}

function updateUserTypeTimelimits (req, res) {
  const { timeLimitsSchema } = require('./userValidation')
  const { timeLimits } = req.body
  const { userType } = req.params
  const opts = {}

  if (!timeLimits) return buildResponse(res, 400, { message: 'Supply the timelimits for the new user type' })
  const limits = timeLimits.split(':')
  opts.hours = limits[0]
  opts.minutes = limits[1]

  // check if the timelimits provided are numbers in the allowed ranges
  const { error, value } = timeLimitsSchema.validate(opts)
  if (error) return buildResponse(res, 400, { message: error.details[0].message})
  
  userModel.updateUserTypeTimelimits({ userType, timeLimits })
    .then((data) => buildResponse(res, 200, {
      message: 'successfully updated time limits',
      data: {
        user_type: userType,
        time_limit: timeLimits
      }}))
    .catch(({ message, status }) => buildResponse(res, status, { message }))
}

function getAllUserTypeTimelimits (req, res) {
  userModel.getAllUserTypeTimelimits()
    .then((data) => buildResponse(res, 200, { message: 'success', data }))
    .catch(() => buildResponse(res, 500, { message: 'Something really nasty happened. Contact the developer of the software <kgparadzayi@gmail.com>'}))
}

module.exports = {
  allUsers,
  allOnlineUsers,
  singleUser,
  deleteUser,
  singleUserHistory,
  blockUser,
  unblockUser,
  getAllUserTypeTimelimits,
  getUserTypeTimelimits,
  createUserTypeTimelimits,
  updateUserTypeTimelimits
}