const controller = require('./auth.controller')
const router = require('express').Router()

// somehow this make it work. I'll have to look it up
// why it is behaving this way
const noop = (req, res, next) => { next() }
router.post('/login', controller.login)
router.post('/logout', controller.logout)

module.exports = router
