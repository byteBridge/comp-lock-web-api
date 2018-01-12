const knex = require('../../database')
const joi = require('./computer.validation')

module.exports = class Computer {
  async create (computer) {
    try {
      const { error, value } = joi.computer.validate(computer, { abortEarly: false })
      if (error) throw error

      const createdComputer = await knex('computers').insert(value).returning('*')
      return createdComputer[0]
    } catch (error) {
      if (error.code === '23505') throw { message: 'Computer already exists in the database', status: 422 }
      // error resulting from joi validation
      if (error.details && error.details.length > 0) throw { message: 'Validation errors occured', errors: error.details, status: 400 }
      throw error
    }
  }

  async getAllComputers () {
    try {
      const requiredFields = [
        'computers.name',
        'computers.active',
        'computers.created_at',
        'online.username',
        'online.login_time',
        'online.login_date',
        'online.computer_name'
      ]

      const computerData = await knex('computers')
        .leftJoin('online', 'computers.name', '=', 'online.computer_name')
        .select(...requiredFields)

      const statuses = {
        isInUse: 'in_use',
        isAvailable: 'available',
        isDeactivated: 'deactivated'
      }

      return computerData.map(computer => {
        if (computer.username) {
          computer.status = statuses.isInUse
        } else {
          computer.status = statuses.isAvailable
        }
  
        if (!computer.active) {
          computer.status = statuses.isDeactivated
        }
        return computer
      })
    } catch(err) {
      throw err
    }
  }

}