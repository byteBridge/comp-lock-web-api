    
const controller = require('./user.controller')
const router = require('express').Router()
const { authenticateAdmin } = require('../../utils/middlewareService')

router.post('/new', authenticateAdmin, controller.create)
module.exports = router
