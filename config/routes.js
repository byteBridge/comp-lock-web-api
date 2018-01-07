'use strict'

module.exports.mount = app => {
	const {
		loginRoutes,
		logoutRoutes,
		registerRoutes,
		secretRoutes,
		userRoutes,
		restoreDatabaseRoutes
	} = require('../api/indexRoutes')
	const usersRoutes = require('../models/users/user.routes')
	const authRoutes = require('../models/auth/auth.routes')
	// tomake the travis builds succeed
	if (process.env.NODE_ENV !== 'test') {
		const clientSpaRoute = require('../client/route')
		app.use('/', clientSpaRoute)
	}
	app.use('/api/v1/users', usersRoutes)
	app.use('/api/v1/auth', authRoutes)
	app.use('/secret', secretRoutes)
	app.use('/users', userRoutes)
	app.use('/auth/login', loginRoutes)
	app.use('/auth/logout', logoutRoutes)
	app.use('/auth/register', registerRoutes)
	app.use('/restore-database', restoreDatabaseRoutes)
}
