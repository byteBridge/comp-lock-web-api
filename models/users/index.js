const knex = require('../../database')
const joi = require('./user.validation')
const moment = require('moment')
const { generateToken, comparePasswords } = require('../../utils/authService')
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
      
      // after passwords match and the user is using the web client resolve
      if(!computer_name) return dbUser

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
    } catch (err) {
      throw err
    }
  }
}
