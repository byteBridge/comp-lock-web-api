
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('computers').del()
    .then(function () {
      // Inserts seed entries
      return knex('computers').insert([
        { name: 'computer1', created_at: new Date }
      ])
    })
}
