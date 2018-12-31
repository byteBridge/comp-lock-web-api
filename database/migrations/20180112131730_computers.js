
exports.up = function(knex, Promise) {
  return knex.schema.createTable('computers', table => {
    table.string('name').primary()
    table.boolean('active').defaultTo(true)
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.string('last_used_by')
    table.timestamp('last_used_time'),

    // financial fields
    table.string('activation_token'),
    table.boolean('is_paid_for').defaultTo(false),
    table.timestamp('token_expiry_time'),
    table.timestamp('token_paid_time')
  })   
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('computers')
}
