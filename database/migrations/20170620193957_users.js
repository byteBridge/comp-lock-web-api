
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', table => {
    table.string('username').primary()
    table.string('password').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
    table.string('type').notNullable()
    table.string('gender').notNullable()
    table.string('f_name').notNullable()
    table.string('s_name').notNullable()
    table.boolean('blocked').defaultTo(false)
    table.string('email')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users')
};
