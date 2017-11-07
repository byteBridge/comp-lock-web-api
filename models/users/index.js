const knex = require('../../database')
const joi = require('./user.validation')
const User = function () {}

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
User.prototype.create = async function (user) {
  try {
    const { error, value } = joi.validate(user, { abortEarly: false })
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

module.exports = new User()