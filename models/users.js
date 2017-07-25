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

function login (username, password) {
  return new Promise((resolve, reject) => {
    getStudentProfile(username)
      .then(console.log)
      .catch(console.log)
      
    knex('users').select().where({ username })
      .then(user => {
        if (user.length) {
          if (comparePasswords(password, user[0].password) === true) {
            return resolve(generateToken({
              username: user[0].username,
              exp: moment().add(7, 'd').unix()
            }))
          } else {
            //invalid password
            reject({ status: 401 })
          }
        }
        // user not found
        reject({ status: 401 })
      })

      .catch(err => {
        reject()
      })
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
    if (!dbUser) return reject('invalid username')
    
    // is user password valid?
    if (!comparePasswords(password, dbUser.password)) return reject('Invalid password')
    
    // is user blocked?
    if (dbUser.blocked === true) return reject('Student blocked')
    
    // is user online?
    if (dbUser.login_time !== null) return reject('Student already logged in')
    
    // if all is well, pass on the user to the
    // next function in the promise chain
    resolve(dbUser)
  })
}

module.exports = {
  findOne,
  createUser,
  login,
  getAllUsers
}
module.exports.comparePasswords = comparePasswords