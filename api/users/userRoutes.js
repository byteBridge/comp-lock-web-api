'use strict'

const router = require('express').Router()
const {
    allUsers,
    allOnlineUsers,
    singleUser,
    deleteUser,
    singleUserHistory,
    blockUser,
    unblockUser,
    getAllUserTypeTimelimits,
    getUserTypeTimelimits,
    createUserTypeTimelimits,
    updateUserTypeTimelimits
} = require('./userController')
const { authenticate } = require('../../utils/middlewareService')

// Returns a list of users
router.get('/', authenticate, allUsers)
router.get('/online', authenticate, allOnlineUsers)

// The timelimits stuff
router.post('/timelimits/new', authenticate, createUserTypeTimelimits)
router.get('/timelimits', authenticate, getAllUserTypeTimelimits)
router.get('/timelimits/:userType', authenticate, getUserTypeTimelimits)
router.put('/timelimits/:userType', authenticate, updateUserTypeTimelimits)

// The specific user stuff
router.get('/:username', authenticate, singleUser)
router.delete('/:username', authenticate, deleteUser)
router.put('/:username/block', authenticate, blockUser)
router.put('/:username/unblock', authenticate, unblockUser)
router.get('/:username/history', authenticate, singleUserHistory)

module.exports = router