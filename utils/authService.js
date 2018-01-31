const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

/**
* Checks if the password provided by the user matches the password
* in the database
*/
async function comparePasswords (reqPass, dbPass) {
  return await bcrypt.compare(reqPass, dbPass) 
}

/**
 * Generate token for use when login in
 */
function generateToken (payload) {
  return 'JWT ' + jwt.sign(payload, process.env.JWT_SECRET)
}

/**
 * Verify the token. Verifies validity (tamper and expiry)
 */
function verifyToken (token, secretOrKey, options, callback) { 
  return jwt.verify(token, secretOrKey, options, callback)
}

/**
 * Hash the password for secure storage in the database 
 */
async function hashedPassword (password) {
  return await bcrypt.hash(password, 10)
}

module.exports = {
  comparePasswords,
  generateToken,
  verifyToken,
  hashedPassword
}