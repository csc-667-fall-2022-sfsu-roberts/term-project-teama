const socket = io();

const tBodyNotEnGames = document.getElementById('no-en-game');
const tBodyStartedGames = document.getElementById('started-game');
const tBodyFullGames = document.getElementById("full-game");
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

/* join/quit/start => users in lobby refresh lobby page */
socket.on('lobby-add-new-game', data => {
    setTimeout(function() {
        window.location.href = `/lobby`;
    }, 500)
})

socket.on('lobby-join-new-game', ({ gameid, playerNumber }) => {
    setTimeout(function() {
        window.location.href = `/lobby`;
    }, 500)
})

socket.on('lobby-delete-game', gameid => {
    setTimeout(function() {
        window.location.href = `/lobby`;
    }, 500)
})

socket.on('lobby-quit-game', ({ gameid, playerNumber }) => {
    setTimeout(function() {
        window.location.href = `/lobby`;
    }, 500)
})

socket.on('play-game', gameid => {
    setTimeout(function() {
        window.location.href = `/lobby`;
    }, 500)
})

function joinBtn(gameid) {
    console.log(socket.id, 'wants to join game', gameid);
    socket.emit('join-game', gameid);
    setTimeout(function() {
        window.location.href = `/lobby`;
    }, 500)
}

function quitBtn(gameid) {
    console.log(socket.id, 'wants to quit game', gameid);
    socket.emit('quit-game', gameid);
    setTimeout(function() {
        window.location.href = `/lobby`;
    }, 500)
}

function startBtn(gameid) {
    console.log(socket.id, 'wants to start game', gameid);
    socket.emit('start-game', gameid);
    setTimeout(function() {
        window.location.href = `/lobby`;
    }, 500)
}

/*
// join/quit/start => refresh sender lobby page, others in lobby update game info
socket.on('lobby-add-new-game', data => {
    addRowToNotEnGame(data);
})

socket.on('lobby-join-new-game', ({ gameid, playerNumber }) => {
    // if game full, not engaged user(move game row to full games list), enuser(playernumber, new startbtn)
    console.log('join-game', playerNumber)
    if (playerNumber == 4) {
        // notEnUser(delete no-en-game row, add fullgame row)
        console.log('game full, update not-en-game-info')
        document.querySelectorAll(".not-en-game-info").forEach(row => {
                if (row.dataset.gameid == gameid) {
                    row.remove();
                    let data = {
                        gameid: gameid,
                        gamename: row.dataset.gamename,
                    }
                    addRowToFullGame(data);
                }
            })
            // user in this game => change playernumber, add start button(only creator)
        socket.emit('get-current-user', gameid);
    } else {
        // if game not full, same gameid(update playernumber)
        document.querySelectorAll("#game-info").forEach(row => {
            let id = row.dataset.gameid;
            console.log('join, not full gameid:', id)
            if (id == gameid) {
                console.log('update playernum:', id, row)
                let pNum = row.cells[1];
                pNum.innerHTML = `<p id="player-number"> ${playerNumber}/4 </p>`;
            }
        })
    }
})

socket.on('start-game', ({ gameid, userid, creator, playerNumber }) => {
    console.log('add startBTN', userid, creator)
    document.querySelectorAll(".engaged-game-info").forEach(row => {
        if (row.dataset.gameid == gameid) {
            let pNum = row.cells[1];
            pNum.innerHTML = `<p id="player-number"> ${playerNumber}/4 </p>`;
            // if is creator, add start 
            if (userid == creator) {
                let startBtn = row.insertCell(4);
                startBtn.innerHTML = `<a href="#" class="btn btn-primary my-3" role="button"
    id="start-game-btn" onclick="return startBtn(${gameid})">Start</a>`;
            }
        }
    })
})

// creator quit game(delete game row)
socket.on('lobby-delete-game', gameid => {
    document.querySelectorAll("#game-info").forEach(row => {
        let id = row.dataset.gameid;
        console.log('delete game', gameid, 'row id', id)
        if (id == gameid) {
            console.log('deleted gameid', id)
            row.remove();
        }
    })
})

// if playerNumber from 4 to 3, move game row from fullgame to not game
socket.on('lobby-quit-game', ({ gameid, playerNumber }) => {
    console.log('quit game playernum', playerNumber);
    // playernumber==3, notEnUser(fullgame delete row, not-en-game add row) 
    if (playerNumber == 3) {
        console.log('quit full game')
        document.querySelectorAll(".full-game-info").forEach(row => {
                let id = row.dataset.gameid;
                // console.log('delete full game', gameid, 'row id', id)
                if (id == gameid) {
                    console.log('deleted full gameid', id);
                    row.remove();
                    row.remove();
                    row.remove();
                    let data = {
                        gameid: id,
                        gamename: row.dataset.gamename,
                        playerNumber: 3
                    };
                    addRowToNotEnGame(data);
                    addRowToNotEnGame(data);
                    addRowToNotEnGame(data);
                }
            })
            // enUser(update playernum, delete startBtn)
        document.querySelectorAll(".engaged-game-info").forEach(row => {
            let id = row.dataset.gameid;
            if (id == gameid) {
                let pNum = row.cells[1];
                console.log('lobby-quit-game', pNum)
                pNum.innerHTML = `<p id="player-number"> ${playerNumber}/4 </p>`;
                if (row.cells[4]) {
                    row.cells[4].remove();
                }
            }
        })
    } else {
        // not full, only change player number
        document.querySelectorAll("#game-info").forEach(row => {
            let id = row.dataset.gameid;
            if (id == gameid) {
                let pNum = row.cells[1];
                console.log('lobby-quit-game', pNum)
                pNum.innerHTML = `<p id="player-number"> ${playerNumber}/4 </p>`;
            }
        })
    }
})

socket.on('play-game', gameid => {
    // only en-game change, only has view href=show/:id 
    document.querySelectorAll(".engaged-game-info").forEach(row => {
        let gamename = row.dataset.gamename
        let id = row.dataset.gameid;
        console.log('row gameid', id, 'gameid', gameid);
        if (id == gameid) {
            row.remove();
            console.log('update started game', gameid)
            let data = {
                gameid: gameid,
                gamename: gamename
            }
            addRowToStartedGame(data);
        }
    })
})

function addRowToFullGame(data) {
    let { gameid, gamename } = data;
    let newRow = tBodyFullGames.insertRow(0);
    newRow.setAttribute("id", "game-info");
    newRow.setAttribute("class", "full-game-info");
    newRow.setAttribute("data-gameid", `${gameid}`)
    newRow.setAttribute("data-gamename", `${gamename}`);
    let cell1 = newRow.insertCell(0);
    let cell2 = newRow.insertCell(1);
    cell1.innerHTML = `<p id="game-name" data-gameid="${gameid}"> ${gamename}: </p>`;
    cell2.innerHTML = `<a href="/game/created/${gameid}" class="btn btn-primary my-3" role="button"
                id="view-game-btn" data-gameid="${gameid}">View</a>`;
}

function addRowToNotEnGame(data) {
    let row = tBodyNotEnGames.insertRow(0);
    row.setAttribute("id", "game-info");
    row.setAttribute("class", "not-en-game-info");
    row.setAttribute("data-gameid", `${data.gameid}`)
    row.setAttribute("data-gamename", `${data.gamename}`);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    cell1.innerHTML = `<p id="game-name"> ${data.gamename}: </p>`;
    cell2.innerHTML = `<p id="player-number"> ${data.playerNumber}/4 </p>`;
    cell3.innerHTML = `<a href="#" class="btn btn-primary my-3" role="button"
    id="join-game-btn" onclick="return joinBtn(${data.gameid})">Join</a>`;
    cell4.innerHTML = `<a href="/game/created/${data.gameid}" class="btn btn-primary my-3" role="button"
    id="view-game-btn">View</a>`;
}

function addRowToStartedGame(data) {
    let row = tBodyStartedGames.insertRow(0);
    row.setAttribute("id", "game-info");
    row.setAttribute("class", "not-en-game-info");
    row.setAttribute("data-gameid", `${data.gameid}`)
    row.setAttribute("data-gamename", `${data.gamename}`);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    cell1.innerHTML = `<p id="game-name"> ${data.gamename}: </p>`;
    cell2.innerHTML = `<p id="player-number"> 4/4 </p>`;
    cell3.innerHTML = `<a href="/game/show/${data.gameid}" class="btn btn-primary my-3" role="button"
    id="view-game-btn">View</a>`;
}

function joinBtn(gameid) {
    console.log(socket.id, 'wants to join game', gameid);
    socket.emit('join-game', gameid);
    setTimeout(function() {
        window.location.href = `/lobby`;
    }, 500)
}

function quitBtn(gameid) {
    console.log(socket.id, 'wants to quit game', gameid);
    socket.emit('quit-game', gameid);
    setTimeout(function() {
        window.location.href = `/lobby`;
    }, 500)
}

function startBtn(gameid) {
    console.log(socket.id, 'wants to start game', gameid);
    socket.emit('start-game', gameid);
    setTimeout(function() {
        window.location.href = `/lobby`;
    }, 500)
}
*/