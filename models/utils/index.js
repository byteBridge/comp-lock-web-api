const { generateToken } = require('../../utils/authService')
const moment = require('moment')

function successResponseToApi (dbUser) {
  // do not send the password to the client
  delete dbUser.password
  dbUser.token = generateToken({
    username: dbUser.username,
    exp: moment().add(7, 'd').unix()
  })

  return dbUser
}

function errorResponseToApi (error) {
  return {
    status: 401,
    message: error.message
  }
}

function checkTimeUsage (logs, timelimits) {
  const reply = {}
  if (logs.length === 0) {
    reply.time_up = false,
    reply.used_time = '00:00:00',
    reply.remaining_time = timelimits
    return reply
  }
  
  let hours = 0
    , minutes = 0
    , seconds = 0

  for (let i = 0; i < logs.length; i++) {
    const splitTime = logs[i].duration.split(':')
    hours +=  Number(splitTime[0])
    minutes += Number(splitTime[1])
    seconds +=  Number(splitTime[2])
  }
  
  // normalise seconds
  if (seconds > 59) {
    minutes += Math.floor(seconds / 60)
    seconds = Math.floor(seconds % 60)
  }
  
  // normalise minutes
  if (minutes > 59) {
    hours += Math.floor(minutes / 60)
    minutes = Math.floor(minutes % 60)
  }

  const time_limit = timelimits.split(':')

  let hourLimit = time_limit[0]
    , minutesLimit = time_limit[1]
  
  // Check if user exhausted allocated time_up
  reply.time_up = hours >= hourLimit && Number(hourLimit) !== 0 ||  minutes >= minutesLimit
  reply.used_time = `${hours}:${minutes}:${seconds}`
  reply.remaining_time = `${hourLimit - hours}:${minutesLimit - minutes}:0`
 
  return reply
}

module.exports = {
  successResponseToApi,
  errorResponseToApi,
  checkTimeUsage
}