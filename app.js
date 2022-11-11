const { engine } = require("express-handlebars");

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");


if (process.env.NODE_ENV === "development") {
    require("dotenv").config();
}

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users")
const testsRouter = require("./routes/tests");
const gameRouter = require("./routes/game");
const lobbyRouter = require("./routes/lobby");

const app = express();

// view engine setup
app.engine("handlebars", engine({
    extname: 'handlebars',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: path.join(__dirname, '/views/partials/')
}));
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// session setting
const sessionInstance = require("./config/session");
app.use(sessionInstance);

// flash message
const flash = require("connect-flash");
app.use(flash());
app.use((req, res, next) => {
    res.locals.successMessage = req.flash('successMessage')
    res.locals.errorMessage = req.flash('errorMessage')
    res.locals.error = req.flash('error')
    next()
})

const passport = require('passport');
const initializePassport = require('./config/passport-config');
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session()); 

app.use("/", indexRouter);
app.use("/users", usersRouter)
app.use("/tests", testsRouter);
app.use("/game", gameRouter);
app.use("/lobby", lobbyRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
