'use strict'

const router = require('express').Router()
const { allUsers, singleUser, singleUserHistory, blockUser, unblockUser } = require('./userController')
const { authenticate } = require('../../utils/middlewareService')

router.get('/:username', authenticate, singleUser)
router.put('/:username/block', authenticate, blockUser)
router.put('/:username/unblock', authenticate, unblockUser)
router.get('/:username/history', authenticate, singleUserHistory)
router.get('/', authenticate, allUsers)

module.exports = router