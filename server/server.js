require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chatpro');
const User = mongoose.model('User', new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  displayName: String,
  createdAt: { type: Date, default: Date.now }
}));

const JWT_SECRET = process.env.JWT_SECRET || 'chatpro2025_secret_ultrasecure';

const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Unauthorized'));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
};
io.use(authenticateSocket);

const rooms = {};

io.on('connection', (socket) => {
  const user = socket.user;
  console.log(`${user.displayName} connected`);

  socket.on('joinRoom', ({ room }) => {
    socket.join(room);
    socket.room = room;

    if (!rooms[room]) rooms[room] = { users: [], messages: [] };
    const userObj = { id: user.id, name: user.displayName };
    if (!rooms[room].users.find(u => u.id === user.id)) {
      rooms[room].users.push(userObj);
    }

    io.to(room).emit('roomUsers', rooms[room].users);
    socket.emit('previousMessages', rooms[room].messages);
  });

  socket.on('chatMessage', (text) => {
    const msg = {
      id: Date.now(),
      text,
      sender: user.displayName,
      userId: user.id,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    rooms[socket.room]?.messages.push(msg);
    if (rooms[socket.room].messages.length > 500) rooms[socket.room].messages.shift();

    io.to(socket.room).emit('chatMessage', msg);
    socket.to(socket.room).emit('pushNotification', { title: user.displayName, body: text });
  });

  socket.on('typing', (isTyping) => {
    socket.to(socket.room).emit('typing', { name: user.displayName, isTyping });
  });

  socket.on('disconnect', () => {
    if (socket.room) {
      rooms[socket.room].users = rooms[socket.room].users.filter(u => u.id !== user.id);
      io.to(socket.room).emit('roomUsers', rooms[socket.room].users);
    }
  });
});

// API Auth
app.post('/api/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ email, password: hashed, displayName: displayName || email.split('@')[0] });
    const token = jwt.sign({ id: user._id, email: user.email, displayName: user.displayName }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { displayName: user.displayName, email: user.email } });
  } catch (err) {
    res.status(400).json({ error: 'Email đã tồn tại' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });
  }
  const token = jwt.sign({ id: user._id, email: user.email, displayName: user.displayName }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { displayName: user.displayName, email: user.email } });
});

app.delete('/api/delete-account', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    await User.deleteOne({ _id: decoded.id });
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));