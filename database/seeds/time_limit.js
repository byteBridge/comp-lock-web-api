
const timeLimits = [
  { user_type: 'student', time_limit: '00:30' },
  { user_type: 'a-level', time_limit: '01:00' },
]

exports.seed = (knex, Promise) => knex('time_limit').del()
    .then(() => knex('time_limit').insert(timeLimits))

