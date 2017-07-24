
exports.up = function(knex, Promise) {
  return knex.schema.createTable('logsession', table => {
    table.string('username')
    table.string('comp_name')
    table.string('log_date')
    table.string('duration')
    table.string('start_time')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('logsession')
}
