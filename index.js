const express = require('express');
const ws = require('socket.io');
const { join } = require('path');
const http = require('http');

const PORT = 80;

const app = express();
const server = http.Server(app);
const io = ws(server);

const users = [];
function userAdd(newUser) {
  if (!newUser.id) throw new Error("User must have a id");
  if (users.filter(x => x.id == newUser.id).length > 0) throw new Error("User with same id already exists");
  users.push(newUser);
}

function userRemove(userID) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id == userID) {
      users.splice(i, 1);
      break;
    }
  }
}

function userFind(userID) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id == userID) {
      return users[i];
    }
  }
  return null;
}

app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send(join(__dirname, 'public', 'index.html'));
});

app.get('/list', (req, res) => {
  res.send(users);
});

io.on('connection', (socket) => {

  socket.on('chat', (msg) => {
    let user = userFind(socket.id);
    if (!user) return;
    io.emit('chat', { user, msg: msg });
  });

  socket.on('new user', (msg) => {
    userAdd({ id: socket.id, name: msg, x: 0, y: 0 });
    io.emit('notify', `User ${msg} connected.`);
    io.emit('list', users);
  });

  socket.on('disconnect', () => {
    let user = userFind(socket.id);
    if (!user) return;
    io.emit('notify', 'User ' + user.name + " disconnected");
    userRemove(socket.id);
    io.emit('list', users);
  });

  socket.on('move', data => {
    let user = userFind(socket.id);
    if (!user) return;
    let { x, y } = data;
    user.x = x;
    user.y = y;
    io.emit('move', user);
  });

  socket.on('rename', newName => {
    let user = userFind(socket.id);
    if (!user) return;
    io.emit('notify', `User ${user.name} changed name to ${newName}`);
    user.name = newName;
    io.emit('list', users);
  });
});

server.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});