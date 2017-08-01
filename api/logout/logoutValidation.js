const joi = require('joi')

module.exports = joi.object().keys({
  username: joi.string().min(6).max(12).required(),
  start_time: joi.string().required(),
  computer_name: joi.string().required(),
  duration: joi.string().required(),
  log_date: joi.string().required()
})