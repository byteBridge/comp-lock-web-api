'use strict'

module.exports.
mount = app => {
	const usersRoutes = require('../models/users/user.routes')
	const authRoutes = require('../models/auth/auth.routes')
	const computerRoutes = require('../models/computers/computer.routes')
	const billingRoutes = require('../models/billing/routes')
	const restoreDatabaseRoutes = require('../models/restore-database/restore-database.routes')

	// tomake the travis builds succeed
	if (process.env.NODE_ENV !== 'test') {
		const clientSpaRoute = require('../client/route')
		app.use('/', clientSpaRoute)
	}

	app.use('/api/v1/users', usersRoutes)
	app.use('/api/v1/auth', authRoutes)
	app.use('/api/v1/computers', computerRoutes)
	app.use('/api/v1/billing', billingRoutes)
	app.use('/restore-database', restoreDatabaseRoutes)
}
