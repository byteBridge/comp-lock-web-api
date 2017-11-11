const bcrypt = require('bcryptjs')

const users = [
  {
    username: 'kudakwashe',
    password: hashedPassword('paradzayi'),
    type: 'administrator',
    f_name: 'Kudakwashe',
    s_name: 'Paradzayi',
    gender: 'M',
    email: 'kgparadzayi@gmail.com'
  },
  {
    username: 'garikai',
    password: hashedPassword('rodneygg'),
    type: 'student',
    f_name: 'Garikai',
    s_name: 'Gumbo',
    gender: 'M',
    email: 'grod56@gmail.com'
  },
  {
    username: 'denzel',
    password: hashedPassword('makombeshushi'),
    type: 'student',
    f_name: 'Denzel',
    s_name: 'Makombe',
    gender: 'M',
    email: 'dm@gmail.com'
  },
  {
    username: 'stephen',
    password: hashedPassword('kundicme'),
    type: 'student',
    f_name: 'Stephen',
    s_name: 'Makombe',
    gender: 'M',
    email: 'djstavo@gmail.com',
    blocked: true
  }
]

function hashedPassword (password) {
  return bcrypt.hashSync(password, 10)
}

exports.seed = (knex, Promise) => knex('users').del()
    .then(() => knex('users').insert(users))
