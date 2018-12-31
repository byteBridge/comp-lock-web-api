const router = require('express').Router()
const controller = require('./billing.controller')

const { authenticateAdmin } = require('../../utils/middlewareService')
const { catchErrors } = require('../../utils/errorHandlers')

router.post('/subscribe', authenticateAdmin, catchErrors(controller.initiateSubscription))
router.get('/ping-subscription/:reference', authenticateAdmin, catchErrors(controller.pingSubscription))
router.get('/last-transaction', authenticateAdmin, catchErrors(controller.getLastTransaction))

module.exports = router