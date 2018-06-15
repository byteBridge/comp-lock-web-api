'use strict'

module.exports.mount = (server) => {
  const io = require('socket.io')(server, { pingInterval: 500 });

  io.on('connection', function(socket) {
    socket.on('logout', function (username) {
      socket.broadcast.emit('logout', username)
    })

    socket.on('take-screenshot', function (username) {
      socket.broadcast.emit('take-screenshot', username)
    })

    socket.on('took-screenshot', function (screenshot) {
      socket.broadcast.emit('took-screenshot', screenshot)
    })
  })
}
