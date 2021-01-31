const express = require('express');
const ws = require('socket.io');
const { join } = require('path');
const http = require('http');

const PORT = 80;

const app = express();
const server = http.Server(app);
const io = ws(server);

app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat reply', 'SERVER:You sent ' + msg);
  });
});

server.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});