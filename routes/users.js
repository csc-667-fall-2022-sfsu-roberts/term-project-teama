const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const initilizePassport = require('../config/passport-config');
const dbQuery = require('../db/dbquery');
initilizePassport(passport);
const { LoggedInUser, notLoggedInUser } = require('../config/authenticated');

/* PAGE: /login */
router.get("/login", LoggedInUser, function (req, res, next) {
    res.render("login");
});

router.post('/login', LoggedInUser, passport.authenticate('local', {
    successRedirect: '../lobby',
    failureRedirect: '/users/login',
    failureFlash: true
})
);

/* PAGE: /register */
router.get("/register", LoggedInUser, function (req, res, next) {
    res.render("register");
});

router.post("/register", LoggedInUser, async (req, res) => {
    const { username, email, password } = req.body;
    const registerErrors = [];

    const validEmail = await dbQuery.findUser(email);
    const validUsername = await dbQuery.findUser(username);
    if (validEmail || validUsername) registerErrors.push({ message: 'The username or email already exists. Please try another one.' })

    if (registerErrors.length) {
        res.render('register', { registerErrors, username, email, password })
        return
    }

    try {
        const hashedPWD = await bcrypt.hash(password, 10);
        await dbQuery.createNewUser(username, email, hashedPWD);
        res.redirect('/users/registered')
    } catch {
        res.redirect('/users/register')
    }
});

router.get("/registered", function (req, res, next) {
    res.render("registered");
});

router.get("/reset", function (req, res, next) {
    res.render("reset");
});

router.get("/profile", notLoggedInUser, function (req, res, next) {
    const user = req.user;
    res.render("profile", { user: user });
});

router.get("/logout", notLoggedInUser, function (req, res, next) {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('successMessage', 'You have logged out successfully');
        res.redirect("../users/login");
    });
});

module.exports = router;
