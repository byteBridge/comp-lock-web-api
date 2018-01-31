const joi = require('joi')

module.exports.computer = joi.object({
  name: joi.string().required(),
  created_at: joi.date()
})