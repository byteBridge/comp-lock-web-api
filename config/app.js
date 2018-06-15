'use strict'

module.exports.mount = (app, express) => {
 	// Before anything, congigure the process enmvironment
	require('./init').setEnvironment()

	const { allowDomains } = require('../utils/middlewareService')
	const bodyParser = require('body-parser')
	const logger = require('morgan')
	const helmet = require('helmet')
	const path = require('path')

	/* APP MIDDLEWARE */
	app.use(allowDomains)
	app.use(logger('dev'))

	// some protection via setting appropriate headers
	app.use(helmet())
	app.use(bodyParser.urlencoded({ extended: false }))
	app.use(bodyParser.json())
	app.use('/static', express.static(path.join(__dirname, '..', 'client', 'static')))
}
