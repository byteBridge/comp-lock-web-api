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

async function singleUser (req, res) {
  try {
    const user = userModel.findOne(req.params.username)
    buildResponse(res, 200, { user })
  } catch (err) {
    buildResponse(res, 500, err)
  }
}

async function deleteUser (req, res) {
  try {
    const { username } = req.params
    await userModel.deleteUser(username)
    buildResponse(res, 200, { message: 'Successfully deleted user account' })
  } catch (err) {
    buildResponse(res, 500, err)
  }
  
}

async function allUsers (req, res) {
  try {
    const users = await userModel.getAllUsers()
    buildResponse(res, 200, { users })
  } catch (err) {
    buildResponse(res, 500, err)
  }
}

async function allOnlineUsers (req, res) {
  try {
    const users  = await userModel.getAllOnlineUsers()
    buildResponse(res, 200, { users })
  } catch (err) {
    buildResponse(res, 500, err)
  }
}

async function singleUserHistory (req, res) {
  const username = req.params.username
  if (!username) return buildResponse(res, 400, { message: 'supply the username of the user whose history you want to view.'})

  try {
    const userWithHistory = await userModel.getSingleUserHistory(username)
    buildResponse(res, 200, { user: userWithHistory })
  } catch (err) {
    buildResponse(res, 500, err)
  }
}


async function changePassword (req, res) {
  const username = req.params.username
  const { currentPassword, newPassword } = req.body
  if (!username) return buildResponse(res, 400, { message: 'supply the username of the user whose password you want to change.'})
  if (!currentPassword && !newPassword) return buildResponse(res, 400, { message: 'supply the current password and/or the new password.'})
  
  try {
    await userModel.changePassword({ username, currentPassword, newPassword })
    buildResponse(res, 200, { message: 'successfully changed password user account' })  
  } catch ({ message, status }) {
    buildResponse(res, status, { message })
  }
}

async function blockUser (req, res) {
  const username = req.params.username
  if (!username) return buildResponse(res, 400, { message: 'supply the username of the user you want to block'})

  try {
    await userModel.blockUser({ username, block: true })
    buildResponse(res, 200, { message: 'successfully blocked user account' })  
  } catch (err) {
    buildResponse(res, 500, { message: 'Something really nasty happened. Contact the developer of the software <kgparadzayi@gmail.com>'})
  }
}

async function unblockUser (req, res) {
  const username = req.params.username
  if (!username) return buildResponse(res, 400, { message: 'supply the username of the user you want to block'})

  try {
    await userModel.blockUser({ username, block: false })
    buildResponse(res, 200, { message: 'successfully unblocked user account' })
  } catch (err) {
    buildResponse(res, 500, { message: 'Something really nasty happened. Contact the developer of the software <kgparadzayi@gmail.com>'})
  }
}

async function getUserTypeTimelimits (req, res) {
  const userType = req.params.userType
  if (!userType) return buildResponse(res, 400, { message: 'supply the account type you want to get timelimits for' })
  
  try {
    const data = await userModel.getUserTypeTimelimits(userType)
    buildResponse(res, 200, { message: 'success', data })
  } catch (err) {
    buildResponse(res, 500, { message: 'Something really nasty happened. Contact the developer of the software <kgparadzayi@gmail.com>'})
  }
}

async function createUserTypeTimelimits (req, res) {
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
  
  try {
    const data = await userModel.createUserTypeTimelimits({ userType, timeLimits })
    buildResponse(res, 200, {
      message: 'successfully created time limits',
      data: {
        user_type: userType,
        time_limit: timeLimits
      }})
  } catch ({ message, status }) {
    buildResponse(res, status, { message })
  }
}

async function updateUserTypeTimelimits (req, res) {
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
  
  try {
    const data = await userModel.updateUserTypeTimelimits({ userType, timeLimits })
    buildResponse(res, 200, {
      message: 'successfully updated time limits',
      data: {
        user_type: userType,
        time_limit: timeLimits
      }})
  } catch ({ message, status }) {
    buildResponse(res, status, { message })
  }
}

async function getAllUserTypeTimelimits (req, res) {
 try {
   const data = await userModel.getAllUserTypeTimelimits()
   buildResponse(res, 200, { message: 'success', data })
 } catch (err) {
  buildResponse(res, 500, { message: 'Something really nasty happened. Contact the developer of the software <kgparadzayi@gmail.com>'})
 }
}

module.exports = {
  create,
  allUsers,
  allOnlineUsers,
  singleUser,
  deleteUser,
  singleUserHistory,
  blockUser,
  changePassword,
  unblockUser,
  getAllUserTypeTimelimits,
  getUserTypeTimelimits,
  createUserTypeTimelimits,
  updateUserTypeTimelimits
}
