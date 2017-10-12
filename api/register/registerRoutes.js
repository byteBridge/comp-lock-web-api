const register = require('./registerController')
const router = require('express').Router()
const { authenticate } = require('../../utils/middlewareService')

router.post('/', authenticate, register)

module.exports = router
