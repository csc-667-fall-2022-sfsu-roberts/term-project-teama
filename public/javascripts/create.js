const socket = io();

const createGameContainer = document.getElementById("create-game-container")
const createGameForm = document.getElementById("create-game-form");
const createGameName = document.getElementById("gamename");

socket.on("connect", () => {
    id = socket.id;
    socket.emit('get-creator-info');
    console.log("user socket id", id)
})

socket.on('creator-info', user => {
    console.log('userinfo', user)
    createGameForm.addEventListener('submit', e => {
        e.preventDefault();
        let gamename = createGameName.value;
        fetch(`/game/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({
                    gamename: gamename,
                    user: user
                })
            })
            .then(response => response.json())
            .then(json => {
                if (json.code === 1) {
                    let { user, gameid } = json;
                    socket.emit('new-game-created', { user, gameid, gamename });
                    setTimeout(function() {
                        window.location.href = `/lobby`;
                    }, 500)
                }
            })
            .catch(error => {
                console.log(error)
            })
    })
});