const knex = require('../../database')
const joi = require('./user.validation')
const moment = require('moment')
const { generateToken, comparePasswords, hashedPassword } = require('../../utils/authService')
const { checkTimeUsage, successResponseToApi, errorResponseToApi } = require('../utils')

module.exports = class User {

  /**
   * @param {*} user The user which is to be entered into the database
   * @example
   *  user = {
   *   f_name: 'Tapiwanashe',
   *   s_name: 'makotose',
   *   type: 'student',
   *   gender: 'Male',
   *   username: 'tapsmakots',
   *   password: 'oi3y4384ieurhgi3h4',
   *   email: 'taps@goo.com'
   * }
   */
  async create (user) {
    try {
      const { error, value } = joi.newUser.validate(user, { abortEarly: false })
      if (error) throw error
      value.password = await hashedPassword(value.password)
      console.log(value)
      const createdUser = await knex('users').insert(value).returning('*')
      return createdUser[0]
    } catch (error) {
      if (error.code === '23505') throw { message: 'User already exists in the database', status: 422 }
      // error resulting from joi validation
      if (error.details && error.details.length > 0) throw { message: 'Validation errors occured', errors: error.details, status: 400 }
      throw error
    }
  }

  async login (credentials) {
    try {
      const { error, value } = joi.login.validate(credentials, { abortEarly: false })
      if (error) throw error

      const { username, password, computer_name } = credentials
      const studentProfile = await this.getStudentProfile(username)
      const validatedUser = await this.checkValidity(studentProfile, { password, computer_name })

      // if admin resolve imediately
      if (validatedUser.type === 'administrator' || !computer_name) return successResponseToApi(validatedUser)
      
      const userWithTimeLimits = await this.checkTimeLimits(validatedUser)
      await this.goOnline({ username, computer_name })
      // finally resolve for the student here
      return successResponseToApi(userWithTimeLimits)
      } catch (error) {
        // error resulting from joi validation
        if (error.details && error.details.length > 0) throw { message: 'Validation errors occured', errors: error.details, status: 400 }
        throw error.message ? errorResponseToApi(error) : error
      }
    
  }

  /**
   * @param {*} username The username of the required student
   * @returns Returns a user from the database
   */
  async findOne (username) {
    try {
      if (!username || username === '') throw { message: 'Username is required' }
      const foundUser = await knex('users').where({ username }).select('*')
      if (foundUser.length === 0) throw { message: 'The username provided did not match any user in our records' }
      delete foundUser[0].password
      return foundUser[0]
    } catch (error) {
      throw error
    }
  }
  /*********************************************PRIVATE METHODS***********************************/

  async getStudentProfile (username) {
    try {
      const requiredFields = [
        'users.username',
        'users.f_name',
        'users.s_name',
        'users.password',
        'users.blocked',
        'users.gender',
        'users.email',
        'users.created_at',
        'users.updated_at',
        'users.type',
        'online.login_time',
        'online.computer_name',
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

  async checkValidity (dbUser, options) {
    try {
      const { password, computer_name } = options

      // does user exist?
      if (!dbUser) throw { message: 'invalid login details' }
      
      // is user password valid?
      if (! await comparePasswords(password, dbUser.password)) throw ({ message: 'invalid login details' })
      
      // if the user is an admin resolve immediately
      // after passwords match and the user is using the web client resolve
      if (dbUser.type === 'administrator' || !computer_name)  return dbUser

      // is the computer available for use (is registered and active)
      const computer = await knex('computers').where({ name: computer_name }).select().first()
      
      if (!computer) {
        throw ({ message: `The computer, ${computer_name} is not registered. Consult the admin to register the computer for you.` })
      } else if (computer.active === false) {
        throw ({ message: `The computer, ${computer_name} was deactivated. Consult the admin to re activate the computer for you.` })
      }

      // is user blocked?
      if (dbUser.blocked === true) throw { message: `We regret to inform you that your account qualifies to be blocked. Report by the librarian's desk to have it unblocked` }
      
      // is user online?
      if (dbUser.login_time !== null) throw { message: `Your account is already signed in on computer: ${computer_name}` }
      
      // if all is well, pass on the user to the
      // next function in the promise chain
      return dbUser
    } catch (err) {
      throw err
    }
  }

  async checkTimeLimits (dbUser) {
    try {
      const today = moment().format('MM/DD/YYYY')
      const logs = await knex('logsession')
        .select()
        .where({
          log_date: today,
          username: dbUser.username
        })
      
      Object.assign(dbUser, checkTimeUsage(logs, dbUser.time_limit))
      if (dbUser.time_up) throw { message: 'We regret to inform you that you have used up the time allocated to your account. Please come back tomorrow for more research.' }
      
      return dbUser
    } catch (err) {
      throw err
    }
  }

  async goOnline (user) {
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
      await knex('computers').where({ name: computer_name }).update({ last_used_by: username, last_used_time: new Date() })
    } catch (err) {
      throw err
    }
  }

  /************************ borrowed methods from original users.js file */
  // deletes the user from the sytem. Supply username
  async deleteUser (username = '') {
    try {
      await knex('users').where({username}).del()
    } catch (err) {
      throw err
    }
  }

  // Chages the yser password ater verifying that the supplied password
  // is correct. Duply { username, currentPassword, newPassword }
  async changePassword ({ username, currentPassword, newPassword }) {
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

  async getAllUsers () {
    try {
      return await knex('users').select()
    } catch (err) {
      throw err
    }
  }


  async logout (user) {
    try {
      const username = user.username || '' // deal with undefineds
      await knex('online').where({ username }).del()
      await knex('logsession').insert(user)
    } catch (err) {
      throw err
    }
  }

  async  getSingleUserHistory (username) {
    try {
      const user = await this.findOne(username)
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
  async  blockUser ({ username, block }) {
    try {
      return await knex('users').where({ username }).update({ blocked: block })
    } catch (err) {
      throw err
    }
  }

  // Gets the time limits of a particula account type
  // Supply the account type
  async  getUserTypeTimelimits ( userType ) {
    try {
      const timeLimits = await knex('time_limit').select('*').where({ user_type: userType })
      return timeLimits[0]
    } catch (err) {
      throw err
    }
  }

  // creates a new time limit in the database
  // Supply an object { userType, timeLimits }
  async  createUserTypeTimelimits ({ userType, timeLimits }) {
    try {
      await knex('time_limit').insert({ user_type: userType, time_limit: timeLimits })
    } catch (err) {
      if (err.code === '23505') throw { message: 'An account type with that name already exists. Try using a different name', status: 422 }
      throw { message: 'Something really nasty happened. Contact the developer of the software <kgparadzayi@gmail.com>', code: 500 }
    }
  }

  // creates a new time limit in the database
  // Supply an object { userType, timeLimits }
  async  updateUserTypeTimelimits ({ userType, timeLimits }) {
    try {
      return await knex('time_limit').where({ user_type: userType }).update({ time_limit: timeLimits })
    } catch(err) {
      throw { message: 'Something really nasty happened. Contact the developer of the software <kgparadzayi@gmail.com>', code: 500 }
    }
  }

  // returns an array with all the userType timelimits
  async  getAllUserTypeTimelimits () {
    try {
    return await knex('time_limit').select('*')
    } catch (err) {
      throw err
    }
  }


  async getAllOnlineUsers () {
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

  async clearOnlineUser ({ username }) {
    try {
      username = username || ''
      await knex('online').where({ username }).del()
    } catch (error) {
      throw error
    }
  }
}
