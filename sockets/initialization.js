
const socketIO = require("socket.io");
const passport = require("passport");
const formatMessage = require("../public/javascripts/messages")
const botName = "ChatCord Bot";
const dbQuery = require("../db/dbquery")
// whats the use of express-session & middleware?
// next step: how to create a session for room and add players into the room
const sessionMiddleware = require("../config/session");

const Server = socketIO.Server;
let rooms = {};

const init = (httpServer, app) => {
  const io = new Server(httpServer);

  const wrap = (middleware) => (socket, next) =>
    middleware(socket.request, {}, next);
  io.use(wrap(sessionMiddleware));
  io.use(wrap(passport.initialize()));
  io.use(wrap(passport.session()));

  io.use((socket, next) => {
    const session = socket.request.session;

    if (socket.request.user) {
      console.log('authorized user', socket.request.user)
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
    socket.on('login', () => {
      console.log("A user logged in....");
      // Welcome current user
      // socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));
      // Broadcast when a user connects
      socket.emit(
        "message",
        formatMessage(1, botName, `${username} has joined the chat`)
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

    socket.on('new-game-created', async ({ user, gameid, gamename }) => {
      // socket.join(gameid);
      // let room = io.sockets.adapter.rooms;
      // console.log('join room', room)
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

    socket.on('join-game', async gameid => {
      let gameInfo = rooms[gameid];
      const userid = socket.request.session.passport.user;
      await dbQuery.joinGame(gameid, userid);
      // socket.join(gameid);
      rooms[gameid].players.push(userid);
      let playerNumber = rooms[gameid].players.length;
      if (playerNumber === 4) {
        dbQuery.updateGamestate(gameid, 1);
      }
      socket.broadcast.emit('lobby-join-new-game', { gameid, playerNumber });
    });

    socket.on('quit-game', gameid => {
      let gameInfo = rooms[gameid];
      let userid = socket.request.session.passport.user;
      /** need test */
      if (userid == gameInfo.host) {
        delete rooms[gameid];
        console.log('HOST, after delete', rooms)
        dbQuery.deleteGame(gameid);
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
    });
    
  });

  app.io = io;
};

module.exports = init;
