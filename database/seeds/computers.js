
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('computers').del()
    .then(function () {
      // Inserts seed entries
      return knex('computers').insert([
        { name: 'computer1', created_at: new Date },
        { name: 'computer2', created_at: new Date },
        { name: 'computer3', created_at: new Date },
        { name: 'computer4', created_at: new Date },
        { name: 'computer5', active: false, created_at: new Date }
      ])
    })
}
