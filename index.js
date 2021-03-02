const express = require('express');
const ws = require('socket.io');
const { join } = require('path');
const http = require('http');

const PORT = 80;

const app = express();
const server = http.Server(app);
const io = ws(server);

const users = {};

app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  users[socket.id] = 'NEW USER';

  socket.on('chat message', (msg) => {
    io.emit('chat reply', msg);
  });

  socket.on('new user', (msg) => {
    users[socket.id] = msg;
    io.emit('chat reply', `New user ${msg} joined this chatroom.`);
  });

  socket.on('list', (msg) => {
    socket.emit('list', JSON.stringify(Object.keys(users).map(x => users[x]).filter(x => x)));
  });

  socket.on('disconnect', () => {
    io.emit('chat reply', 'User ' + users[socket.id] + " disconnected");
    users[socket.id] = undefined;
  });
});

server.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});