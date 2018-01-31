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

// from JWT fji34uyr83 to fji34uyr83
// or from BEAREr dfdkfjdkfjdk to dfdkfjdkfjdk
function parseAuthHeader (req) {
	// proposal to use standard schemes in this case JWT <token>
	const authHeader = req.headers.authorization ? req.headers.authorization.split(' ') : []
	return authHeader.length > 0 ? authHeader[1] : ''
}

/**
 * Authentincate the user. Use when protecting api endpoints
 */
function authenticate (req, res, next) {
	const token = parseAuthHeader(req)
	if (!token) return buildResponse(res, 401, { message: 'No token provided.'})

	verifyToken(token, JWT_SECRET, (err, decoded) => {
		if (err) return buildResponse(res, 401, { message: 'Unauthorized' })
		
		next()
	})
}

function authenticateAdmin (req, res, next) {
	const token = parseAuthHeader(req)
	if (!token) return buildResponse(res, 401, { message: 'No token provided.'})

	verifyToken(token, JWT_SECRET, (err, decoded) => {
		if (err) return buildResponse(res, 401, { message: 'Unauthorized' })
		if (decoded.type !== 'administrator') return buildResponse(res, 401, { message: 'Access denied. Login as administrator to continue.' })
		next()
	})
}

module.exports = {
	handle404,
	allowDomains,
	authenticate,
	authenticateAdmin
}