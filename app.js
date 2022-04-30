const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when a client connects
io.on('connection', (socket) => {
    // Welcome new user
    socket.emit('message', 'Welcome to ChatApp');

    // Broadcast when a user connects
    socket.broadcast.emit('message', 'A user has joined the chat');

    // When a client disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the chat');
    });

    // Listen for chat message
    socket.on('chatMessage', (message) => {
        io.emit('message', message);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Chat server started on port ${PORT}`));
