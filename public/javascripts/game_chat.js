const socket = io();

const gameChatForm = document.getElementById('game-chat-form');
const sysMsgTestBtn = document.getElementById('sysMsgTest');
let gameId = $('#game-chat-form').data('gameid');
//let myIndex = $('#game-chat-form').data('myIndex');
let sysMsg = $('#sysMsgTest').attr('data-sysMsg');

socket.emit('game-page', (gameId));

socket.on("connect", () => {
    id = socket.id;
    console.log("lobby user socket id", id)
})

socket.on('gameMessage', (message) => {
    console.log(message);
    outputMessage(message);
});

socket.on('startTurn', (playerIndex) => {
    tockHistory.startTurn(playerIndex);
});

socket.on('endGame', (gameId) => {
    tockHistory.endGame();
    /*
    console.log('end game');
    fetch(`/game/summary/${gameId}`, {
        method: "GET",
        headers: {
            "Content-Type": "Application/json"
        }
    })
    */
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

// System Message submit
sysMsgTestBtn.addEventListener('click', () => {
    socket.emit('sysMsg', ({sysMsg, gameId}));
})

// Output message to DOM
function outputMessage(message) {
    console.log("outputMessage...");
    console.log(`the received message is: ${message}`);
    const div = document.createElement('div');
    div.classList.add("gameChatMsg", "row", "d-flex", "align-items-center");
    const div1 = document.createElement('div');
    div1.classList.add("col-3");
    const a = document.createElement('a');
    const img = document.createElement('img');
    img.classList.add("mx-1", "avatar", `avatar_${message.avatar}`);
    a.appendChild(img);
    const b = document.createElement('p');
    b.classList.add("username", "small", "text-muted");
    b.innerText = `${message.username}`;
    const div2 = document.createElement("div");
    div2.classList.add("col-9");
    const p = document.createElement('p');
    p.classList.add('message', 'mall', 'p-2', 'ms-3', 'mb-1', 'rounded-3');
    p.setAttribute('style', 'background-color: #f5f6f7;');
    p.innerHTML = `${message.text}`;
    const p2 = document.createElement('p');
    p2.classList.add('small', 'text-muted', 'd-flex', 'flex-row', 'justify-content-end');
    p2.innerHTML = `${message.time}`;
    div2.appendChild(p);
    div2.appendChild(p2);
    div1.appendChild(a);
    div1.appendChild(b);
    div.appendChild(div1);
    div.appendChild(div2);
    document.querySelector('.game-chat-message').appendChild(div);
}
