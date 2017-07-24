const bcrypt = require('bcryptjs')

const users = [
  {
    username: 'kudakwashe',
    password: hashedPassword('paradzayi'),
    type: 'administrator',
    f_name: 'Kudakwashe',
    s_name: 'Paradzayi',
    email: 'kgparadzayi@gmail.com'
  },
  {
    username: 'garikai',
    password: hashedPassword('rodneygg'),
    type: 'student',
    f_name: 'Garikai',
    s_name: 'Gumbo',
    email: 'grod56@gmail.com'
  }
]

function hashedPassword (password) {
  return bcrypt.hashSync(password, 10)
}

exports.seed = (knex, Promise) => knex('users').del()
    .then(() => knex('users').insert(users))
