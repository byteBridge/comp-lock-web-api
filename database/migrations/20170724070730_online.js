
exports.up = function(knex, Promise) {
  return knex.schema.createTable('online', table => {
    table.string('username').primary()
    table.string('computer_name')
    table.string('login_time')
    table.string('login_date')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('online')
}
