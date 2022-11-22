const socketIO = require("socket.io");
const passport = require("passport");
const formatMessage = require("../public/javascripts/messages")
const botName = "ChatCord Bot";
const dbQuery = require("../db/dbquery")
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
        socket.on('login', async() => {
            /** initialize rooms, get data from db */
            if (Object.keys(rooms).length == 0) {
                rooms = await dbQuery.initRooms();
                console.log('init rooms:', rooms)
            }

            console.log(`${username} logged  in....`);
            // Welcome current user
            // socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));
            // Broadcast when a user connects
            socket.emit(
                "message",
                formatMessage(1, botName, `
                                        $ { username }
                                        has joined the chat `)
            );
        });

        // Listen for chatMessage
        socket.on("chatMessage", (msg) => {
            //const user = getCurrentUser(socket.id);
            io.emit("message", formatMessage(avatar, username, msg));
        });

        socket.on('disconnect', () => {
            console.log("disconnect => socket.id : ", socket.id);
        });


        socket.on('get-creator-info', () => {
            user = socket.request.user;
            socket.emit('creator-info', user);
        })


        socket.on('new-game-created', async({ user, gameid, gamename, num }) => {
            if (!rooms[gameid]) {
                rooms[gameid] = {};
                rooms[gameid].host = user.id;
                rooms[gameid].players = [user.id];
            }
            let gameListInfo = {
                gameid: gameid,
                gamename: gamename,
                user: user,
                playerNumber: rooms[gameid].players.length
            }
            socket.broadcast.emit('lobby-add-new-game', gameListInfo);
        });

        socket.on('join-game', gameid => {
            if (rooms[gameid]) {
                const userid = socket.request.user.id;
                dbQuery.joinGame(gameid, userid);
                rooms[gameid].players.push(userid);
                let playerNumber = rooms[gameid].players.length;
                socket.broadcast.emit('lobby-join-new-game', { gameid, playerNumber });
            }
        });

        socket.on('quit-game', gameid => {
            let userid = socket.request.user.id;
            if (rooms[gameid]) {
                let game = rooms[gameid]
                if (userid == game.host) {
                    dbQuery.deleteGame(gameid);
                    delete rooms[gameid];
                    socket.broadcast.emit('lobby-delete-game', gameid);
                } else {
                    dbQuery.quitGame(gameid, userid);
                    let index = rooms[gameid].players.indexOf(userid);
                    if (index > -1) {
                        rooms[gameid].players.splice(index, 1);
                        let playerNumber = rooms[gameid].players.length;
                        socket.broadcast.emit('lobby-quit-game', { gameid, playerNumber });
                    }

                }
            }
        });

        socket.on('start-game', gameid => {
            dbQuery.updateGamestate(gameid, 1);
            rooms[gameid].state = 1;
            socket.broadcast.emit('play-game', gameid);
        });

        socket.on('get-current-user', (gameid) => {
            let userid = socket.request.user.id;
            let creator = rooms[gameid].host;
            let playerNumber = rooms[gameid].players.length;
            socket.emit('start-game', { gameid, userid, creator, playerNumber });
        })

    });

    app.io = io;
};

module.exports = init;