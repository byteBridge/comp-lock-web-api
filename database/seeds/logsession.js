const moment = require('moment')


const logsession = [
  { username: 'denzel', computer_name: 'Computer2', log_date: moment().format('MM/DD/YYYY'), duration: '00:30:00', start_time: '10:00' }
]

exports.seed = (knex, Promise) => knex('logsession').del()
    .then(() => knex('logsession').insert(logsession))

