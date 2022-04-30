const chatForm = document.getElementById('chat-form');
const socket = io();

// Message from server
socket.on('message', (message) => {
    console.log(message);
    outputMessage(message);
});

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    const message = e.target.elements.msg.value;

    // Emitting a message to server
    socket.emit('chatMessage', message);
});

// Output message to DOM
function outputMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.innerHTML = `<p class="meta">Mary <span>9:15pm</span></p>
          <p class="text">
            ${message}
          </p>`;
    document.querySelector('.chat-messages').appendChild(messageDiv);
}
