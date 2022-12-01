const socketIO = require("socket.io");
const passport = require("passport");
const formatMessage = require("../public/javascripts/messages")
const botName = "Chat Bot";
const dbQuery = require("../db/dbquery");
// whats the use of express-session & middleware?
// next step: how to create a session for room and add players into the room
const sessionMiddleware = require("../config/session");

const Server = socketIO.Server;

const init = (httpServer, app) => {
    let rooms = {};
    const io = new Server(httpServer);
    const wrap = (middleware) => (socket, next) =>
        middleware(socket.request, {}, next);
    io.use(wrap(sessionMiddleware));
    io.use(wrap(passport.initialize()));
    io.use(wrap(passport.session()));

    io.use((socket, next) => {
        if (socket.request.user) {
            console.log('authorized user:', socket.request.user.username)
            next();
        } else {
            next(new Error("unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        // console.log({
        //   message: "Connection happened",
        //   session: socket.request.session,
        // });

        const username = socket.request.user.username;
        const avatar = socket.request.user.avatar;
        socket.on('login', async () => {
            if (Object.keys(rooms).length == 0) {
                rooms = await dbQuery.initRooms();
                /*
                Object.keys(rooms).forEach(id => {
                    console.log('roomid', id, ':', rooms[id])
                })
                */
            }
            console.log(`${username} logged in lobby`);
            // Welcome current user
            // socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));
            // Broadcast when a user connects
            socket.emit(
                "message",
                formatMessage(1, botName, `${username} has joined the chat `)
            );
        });

        // Listen for chatMessage
        socket.on("chatMessage", (msg) => {
            //const user = getCurrentUser(socket.id);
            io.emit("message", formatMessage(avatar, username, msg));
        });

        // Listen for game chat login signal
        socket.on('game-page', async (gameId) => {
            console.log(`${username} logged in game page`);
            socket.join(gameId);
            io.emit("gameMessage", formatMessage(1, botName, `Hi, ${username}! Welcom to Tock!`));
        });

        // Listen for game chat message
        socket.on('gameChatMessage', async ({ msg, gameId }) => {
            console.log(`received game message and gameid are: ${msg} and ${gameId}`);
            io.to(gameId).emit("gameMessage", formatMessage(avatar, username, msg));
        });

        socket.on('disconnect', () => {
            console.log("disconnect => socket.id : ", socket.id);
        });

        /** game create && lobby */
        socket.on('get-creator-info', () => {
            user = socket.request.user;
            socket.emit('creator-info', user);
        })

        socket.on('new-game-created', async ({ user, gameid, gamename }) => {
            if (!rooms[gameid]) {
                rooms[gameid] = {};
                rooms[gameid].gamename = gamename;
                rooms[gameid].host = user.id;
                rooms[gameid].players = [];
                rooms[gameid].players[0] = {
                    id: user.id,
                    username: user.username,
                    avatar: user.avatar
                };
            }
            let players = rooms[gameid].players;
            // let players = await curGamePlayers(gameid);
            let gameListInfo = {
                gameid: gameid,
                gamename: gamename,
                user: user,
                playerNumber: players.length,
                players: players
            }
            console.log('after create new game players', gameListInfo)

            socket.broadcast.emit('lobby-add-new-game', gameListInfo);
        });

        socket.on('join-game', gameid => {
            if (rooms[gameid]) {
                let userid = socket.request.user.id;
                let player = {
                    id: socket.request.user.id,
                    username: socket.request.user.username,
                    avatar: socket.request.user.avatar
                }
                console.log('cur player', player)
                // join game only if curUser not in the game
                if (!validGamePlayer(gameid, userid)) {
                    dbQuery.joinGame(gameid, userid);
                    console.log('before join game players', rooms[gameid].players)
                    rooms[gameid].players.push(player);
                    let playerNumber = rooms[gameid].players.length;
                    console.log('after join game players', rooms[gameid].players)

                    io.emit('lobby-join-new-game', { gameid, gamename: rooms[gameid].gamename, playerNumber, players: rooms[gameid].players, reqUser: userid });
                }

            }
        });

        socket.on('quit-game', gameid => {
            let userid = socket.request.user.id;
            if (rooms[gameid]) {
                // delete/quit game only if curUser in this game
                if (validGamePlayer(gameid, userid)) {
                    let game = rooms[gameid]
                    if (userid == game.host) {
                        console.log('before delete game', gameid, rooms[gameid]);
                        dbQuery.deleteGame(gameid);
                        delete rooms[gameid];
                        console.log('after delete game', gameid, rooms[gameid]);
                        io.emit('lobby-delete-game', gameid);
                    } else {
                        console.log('before quit game', gameid, rooms[gameid]);
                        dbQuery.quitGame(gameid, userid);
                        rooms[gameid].players = rooms[gameid].players.filter(player => player.id != userid);
                        let playerNumber = rooms[gameid].players.length;
                        console.log('after delete game', gameid, rooms[gameid]);
                        io.emit('lobby-quit-game', { gameid, gamename: rooms[gameid].gamename, playerNumber, players: rooms[gameid].players, reqUser: userid  });
                    }
                }

            }
        });

        socket.on('start-game', async gameid => {
            /* shuffle */
            dbQuery.initialCards(gameid);
            dbQuery.dealCardsToPlayer(gameid);
            // let players = await curGamePlayers(gameid);
            /* initial marbles */
            let spot_id = 1;
            for (let playerIndex = 0; playerIndex < 4; playerIndex++) {
                for (let marbleIndex = 0; marbleIndex < 4; marbleIndex++) {
                    dbQuery.addMarbles(gameid, rooms[gameid].players[playerIndex].id, spot_id, marbleIndex);
                    // dbQuery.addMarbles(gameid, players[playerIndex], spot_id, marbleIndex);
                    spot_id++;
                }
            }
            /* update game state=1 start */
            dbQuery.updateGamestate(gameid, 1);
            rooms[gameid].state = 1;
            io.emit('play-game', gameid);
        });

        socket.on('get-current-user', async (gameid) => {
            let userid = socket.request.user.id;
            let creator = rooms[gameid].host;
            let playerNumber = rooms[gameid].players.length;
            // let creator = (await dbQuery.findGamesByGameId(gameid)).creator;
            // let players = await curGamePlayers(gameid);
            // let playerNumber = players.length;
            console.log('current users', rooms[gameid].players);
            socket.emit('start-game', { gameid, userid, creator, playerNumber });
        })

        function validGamePlayer(gameid, userid) {
            let rs = rooms[gameid].players.filter(player => player.id === userid);
            if (rs.length > 0) {
                return true;
            }
            return false;
        }

        socket.emit('get-user-info', () => {

        })

        socket.emit('userInfo', {userid: socket.request.user.id});
        /*
        // read players data from db
        async function curGamePlayers(gameid) {
            let rs = await dbQuery.findAllUsersByGameId(gameid);
            // console.log('curgameplayers', rs);
            if (rs) {
                players = [];
                for (let j = 0; j < rs.length; j++) {
                    let playerInfo = await dbQuery.findUserById(rs[j].player_id);
                    players[j] = {
                        id: rs[j].player_id,
                        username: playerInfo.username,
                        avatar: playerInfo.avatar
                    }
                }
                return players;
            }
        }

        socket.on('join-game', async gameid => {
            let rs = await dbQuery.findGamesByGameId(gameid);
            if (rs) {
                let userid = socket.request.user.id;
                dbQuery.joinGame(gameid, userid);
                let players = await curGamePlayers(gameid);
                let playerNumber = players.length;
                console.log('after join game players', players)
                io.emit('lobby-join-new-game', { gameid, playerNumber });
            }
        })

        socket.on('quit-game', async gameid => {
            let userid = socket.request.user.id;
            let game = await dbQuery.findGamesByGameId(gameid);
            if (game) {
                if (userid == game.creator) {
                    dbQuery.deleteGame(gameid);
                    io.emit('lobby-delete-game', gameid);
                } else {
                    dbQuery.quitGame(gameid, userid);

                    let players = await curGamePlayers(gameid);
                    let playerNumber = players.length;
                    console.log('after QUIT game players', players)
                    io.emit('lobby-quit-game', { gameid, playerNumber });
                }
            }
        });
    */

    });

    app.io = io;
};

module.exports = init;