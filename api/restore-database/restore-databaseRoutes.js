const restoreDatabaseController = require('./restore-databaseController')
const router = require('express').Router()

router.post('/', restoreDatabaseController)

module.exports = router