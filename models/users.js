const { hashedPassword, comparePasswords, generateToken } = require('../utils/authService')
// const { successResponseToApi, errorResponseToApi } = require('./utils')
const knex = require('../database')
const moment = require('moment')

//********************* Util functions *************************/
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

  return dbUser
}

function errorResponseToApi (error) {
  return {
    status: 401,
    message: error.message
  }
}
//***************************************************************/
async function findOne (username) {
  try {
    const user = await knex('users').select().where({ username }).first()
    if (user) delete user.password
    return user || null
  } catch (err) {
    throw err
  }
}

async function createUser (user) {
  try {
    user.password = await hashedPassword(user.password)
    return await knex('users').insert(user).returning('*')
  } catch (err) {
    throw err
  }
}

// deletes the user from the sytem. Supply username
async function deleteUser (username = '') {
  try {
    await knex('users').where({username}).del()
  } catch (err) {
    throw err
  }
}

// Chages the yser password ater verifying that the supplied password
// is correct. Duply { username, currentPassword, newPassword }
async function changePassword ({ username, currentPassword, newPassword }) {
  try {
    const user = await knex('users').where({ username }).select('password').first()
    if (! await comparePasswords(currentPassword, user.password)) throw { message: 'invalid login details', status: 401 }

    // user password match
    const password =  await hashedPassword(newPassword)
    try {
      await knex('users').where({ username }).update({ password, updated_at: new Date() })
    } catch (err) {
      throw { message: 'An error occured', status: 500 }
    }
   } catch(err) {
      // this one comes from a failed password comparison
      if (err.status) throw err
      // sever error, non of the user's business
      throw { message: 'An error occured', status: 500 }
  }
}

async function getAllUsers () {
 try {
    return await knex('users').select()
  } catch (err) {
    throw err
  }
}

async function getAllOnlineUsers () {
  try {
    const requiredFields = [
      'users.username',
      'users.f_name',
      'users.s_name',
      'users.type',
      'online.login_time',
      'online.login_date',
      'online.computer_name'
    ]

    return await knex('online')
      .leftJoin('users', 'users.username', '=', 'online.username')
      .select(...requiredFields)
  } catch(err) {
    throw err
  }
}

async function login (credentials) {
  try {
    const { username, password, computer_name } = credentials
    const studentProfile = await getStudentProfile(username)
    const validatedUser = await checkValidity(studentProfile, { password, computer_name })

    // if admin resolve imediately
    if (validatedUser.type === 'administrator') return successResponseToApi(validatedUser)

    /**
     * If the computer_name is not specified, the user has used
     * the web client to log in to the application.
     * Respond with only the token and a bit of user info
     */

    if (!computer_name) return successResponseToApi(validatedUser)
    
    const userWithTimeLimits = await checkTimeLimits(validatedUser)
    
    await goOnline({ username, computer_name })
    
    // finally resolve for the student here
    return successResponseToApi(userWithTimeLimits)
  } catch (err) {
    throw err.message ? errorResponseToApi(err) : err
  }
}

async function getStudentProfile (username) {
  try {
    const requiredFields = [
      'users.username',
      'users.f_name',
      'users.s_name',
      'users.password',
      'users.blocked',
      'users.gender',
      'users.created_at',
      'users.type',
      'online.login_time',
      'time_limit.time_limit'
    ]

    // return the user profile
    return await knex('users')
    .leftJoin('online', 'users.username', '=', 'online.username')
    .leftJoin('time_limit', 'users.type', '=', 'time_limit.user_type')
    .select(...requiredFields)
    .where('users.username', '=', username)
    .first()
  } catch (err) {
    throw err
  }
}


async function checkValidity (dbUser, options) {
  try {
    const { password, computer_name } = options

    // does user exist?
    if (!dbUser) throw { message: 'invalid login details' }
    
    // is user password valid?
    if (! await comparePasswords(password, dbUser.password)) throw ({ message: 'invalid login details' })
    
    // after passwords match and the user is using the web client resolve
    if(!computer_name) return dbUser

    // is user blocked?
    if (dbUser.blocked === true) throw { message: `We regret to inform you that your account qualifies to be blocked. Report by the librarian's desk to have it unblocked` }
    
    // is user online?
    if (dbUser.login_time !== null) throw { message: 'Your account is already signed in on another computer. Sign out and try again.' }
    
    // if all is well, pass on the user to the
    // next function in the promise chain
    return dbUser
  } catch (err) {
    throw err
  }
}

async function checkTimeLimits (dbUser) {
  try {
    const today = moment().format('MM/DD/YYYY')
    const logs = await knex('logsession')
      .select()
      .where({
        log_date: today,
        username: dbUser.username
      })

    if (logs.length === 0) {
      Object.assign(dbUser, { remaining_time: dbUser.time_limit, used_time: '00:00:00' })
      return dbUser
    }
    
    let hours = 0
      , minutes = 0
      , seconds = 0

    for (let i = 0; i < logs.length; i++) {
      const splitTime = logs[i].duration.split(':')
      hours +=  Number(splitTime[0])
      minutes += Number(splitTime[1])
      seconds +=  Number(splitTime[2])
    }
    
    // normalise seconds
    if (seconds > 59) {
      minutes += Math.floor(seconds / 60)
      seconds = Math.floor(seconds % 60)
    }
    
    // normalise minutes
    if (minutes > 59) {
      hours += Math.floor(minutes / 60)
      minutes = Math.floor(minutes % 60)
    }

    const time_limit = dbUser.time_limit.split(':')

    let hourLimit = time_limit[0]
      , minutesLimit = time_limit[1]
    
    // Check if user exhausted allocated time
    if (hours >= hourLimit && Number(hourLimit) !== 0) throw { message: 'We regret to inform you that you have used up the time allocated to your account. Please come back tomorrow for more research.'}
    if (minutes >= minutesLimit) throw { message: 'We regret to inform you that you have used up the time allocated to your account. Please come back tomorrow for more research.'}
    
    const usedTime = `${hours}:${minutes}:${seconds}`
    const remainingTime = `${hourLimit - hours}:${minutesLimit - minutes}:00`

    Object.assign(dbUser, { remaining_time: remainingTime, used_time: usedTime })

    return dbUser
  } catch (err) {
    throw err
  }
}

async function goOnline (user) {
  const { username, computer_name } = user
  try {
    // user information we neet to place him/her online
    const userMetaData = {
      username,
      computer_name,
      login_time: `${moment().hours()}:${moment().minutes()}:${moment().seconds()}`,
      login_date: new Date()
    }
  
    // Register the user online in the database
    await knex('online').insert(userMetaData).returning('*')
  } catch (err) {
    throw err
  }
}

async function logout (user) {
  try {
    const username = user.username || '' // deal with undefineds
    await knex('online').where({ username }).del()
    await knex('logsession').insert(user)
  } catch (err) {
    throw err
  }
}

async function getSingleUserHistory (username) {
  try {
    const user = await findOne(username)
    if(user) {
      const history = await knex('logsession').select('*').where({ username })
      delete user.password
      user.history = history
      return user
    }
  } catch (err) {
    throw err
  }
}

// Block or unblock a user. supply an object
// in the form { username, block }
// where username is the username for the user
// and block is the boolean value of the
// blocked status you want to give the user
async function blockUser ({ username, block }) {
  try {
    return await knex('users').where({ username }).update({ blocked: block })
  } catch (err) {
    throw err
  }
}

// Gets the time limits of a particula account type
// Supply the account type
async function getUserTypeTimelimits ( userType ) {
  try {
    const timeLimits = await knex('time_limit').select('*').where({ user_type: userType })
    return timeLimits[0]
  } catch (err) {
    throw err
  }
}

// creates a new time limit in the database
// Supply an object { userType, timeLimits }
async function createUserTypeTimelimits ({ userType, timeLimits }) {
  try {
    await knex('time_limit').insert({ user_type: userType, time_limit: timeLimits })
  } catch (err) {
    if (err.code === '23505') throw { message: 'An account type with that name already exists. Try using a different name', status: 422 }
    throw { message: 'Something really nasty happened. Contact the developer of the software <kgparadzayi@gmail.com>', code: 500 }
  }
}

// creates a new time limit in the database
// Supply an object { userType, timeLimits }
async function updateUserTypeTimelimits ({ userType, timeLimits }) {
  try {
    return await knex('time_limit').where({ user_type: userType }).update({ time_limit: timeLimits })
  } catch(err) {
    throw { message: 'Something really nasty happened. Contact the developer of the software <kgparadzayi@gmail.com>', code: 500 }
  }
}

// returns an array with all the userType timelimits
async function getAllUserTypeTimelimits () {
  try {
   return await knex('time_limit').select('*')
  } catch (err) {
    throw err
  }
}

module.exports = {
  findOne,
  createUser,
  deleteUser,
  login,
  logout,
  getAllUsers,
  getAllOnlineUsers,
  getSingleUserHistory,
  blockUser,
  changePassword,
  getAllUserTypeTimelimits,
  getUserTypeTimelimits,
  createUserTypeTimelimits,
  updateUserTypeTimelimits
}