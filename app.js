const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const name = 'SERVER';

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when a client connects
io.on('connection', (socket) => {
    // Join room
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // Welcome new user
        socket.emit('message', formatMessage(name, 'Welcome to ChatApp'));

        // Broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage(name, `${user.username} has joined the chat`)
            );
    });

    // Listen for chat message
    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, message));
    });

    // When a client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit(
                'message',
                formatMessage(name, `${user.username} has left the chat`)
            );
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Chat server started on port ${PORT}`));
