const router = require('express').Router()
const controller = require('./computer.controller')

const { authenticateAdmin, authenticate } = require('../../utils/middlewareService')

router.post('/new', authenticateAdmin, controller.create)
router.get('/', authenticate, controller.getAllComputers)
router.put('/deactivate', authenticateAdmin, controller.getAllComputers)

module.exports = router
