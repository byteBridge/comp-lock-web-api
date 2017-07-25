const loginRoutes = require('./login/loginRoutes')
const registerRoutes = require('./register/registerRoutes')
const secretRoutes = require('./secret/secretRoutes')
const restoreDatabaseRoutes = require('./restore-database/restore-databaseRoutes')

module.exports = {
  loginRoutes,
  registerRoutes,
  secretRoutes,
  restoreDatabaseRoutes
}
