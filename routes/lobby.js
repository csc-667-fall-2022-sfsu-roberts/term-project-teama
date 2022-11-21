const express = require("express");
const router = express.Router();
const { notLoggedInUser } = require('../config/authenticated');
const dbQuery = require('../db/dbquery');
/* Lobby */

/* PAGE: /lobby */
router.get('/', notLoggedInUser, async function (req, res, next) {
    const user = req.user;
    const engagedGames = await dbQuery.engagedGames(user.id);
    const { notEngagedGames, fullGames } = await dbQuery.notEnOrFullGames(user.id);
    /*
    console.log('en:',engagedGames);
    console.log('not-en:',notEngagedGames);
    console.log('not-en-full:',fullGames);
    */

    res.render('lobby', { user, engagedGames, notEngagedGames, fullGames });
});

/* API: /lobby/send 
router.get("/send", function (req, res, next) {
    res.render("profile", { title: "Express" });
});
*/

module.exports = router;