exports.up = function(knex, Promise) {
  return knex.schema.createTable("transactions", table => {
    // Make an exception on the casing on the fields because paynow requires camel casing
    table.string("reference").primary();
    table.string("status");
    table.json("products");
    table.string("authemail");
    table.string("mobileNumber");
    table.string("mobileMoneyProvider");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("transactions");
};
