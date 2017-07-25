const knex = require('../../database')
const { buildResponse } = require('../../utils/responseService')

module.exports = (req, res) => {
   // first query the database if the migration table exists
   // TODO: check if the migrations are upto-date
   knex('knex_migrations').select('*')
    .then(response => {
      // if a rollback has been done, the response will be an empty array. migrate the latest
      if (response.length === 0) return migrateSeedAndRespond(res)

      buildResponse(res, 200, {
        message: 'Database is already upto-date'
      })
    })

    // knex_migration does not exist. migrate to the latest
    .catch(error => migrateSeedAndRespond(res))
}

/**
 * Run migrations, seeds and then respond to the request
 */
function migrateSeedAndRespond (res) {
  knex.migrate.latest()
    .then(() => knex.seed.run())

    .then(response => buildResponse(res, 200, { message: 'Successfully applied the database migrations' }))    
    .catch(error => buildResponse(res, 500, error))
  }