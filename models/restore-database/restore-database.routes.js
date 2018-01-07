const restoreDatabaseController = require('./restore-database.controller')
const router = require('express').Router()

router.post('/', restoreDatabaseController)

module.exports = router