const express = require("express");
const router = express.Router();
const { notLoggedInUser } = require('../config/authenticated');
/* Lobby */

/* PAGE: /lobby */
router.get('/', notLoggedInUser, function (req, res, next) {
    const user = req.user
    res.render('lobby', { user: user });
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

/* API: /lobby/send 
router.get("/send", function (req, res, next) {
    res.render("profile", { title: "Express" });
});
*/

module.exports = router;