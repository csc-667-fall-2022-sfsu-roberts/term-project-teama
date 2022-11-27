const socket = io();

const gameChatForm = document.getElementById('game-chat-form');
let gameId = $('#game-chat-form').data('gameid');

socket.emit('game-page', (gameId));

socket.on("connect", () => {
    id = socket.id;
    console.log("lobby user socket id", id)
})

socket.on('gameMessage', (message) => {
    console.log(message);
    outputMessage(message);
});

// Message submit
gameChatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    let msg = e.target.elements.msg.value;
    //console.log(`receive gameId from game chat: ${gameId} `);
    msg = msg.trim();
    if (!msg) {
        return false;
    }

    // Emit message to server
    socket.emit('gameChatMessage', ({msg, gameId}));

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
    console.log("outputMessage...");
    console.log(`the received message is: ${message}`);
    const div = document.createElement('div');
    div.classList.add("message", "d-flex", "flex-row", "justify-content-start", "mb-4");
    const img = document.createElement('img');
    img.classList.add("mx-1", "avatar", `avatar_${message.avatar}`);
    img.setAttribute('style', 'width: 40px;');
    const b = document.createElement('b');
    b.classList.add('name');
    b.innerText = `${message.username}`;
    const div2 = document.createElement('div');
    const p = document.createElement('p');
    p.classList.add('meta', 'mall', 'p-2', 'ms-3', 'mb-1', 'rounded-3');
    p.setAttribute('style', 'background-color: #f5f6f7;');
    p.innerHTML = `${message.text}`;
    const p2 = document.createElement('p');
    p2.classList.add('small', 'ms-3', 'mb-3', 'rounded-3', 'text-muted');
    p2.innerHTML = `${message.time}`;
    div2.appendChild(p);
    div2.appendChild(p2);
    div.appendChild(img);
    div.appendChild(b);
    div.appendChild(div2);
    document.querySelector('.game-chat-message').appendChild(div);
}

