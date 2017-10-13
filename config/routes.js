'use strict'

module.exports.mount = app => {
	const clientSpaRoute = require('../client/route')
	const {
		loginRoutes,
		logoutRoutes,
		registerRoutes,
		secretRoutes,
		userRoutes,
		restoreDatabaseRoutes
	} = require('../api/indexRoutes')

	app.use('/', clientSpaRoute)
	app.use('/secret', secretRoutes)
	app.use('/users', userRoutes)
	app.use('/auth/login', loginRoutes)
	app.use('/auth/logout', logoutRoutes)
	app.use('/auth/register', registerRoutes)
	app.use('/restore-database', restoreDatabaseRoutes)
}
