const socket = io();

const enGameListTable = document.querySelector(".engaged-game-list");
const gamesListTable = document.querySelector('.not-engaged-games-list');
const tBodyGames = document.getElementById('no-en-game');
const joinButtons = document.querySelectorAll("#join-game-btn");
const viewButtons = document.querySelectorAll("#view-game-btn");
const quitButtons = document.querySelectorAll("#quit-game-btn")
const gameNameParts = document.querySelectorAll("#game-name");

const chatForm = document.getElementById('chat-form');
    const chatMessages = document.querySelector('.chat-message');

    socket.emit('login');

    socket.on('message', (message) => {
        console.log(message);
        outputMessage(message);
    });

    // Message submit
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("receive message from chat form...");
        //console.log(`username and user id: ${user.name}, ${user.id}`);
        //chatMessages.textContent = `Form Submitted! Time stamp: ${event.timeStamp}`;

        // Get message text
        let msg = e.target.elements.msg.value;
        msg = msg.trim();
        if (!msg) {
            return false;
        }

        // Emit message to server
        socket.emit('chatMessage', (msg));

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
        document.querySelector('.chat-message').appendChild(div);
    }


socket.on("connect", () => {
    id = socket.id;
    console.log("lobby user socket id", id)
})

socket.on('lobby-add-new-game', data => {
    createNewRow(data);
})

function createNewRow(data) {
    let row = tBodyGames.insertRow(0);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    cell1.innerHTML = `<p id="game-name" data-gameid="${data.gameid}"> ${data.gamename}: </p>`;
    cell2.innerHTML = `<p id="player-number" data-gameid="${data.gameid}"> ${data.playerNumber}/4 </p>`;
    // cell3.innerHTML = `<button id="join-game-btn" onclick="return joinBtn(${data.gameid})" type="" class="btn btn-primary my-3" data-gameid="${data.gameid}" data-gamaname="${data.gamename}">Join</button>`;
    cell3.innerHTML = `<a href="/game/created/${data.gameid}" class="btn btn-primary my-3" role="button"
    id="join-game-btn" onclick="return joinBtn(${data.gameid})">Join</a>`;
    cell4.innerHTML = `<a href="/game/created/${data.gameid}" class="btn btn-primary my-3" role="button"
    id="view-game-btn" data-gameid="${data.gameid}">View</a>`;
}

socket.on('lobby-join-new-game', ({ gameid, playerNumber }) => {
    document.querySelectorAll("#player-number").forEach(function (game) {
        let id = game.dataset.gameid;
        console.log('fetch game id:',id)
        if (id == gameid) {
            console.log('change gameid is:', id, game)
            game.innerText = playerNumber + '/4';
        }
    })
})

socket.on('lobby-delete-game', gameid => {
    let tRowGame = document.getElementById("game-info");
    let id = tRowGame.dataset.gameid;
    if ( id == gameid) {
        console.log('delete gameid', id )
        tRowGame.remove();
    }
})

socket.on('lobby-quit-game', ({ gameid, playerNumber }) => {
    document.querySelectorAll("#player-number").forEach(function (game) {
        let id = game.dataset.gameid;
        if (id == gameid) {
            console.log('lobby-quit-game', id)
            game.innerText = playerNumber + '/4';
        }
    })
})

function joinBtn(gameid) {
    console.log(socket.id, 'wants to join game', gameid);
    socket.emit('join-game', gameid);
    setTimeout(function(){
        window.location.href = `/game/created/${gameid}`;
    }, 1000)
}

function quitBtn(gameid) {
    console.log(socket.id, 'wants to quit game', gameid);
    socket.emit('quit-game', gameid);
    setTimeout(function(){
        window.location.href = `/lobby`;
    }, 1000)
}