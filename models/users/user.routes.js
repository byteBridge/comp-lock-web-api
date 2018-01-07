    
const controller = require('./user.controller')
const router = require('express').Router()
const { authenticateAdmin, authenticate } = require('../../utils/middlewareService')

router.post('/new', authenticateAdmin, controller.create)
// Returns a list of users
router.get('/', authenticate, controller.allUsers)
router.get('/online', authenticateAdmin, controller.allOnlineUsers)

// The timelimits stuff
router.post('/timelimits/new', authenticateAdmin, controller.createUserTypeTimelimits)
router.get('/timelimits', authenticate, controller.getAllUserTypeTimelimits)
router.get('/timelimits/:userType', authenticate, controller.getUserTypeTimelimits)
router.put('/timelimits/:userType', authenticateAdmin, controller.updateUserTypeTimelimits)

// The specific user stuff
router.get('/:username', authenticate, controller.singleUser)
router.delete('/:username', authenticate, controller.deleteUser)
router.put('/:username/block', authenticateAdmin, controller.blockUser)
router.put('/:username/unblock', authenticateAdmin, controller.unblockUser)
router.put('/:username/password', authenticate, controller.changePassword)
router.get('/:username/history', authenticate, controller.singleUserHistory)

module.exports = router
