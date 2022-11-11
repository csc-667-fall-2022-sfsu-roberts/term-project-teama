const session = require("express-session");

const sessionInstance = session({
    secret: "secretvalue",
    resave: false,
    saveUninitialized: false
})

module.exports = sessionInstance;