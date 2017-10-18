const joi = require('joi')

const timeLimitsSchema = joi.object().keys({
    hours: joi.number().min(0).max(5).required(),
    minutes: joi.number().min(0).max(59).required()
})

module.exports = { timeLimitsSchema }