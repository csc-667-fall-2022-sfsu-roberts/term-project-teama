const socket = io();

const createGameContainer = document.getElementById("create-game-container")
const createGameForm = document.getElementById("create-game-form");
const createGameName = document.getElementById("gamename");

socket.on("connect", () => {
    id = socket.id;
    // console.log("user socket id", id)
})

createGameForm.addEventListener('submit', e => {
    e.preventDefault();
    let gamename = createGameName.value;
    fetch(`/game/create`, {
        method: "POST",
        headers: {
            "Content-Type": "Application/json"
        },
        body: JSON.stringify({
            gamename: gamename
        })
    })
    .then(response => response.json())
    .then(json => {
        if(json.code === 1){
            let {user, gameid} = json;
            socket.emit('new-game-created', {user, gameid, gamename});
            setTimeout(function(){
                window.location.href = `/game/created/${gameid}`;
            }, 1000)
        }  
    })
    .catch(error => {
        console.log(error)
    })
})