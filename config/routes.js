'use strict'

module.exports.mount = app => {
	const {
		loginRoutes,
		logoutRoutes,
		registerRoutes,
		secretRoutes,
		restoreDatabaseRoutes
	} = require('../api/indexRoutes')

	app.use('/secret', secretRoutes)
	app.use('/auth/login', loginRoutes)
	app.use('/auth/logout', logoutRoutes)
	app.use('/auth/register', registerRoutes)
	app.use('/restore-database', restoreDatabaseRoutes)
}
