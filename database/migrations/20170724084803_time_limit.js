
exports.up = function(knex, Promise) {
  return knex.schema.createTable('time_limit', table => {
    table.string('user_type').primary()
    table.string('time_limit')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('time_limit')
}
