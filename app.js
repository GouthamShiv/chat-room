const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const axios = require('axios');
require('dotenv').config();
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

const censorURL = process.env.PROFANITY_CENSOR_URL;
const checkURL = process.env.PROFANITY_CHECK_URL;
const proxyKey = process.env.PROXY_KEY;

const name = 'SERVER';

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run when a client connects
io.on('connection', (socket) => {
    // Join room
    socket.on('joinRoom', ({ username, room }) => {
        username = username.replace(/\-/g, '');
        // Username profanity
        const options = {
            method: 'POST',
            url: checkURL,
            data: { message: username },
            headers: { 'x-proxy-key': proxyKey },
        };

        axios
            .request(options)
            .then((res) => {
                // Username profanity check
                if (res.data) {
                    username = '--blocked-user--';
                    socket.emit('leaveRoom');
                }
                const user = userJoin(socket.id, username, room);
                if (username !== '--blocked-user--') {
                    // deepcode ignore PureMethodReturnValueIgnored: This is not an array join operation
                    socket.join(user.room);
                    // Broadcast when a user connects
                    socket.broadcast
                        .to(user.room)
                        .emit(
                            'message',
                            formatMessage(
                                name,
                                `${user.username} has joined the chat`
                            )
                        );

                    // Send users and room info
                    io.to(user.room).emit('roomUsers', {
                        room: user.room,
                        users: getRoomUsers(user.room),
                    });
                }
            })
            .catch((error) => {
                console.error('error: ', error);
                socket.emit('leaveRoom');
            });

        // Welcome new user
        socket.emit('message', formatMessage(name, 'Welcome to ChatStash'));
    });

    // Listen for chat message
    socket.on('chatMessage', async (userMessage) => {
        const user = getCurrentUser(socket.id);

        const options = {
            method: 'POST',
            url: censorURL,
            data: { message: userMessage },
            headers: { 'x-proxy-key': proxyKey },
        };

        axios
            .request(options)
            .then((res) => {
                const censoredMessage = res.data['result'];
                io.to(user.room).emit(
                    'message',
                    formatMessage(user.username, censoredMessage)
                );
            })
            .catch((error) => {
                console.error('error: ', error);
            });
    });

    // When a client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user && user.username !== '--blocked-user--') {
            io.to(user.room).emit(
                'message',
                formatMessage(name, `${user.username} has left the chat`)
            );

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Chat server started on port ${PORT}`));
