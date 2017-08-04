const logout = require('./logoutController')
const router = require('express').Router()

router.post('/', logout)

module.exports = router
