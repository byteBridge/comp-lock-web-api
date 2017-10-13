'use strict'

const router = require('express').Router()
const { allUsers, singleUser, singleUserHistory } = require('./userController')
const { authenticate } = require('../../utils/middlewareService')

router.get('/:username', authenticate, singleUser)
router.get('/:username/history', authenticate, singleUserHistory)
router.get('/', authenticate, allUsers)

module.exports = router