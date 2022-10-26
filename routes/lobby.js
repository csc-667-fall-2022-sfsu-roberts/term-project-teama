const express = require("express");
const router = express.Router();
const { notLoggedInUser } = require('../config/authenticated');
/* Lobby */

/* PAGE: /lobby */
router.get('/', notLoggedInUser, function (req, res, next) {
    const user = req.user
    res.render('lobby', { user: user });
});

/* API: /lobby/send 
router.get("/send", function (req, res, next) {
    res.render("profile", { title: "Express" });
});
*/

module.exports = router;