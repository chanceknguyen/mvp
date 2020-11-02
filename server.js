const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

const rooms = {};

app.use(express.static('./client/dist'));

app.use('/room/:roomID', express.static('./client/dist'));

// app.get('*', (req, res) => {
//   res.sendFile(__dirname + '/client/dist/index.html');
// })

io.on('connection', socket => {
  socket.on('join room', roomID => {
    if (rooms[roomID]) {
      rooms[roomID].push(socket.id);
    } else {
      rooms[roomID] = [socket.id];
    }
    const otherUser = rooms[roomID].find(id => id !== socket.id);
    if (otherUser) {
      socket.emit('other user', otherUser);
      socket.to(otherUser).emit('user joined', socket.id);
    }
  });

  socket.on('offer', payload => {
    io.to(payload.target).emit('offer', payload);
  });

  socket.on('answer', payload => {
    io.to(payload.target).emit('answer', payload);
  });

  socket.on('ice-candidate', incoming => {
    io.to(incoming.target).emit('ice-candidate', incoming.candidate);
  });
});

http.listen(PORT, () => {
  console.log('listening on port ', PORT);
});
