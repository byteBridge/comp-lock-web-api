
exports.up = function(knex, Promise) {
  return knex.schema.createTable('computers', table => {
    table.string('name').primary()
    table.boolean('active').defaultTo(true)
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })   
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('computers')
}
