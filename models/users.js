const { hashedPassword, comparePasswords, generateToken } = require('../utils/authService')
const knex = require('../database')
const moment = require('moment')

function findOne (username) {
  return new Promise((resolve, reject) => {
    knex('users').select().where({username})

      // success
      .then(user => {
        if (user) {
          if (user.length) delete user[0].password
          resolve(user[0])
        }
        else { resolve(null) }
      })

      // error
      .catch(err => reject(err))
  })
}



function createUser (user) {
  return new Promise((resolve, reject) => {
    user.password = hashedPassword(user.password)
    knex('users').insert(user).returning('*')
      .then(resolve)
      .catch(reject)
  })
}

// deletes the user from the sytem. Supply username
function deleteUser (username = '') {
  return new Promise((resolve, reject) => {
    knex('users').where({username}).del()
      .then(resolve)
      .catch(reject)
  })
}

function getAllUsers () {
  return new Promise((resolve, reject) => {
    knex('users').select()
      .then(resolve)
      .catch(reject)
  })
}

function login (credentials) {
  return new Promise((resolve, reject) => {
    const { username, password, computer_name } = credentials
    
    getStudentProfile(username)
      // successfully got profile
      .then(dbUser => {
        checkValidity(dbUser, { password, computer_name })

         // successfully checked user validity
         .then(dbUser => {
           if (dbUser.type === 'administrator') {

            // resolve the admin here
            return resolve(successResponseToApi(dbUser))
           } else {

            /**
             * If the computer_name is not specified, the user has used
             * the web client to log in to the application.
             * Respond with only the token and a bit of user info
             */
            if (!computer_name) return resolve(successResponseToApi(dbUser))

            checkTimeLimits(dbUser)
             
              // successfully checked time limits
              .then(dbUser => {
                goOnline({
                  username: dbUser.username,
                  computer_name
                })
                  .then(() => resolve(successResponseToApi(dbUser)))
                  .catch(() => reject(errorResponseToApi({ message: 'Something happened and we could not put you online. Please try again' })))
              })

              // failed to check time limits
              .catch((error) => reject(errorResponseToApi(error)))
           }
         })

        // User is not valid for login
        .catch((error) => reject(errorResponseToApi(error)))
      })

      // failed to get user profile
      .catch(() => reject())

    })
}

function getStudentProfile (username) {
  return new Promise((resolve, reject) => {
    const requiredFields = [
      'users.username',
      'users.f_name',
      'users.s_name',
      'users.password',
      'users.blocked',
      'users.type',
      'online.login_time',
      'time_limit.time_limit'
    ]

    knex('users')
      .leftJoin('online', 'users.username', '=', 'online.username')
      .leftJoin('time_limit', 'users.type', '=', 'time_limit.user_type')
      .select(...requiredFields)
      .where('users.username', '=', username)

      .then(res => {
        resolve(res[0])
      })
      .catch(reject)
  })
}

function checkValidity (dbUser, options) {
  return new Promise((resolve, reject) => {
    const { password, computer_name } = options

    // does user exist?
    if (!dbUser) return reject({ message: 'invalid login details' })
    
    // is user password valid?
    if (!comparePasswords(password, dbUser.password)) return reject({ message: 'invalid login details' })
    
    // after passwords match and the user is using the web client resolve
    if(!computer_name) return resolve(dbUser)

    // is user blocked?
    if (dbUser.blocked === true) return reject({ message: `We regret to inform you that your account qualifies to be blocked. Report by the librarian's desk to have it unblocked` })
    
    // is user online?
    if (dbUser.login_time !== null) return reject({ message: 'Your account is already signed in on another computer. Sign out and try again.' })
    
    // if all is well, pass on the user to the
    // next function in the promise chain
    resolve(dbUser)
  })
}

function checkTimeLimits (dbUser) {
  return new Promise((resolve, reject) => {
    const today = moment().format('MM/DD/YYYY')
    knex('logsession')
      .select()
      .where({
        log_date: today,
        username: dbUser.username
      })
      .then(logs => {

        if (logs.length === 0) {
          Object.assign(dbUser, { remaining_time: dbUser.time_limit, used_time: '00:00:00' })
          return resolve(dbUser)
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
        if (hours >= hourLimit && hourLimit !=='00') return reject({ message: 'We regret to inform you that you have used up the time allocated to your account. Please come back tomorrow for more research.'})
        if (minutes >= minutesLimit) return reject({ message: 'We regret to inform you that you have used up the time allocated to your account. Please come back tomorrow for more research.'})
        
        const usedTime = `${hours}:${minutes}:${seconds}`
        const remainingTime = `${hourLimit - hours}:${minutesLimit - minutes}:00`

        Object.assign(dbUser, { remaining_time: remainingTime, used_time: usedTime })

        resolve(dbUser)
      })
      .catch(reject)
  })
}

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

function errorResponseToApi (error) {
  return {
    status: 401,
    message: error.message
  }
}

function goOnline (user) {
  const { username, computer_name } = user
  return new Promise((resolve, reject) => {
    // user information we neet to place him/her online
    const userMetaData = {
      username,
      computer_name,
      login_time: `${moment().hours()}:${moment().minutes()}:${moment().seconds()}`,
      login_date: new Date()
    }

    // Register the user online in the database
    knex('online').insert(userMetaData).then(resolve).catch(reject)
  })
}

function logout (user) {
  return new Promise((resolve, reject) => {
    const username = user.username || '' // deal with undefineds

    knex('online').where({ username }).del()
      .then(() => knex('logsession').insert(user))
      .then(resolve)
      .catch(reject)
  })
}

function getSingleUserHistory (username) {
  return new Promise((resolve, reject) => {
    findOne(username).then(user => {
      knex('logsession').select('*').where({ username })
      .then(history => {
        delete user.password
        user.history = history
        resolve(user)
      })
      .catch(reject)
    })
    .catch(reject)
    
  })
}

// Block or unblock a user. supply an object
// in the form { username, block }
// where username is the username for the user
// and block is the boolean value of the
// blocked status you want to give the user
function blockUser ({ username, block }) {
  return new Promise((resolve, reject) => {
    knex('users').where({ username }).update({ blocked: block })
      .then(resolve)
      .catch(reject)
  })
}

// Gets the time limits of a particula account type
// Supply the account type
function getUserTypeTimelimits ( userType ) {
  return new Promise((resolve, reject) => {
    knex('time_limit').select('*').where({ user_type: userType })
      .then(data => resolve(data[0]))
      .catch(reject)
  })
}

// creates a new time limit in the database
// Supply an object { userType, timeLimits }
function createUserTypeTimelimits ({ userType, timeLimits }) {
  return new Promise((resolve, reject) => {
    knex('time_limit').insert({ user_type: userType, time_limit: timeLimits })
      .then(resolve)
      .catch(err => {
        if (err.code === '23505') return reject({ message: 'An account type with that name already exists. Try using a different name', status: 422})
        reject({ message: 'Something really nasty happened. Contact the developer of the software <kgparadzayi@gmail.com>', code: 500 })
      })
  })
}

// creates a new time limit in the database
// Supply an object { userType, timeLimits }
function updateUserTypeTimelimits ({ userType, timeLimits }) {
  return new Promise((resolve, reject) => {
    knex('time_limit').where({ user_type: userType }).update({ time_limit: timeLimits })
      .then(resolve)
      .catch(err => {
        reject({ message: 'Something really nasty happened. Contact the developer of the software <kgparadzayi@gmail.com>', code: 500 })
      })
  })
}

// returns an array with all the userType timelimits
function getAllUserTypeTimelimits () {
  return new Promise((resolve, reject) => {
    knex('time_limit').select('*')
      .then(resolve)
      .catch(reject)
  })
}
module.exports = {
  findOne,
  createUser,
  deleteUser,
  login,
  logout,
  getAllUsers,
  getSingleUserHistory,
  blockUser,
  getAllUserTypeTimelimits,
  getUserTypeTimelimits,
  createUserTypeTimelimits,
  updateUserTypeTimelimits
}