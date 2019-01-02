
const jwt = require('jsonwebtoken')
const moment = require('moment')
function signToken () {
  return jwt.sign({
    computer_name: 'computer1',
    exp: moment().add(30, 'd').unix()
  }, process.env.JWT_SECRET)
}
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('computers').del()
    .then(function () {
      // Inserts seed entries
      return knex('computers').insert([
        {
          name: 'computer1',
          created_at: new Date,
          activation_token: signToken(),
          token_expiry_time: moment().add(30, 'd'),
          token_paid_time: moment(),
          is_paid_for: true
        },
        { name: 'computer2', created_at: new Date },
        { name: 'computer3', created_at: new Date },
        { name: 'computer4', created_at: new Date },
        { name: 'computer5', active: false, created_at: new Date }
      ])
    })
}
