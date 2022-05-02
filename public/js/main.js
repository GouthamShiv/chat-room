const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const usersList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    displayRoomName(room);
    displayRoomUsers(users);
});

// Message from server
socket.on('message', (message) => {
    // Display message and scroll down
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Leave chatroom
socket.on('leaveRoom', () => {
    window.location.href = 'index.html';
});

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    const message = e.target.elements.msg.value;

    // Emitting a message to server and clear input field
    socket.emit('chatMessage', message);
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
          <p class="text">
            ${message.text}
          </p>`;
    document.querySelector('.chat-messages').appendChild(messageDiv);
}

// Add room name to DOM
function displayRoomName(room) {
    roomName.innerText = room;
}

// Add users to DOM
function displayRoomUsers(users) {
    usersList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join('')}
  `;
}
