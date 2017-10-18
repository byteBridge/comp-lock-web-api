'use strict'

const { verifyToken } = require('../utils/authService')
const { buildResponse } = require('../utils/responseService')
const { JWT_SECRET } = process.env
/**
 * Handles errors for non existent routes
 */
function handle404 (req, res, next) {
	res.json({message: 'Route not found'})
}

/*
 *	Allow the api to be accessed from any domain
 */
function allowDomains (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Request-Method', '*')
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE')
	res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type')
	if ( req.method === 'OPTIONS' ) {
		res.writeHead(200);
		res.end();
		return;
	}
	next()
}

/**
 * Authentincate the user. Use when protecting api endpoints
 */
function authenticate (req, res, next) {
	const token = req.headers.authorization
	if (!token) return buildResponse(res, 401, { message: 'No token provided.'})

	verifyToken(token, JWT_SECRET, (err, decoded) => {
		if (err) return buildResponse(res, 401, { message: 'Unauthorized' })
		
		next()
	})
}

module.exports = {
	handle404,
	allowDomains,
	authenticate
}