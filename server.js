'use strict'

const app = require('./app')
const port = process.env.PORT

// start the server
app.listen(port, () => {
  console.log(`app running on port ${port}`)
})