'use strict'

module.exports.mount = app => {
	const errorHandlers = require('../utils/errorHandlers');
	
	// If that above routes didnt work, we 404 them and forward to error handler
	app.use(errorHandlers.notFound);

	// Otherwise this was a really bad error we didn't expect! Shoot eh
	if (app.get('env') === 'development') {
	/* Development Error Handler - Prints stack trace */
	app.use(errorHandlers.developmentErrors);
	}

	// production error handler
	app.use(errorHandlers.productionErrors);
}