const login = require('./auth.controller')
const router = require('express').Router()

// somehow this make it work. I'll have to look it up
// why it is behaving this way
const noop = (req, res, next) => { next() }
router.post('/login', login)

module.exports = router
