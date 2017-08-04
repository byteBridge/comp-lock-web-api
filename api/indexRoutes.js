const loginRoutes = require('./login/loginRoutes')
const logoutRoutes = require('./logout/logoutRoutes')
const registerRoutes = require('./register/registerRoutes')
const secretRoutes = require('./secret/secretRoutes')
const restoreDatabaseRoutes = require('./restore-database/restore-databaseRoutes')

module.exports = {
  loginRoutes,
  logoutRoutes,
  registerRoutes,
  secretRoutes,
  restoreDatabaseRoutes
}
