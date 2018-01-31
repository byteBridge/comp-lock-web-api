const router = require('express').Router()
const controller = require('./computer.controller')

const { authenticateAdmin, authenticate } = require('../../utils/middlewareService')

router.post('/new', authenticateAdmin, controller.create)
router.get('/', authenticate, controller.getAllComputers)
router.put('/deactivate', authenticateAdmin, controller.deactivate)
router.put('/reactivate', authenticateAdmin, controller.reactivate)
router.delete('/unregister', authenticateAdmin, controller.unregister)

module.exports = router
