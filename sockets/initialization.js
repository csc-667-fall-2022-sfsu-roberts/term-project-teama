
const socketIO = require("socket.io");
const passport = require("passport");
const formatMessage = require("../public/javascripts/messages")
const botName = "ChatCord Bot";

// whats the use of express-session & middleware?
// next step: how to create a session for room and add players into the room
const sessionMiddleware = require("../config/session");

const Server = socketIO.Server;

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
    console.log({
      message: "Connection happened",
      session: socket.request.session,
    });

    const username = socket.request.user.name;
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

  });

  app.io = io;

};

module.exports = init;
