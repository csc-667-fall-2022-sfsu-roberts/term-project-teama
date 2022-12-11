const socket = io();

const tBodyEnGames = document.getElementById('en-game')
const tBodyNotEnGames = document.getElementById('no-en-game');
const tBodyStartedGames = document.getElementById('started-game');
const tBodyFullGames = document.getElementById("full-game");
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-message');
let curUserID;

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
    div.classList.add("chatMsg", "row", "d-flex", "align-items-center");
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
    document.querySelector('.chat-message').appendChild(div);
}

socket.on("connect", () => {
    id = socket.id;
    console.log("lobby user socket id", id)
})

socket.on('userInfo', user => {
    curUserID = user.userid;
    console.log("userInfo", user);
})

// join/quit/start => update game info in lobby page dynamically
socket.on('lobby-add-new-game', data => {
    addRowToNotEnGame(data);
})

socket.on('lobby-join-new-game', (data) => {
    let { gameid, playerNumber, reqUser } = data;
    // socket is req user => move from not-en to en
    if (curUserID == reqUser) {
        document.querySelectorAll(".not-en-game-info").forEach(row => {
            if (row.dataset.gameid == gameid) {
                console.log('JOIN ,move from not-en to en', gameid);
                row.remove();
                addRowToEnGame(data);
            }
        })
    } else {
        // if game full, not engaged user(move game row to full games list), enuser(playernumber, new startbtn)
        console.log('join-game', playerNumber)
        if (playerNumber == 4) {
            // notEnUser(delete no-en-game row, add fullgame row)
            console.log('game full, update not-en-game-info')
            document.querySelectorAll(".not-en-game-info").forEach(row => {
                if (row.dataset.gameid == gameid) {
                    row.remove();
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
                    pNum.innerHTML = `<p id="player-number" class="mb-0"> ${playerNumber} </p>`;
                }
            })
        }
    }

})

socket.on('start-game', ({ gameid, userid, creator, playerNumber }) => {
    document.querySelectorAll(".engaged-game-info").forEach(row => {
        if (row.dataset.gameid == gameid) {
            let pNum = row.cells[1];
            pNum.innerHTML = `<p id="player-number" class="mb-0"> ${playerNumber}</p>`;
            // if is creator, add start 
            if (userid == creator) {
                let startBtn = row.cells[2];
                startBtn.innerHTML = `<button type="button" class="btn btn-primary btn-xs" id="quit-game-btn"
                onclick="return quitBtn(${gameid})">Quit</button>
                <a href="/game/show/${gameid}" target="_blank" class="btn btn-primary btn-xs" role="button"
    id="start-game-btn" onclick="return startBtn(${gameid})">Start</a>`;
            }
        }
    })
})

// creator quit game(delete game row)
socket.on('lobby-delete-game', gameid => {
    document.querySelectorAll("#game-info").forEach(row => {
        let id = row.dataset.gameid;
        if (id == gameid) {
            console.log('deleted gameid', id)
            row.remove();
        }
    })
})

socket.on('lobby-quit-game', (data) => {
    let { gameid, playerNumber, reqUser } = data;
    console.log('quit game playernum', playerNumber);
    // playernumber==3, notEnUser(fullgame delete row, not-en-game add row) 
    if (playerNumber == 3) {
        document.querySelectorAll(".full-game-info").forEach(row => {
            if (row.dataset.gameid == gameid) {
                console.log('deleted full gameid', gameid);
                row.remove();
                addRowToNotEnGame(data);
            }
        })
        // enUser(update playernum, delete startBtn)
        if (curUserID == reqUser) {
            document.querySelectorAll(".engaged-game-info").forEach(row => {
                if (row.dataset.gameid == gameid) {
                    console.log('QUIT, requser move from en to not-en', gameid);
                    row.remove();
                    addRowToNotEnGame(data);
                }
            })
        } else {
            document.querySelectorAll(".engaged-game-info").forEach(row => {
                if (row.dataset.gameid == gameid) {
                    let pNum = row.cells[1];
                    console.log('lobby-quit-game', pNum)
                    pNum.innerHTML = `<p id="player-number" class="mb-0"> ${playerNumber}</p>`;
                    if (row.cells[2]) {
                        row.cells[2].innerHTML = `<button type="button" class="btn btn-primary btn-xs" id="quit-game-btn"
                        onclick="return quitBtn(${data.gameid})">Quit</button>`;
                    }
                }
            })
        }

    } else {
        // socket is reqUser => move game from en to not-en; others update palyernumber
        if (curUserID == reqUser) {
            document.querySelectorAll(".engaged-game-info").forEach(row => {
                if (row.dataset.gameid == gameid) {
                    console.log('QUIT, requser move from en to not-en', gameid);
                    row.remove();
                    addRowToNotEnGame(data);
                }
            })
        } else {
            document.querySelectorAll("#game-info").forEach(row => {
                if (row.dataset.gameid == gameid) {
                    let pNum = row.cells[1];
                    console.log('lobby-quit-game', pNum);
                    pNum.innerHTML = `<p id="player-number" class="mb-0"> ${playerNumber}</p>`;
                }
            })
        }

    }
})

socket.on('play-game', gameid => {
    // only en-game change, only has view href=show/:id 
    document.querySelectorAll(".engaged-game-info").forEach(row => {
        let gamename = row.dataset.gamename
        let id = row.dataset.gameid;
        if (id == gameid) {
            console.log('update started game', gameid)
            let data = {
                gameid: gameid,
                gamename: gamename
            }
            row.remove();
            addRowToStartedGame(data);
        }
    })
})

/**  
     * data = {
     * gamename,
     * gameid, 
     * playerNumber:
     * players=[id, username, avatar],
     * reqUser }
     */
// function viewGameDetailHTML(data) {
//     let { gameid, gamename, players, playerNumber } = data;
//     let html = `<button type="button" class="btn btn-primary" data-bs-toggle="modal"
//     id="viewGameDetails" data-bs-target="#gameDetails">
//     View Game Details
//     </button>`;
//     return html;
// }

function addRowToFullGame(data) {
    console.log('addRowToFullGame', data);
    let { gameid, gamename } = data;
    let newRow = tBodyFullGames.insertRow(0);
    newRow.setAttribute("id", "game-info");
    newRow.setAttribute("class", "full-game-info");
    newRow.setAttribute("data-gameid", `${gameid}`)
    newRow.setAttribute("data-gamename", `${gamename}`);
    let cell1 = newRow.insertCell(0);
    let cell2 = newRow.insertCell(1);
    let cell3 = newRow.insertCell(2);
    cell1.setAttribute("class", "align-middle text-center");
    cell2.setAttribute("class", "align-middle text-center");
    cell3.setAttribute("class", "align-middle text-center");
    // cell1.innerHTML = `<p id="game-name" data-gameid="${gameid}"> ${gamename}</p>`;
    cell1.innerHTML = `<a id="game-name" class="btn" href="/game/created/${gameid}" target="_blank"> ${gamename} </a>`;
    cell2.innerHTML = `<p id="player-number" class="mb-0"> ${data.playerNumber}</p>`
    cell3.innerHTML = `<button type="button" class="btn btn-primary btn-xs" id="join-game-btn"
    disabled="disabled">Join</button>`;

}

function addRowToNotEnGame(data) {
    console.log('addRowToNotEnGame', data)
    let row = tBodyNotEnGames.insertRow(0);
    row.setAttribute("id", "game-info");
    row.setAttribute("class", "not-en-game-info");
    row.setAttribute("data-gameid", `${data.gameid}`)
    row.setAttribute("data-gamename", `${data.gamename}`);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    cell1.setAttribute("class", "align-middle text-center");
    cell2.setAttribute("class", "align-middle text-center");
    cell3.setAttribute("class", "align-middle text-center");
    // let cell4 = row.insertCell(3);
    // cell1.innerHTML = `<p id="game-name"> ${data.gamename}</p>`;
    cell1.innerHTML = `<a id="game-name" class="btn" href="/game/created/${data.gameid}" target="_blank"> ${data.gamename} </a>`;
    cell2.innerHTML = `<p id="player-number" class="mb-0"> ${data.playerNumber}</p>`;
    // cell3.innerHTML = viewGameDetailHTML(data);
    cell3.innerHTML = `<button type="button" class="btn btn-primary btn-xs" id="join-game-btn"
    onclick="return joinBtn(${data.gameid})">Join</button>`
}

function addRowToStartedGame(data) {
    let row = tBodyStartedGames.insertRow(0);
    row.setAttribute("id", "game-info");
    row.setAttribute("class", "engaged-game-info");
    row.setAttribute("data-gameid", `${data.gameid}`)
    row.setAttribute("data-gamename", `${data.gamename}`);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    cell1.setAttribute("class", "align-middle text-center");
    cell2.setAttribute("class", "align-middle text-center");
    cell3.setAttribute("class", "align-middle text-center");
    // cell1.innerHTML = `<p id="game-name"> ${data.gamename}</p>`;
    cell1.innerHTML = `<a id="game-name" class="btn" href="/game/created/${data.gameid}" target="_blank"> ${data.gamename} </a>`;
    cell2.innerHTML = `<p id="player-number" class="mb-0"> 4 </p>`;
    cell3.innerHTML = `<a href="/game/show/${data.gameid}" target="_blank" class="btn btn-primary btn-xs" role="button"
    id="view-game-btn">View</a>`;
}

function addRowToEnGame(data) {
    console.log('addRowToEnGame', data, data.players)
    let row = tBodyEnGames.insertRow(0);
    row.setAttribute("id", "game-info");
    row.setAttribute("class", "engaged-game-info");
    row.setAttribute("data-gameid", `${data.gameid}`)
    row.setAttribute("data-gamename", `${data.gamename}`);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    cell1.setAttribute("class", "align-middle text-center");
    cell2.setAttribute("class", "align-middle text-center");
    cell3.setAttribute("class", "align-middle text-center");
    // let cell4 = row.insertCell(3);
    // cell1.innerHTML = `<p id="game-name"> ${data.gamename}</p>`;
    cell1.innerHTML = `<a id="game-name" class="btn" href="/game/created/${data.gameid}" target="_blank"> ${data.gamename} </a>`;
    cell2.innerHTML = `<p id="player-number" class="mb-0"> ${data.playerNumber}</p>`;
    // cell3.innerHTML = viewGameDetailHTML(data);
    cell3.innerHTML = `<button type="button" class="btn btn-primary btn-xs" id="quit-game-btn"
    onclick="return quitBtn(${data.gameid})">Quit</button>`;
}

function joinBtn(gameid) {
    console.log(curUserID, 'wants to join game', gameid);
    socket.emit('join-game', gameid);
}

function quitBtn(gameid) {
    console.log(curUserID, 'wants to quit game', gameid);
    socket.emit('quit-game', gameid);
}

function startBtn(gameid) {
    console.log(socket.id, 'wants to start game', gameid);
    socket.emit('start-game', gameid);
}


/* join/quit/start => users in lobby refresh lobby page */
/*
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
}
*/