const knex = require('../../database')
const { buildResponse } = require('../../utils/responseService')

module.exports = async (req, res) => {
   // first query the database if the migration table exists
   // TODO: check if the migrations are upto-date
    try {
      const response = await knex('knex_migrations').select('*')
      // if a rollback has been done, the response will be an empty array. migrate the latest
      if (response.length === 0) return migrateSeedAndRespond(res)

      buildResponse(res, 200, {
        message: 'Database is already upto-date'
      })
    } catch (error) {
      // knex_migration does not exist. migrate to the latest
      return migrateSeedAndRespond(res)
    }
}

/**
 * Run migrations, seeds and then respond to the request
 */
async function migrateSeedAndRespond (res) {
  try {
    await knex.migrate.latest()
    await knex.seed.run()

    buildResponse(res, 200, { message: 'Successfully applied the database migrations' })
  } catch (error) {
    buildResponse(res, 500, error)
  }
}