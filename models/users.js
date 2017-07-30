const { hashedPassword, comparePasswords, generateToken } = require('../utils/authService')
const knex = require('../database')
const moment = require('moment')

function findOne (username) {
  return new Promise((resolve, reject) => {
    knex('users').select().where({username})

      // success
      .then(user => {
        if (user) { resolve(user[0]) }
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


function getAllUsers () {
  return new Promise((resolve, reject) => {
    knex('users').select()
      .then(resolve)
      .catch(reject)
  })
}

function login (credentials) {
  return new Promise((resolve, reject) => {
    const { username, password } = credentials
    
    getStudentProfile(username)
      // successfully got profile
      .then(dbUser => {
        checkValidity(dbUser, password)

         // successfully checked user validity
         .then(dbUser => {
           if (dbUser.type === 'administrator') {

            // resolve the admin here
            return resolve(successResponseToApi(dbUser))
           } else {
            checkTimeLimits(dbUser)
             
              // successfully checked time limits
              .then(dbUser => {
                goOnline(dbUser.username)
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

function checkValidity (dbUser, password) {
  return new Promise((resolve, reject) => {
    // does user exist?
    if (!dbUser) return reject({ message: 'invalid login details' })
    
    // is user password valid?
    if (!comparePasswords(password, dbUser.password)) return reject({ message: 'invalid login details' })
    
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

function goOnline (username) {
  return new Promise((resolve, reject) => {
    // user information we neet to place him/her online
    const userMetaData = {
      username,
      computer_name: 'Kudakwashe Paradzayi',
      login_time: `${moment().hours()}:${moment().minutes()}:${moment().seconds()}`,
      login_date: new Date()
    }

    // Register the user online in the database
    knex('online').insert(userMetaData).then(resolve).catch(reject)
  })
}
module.exports = {
  findOne,
  createUser,
  login,
  getAllUsers
}