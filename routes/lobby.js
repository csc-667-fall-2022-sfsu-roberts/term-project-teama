const express = require("express");
const router = express.Router();
const { notLoggedInUser } = require('../config/authenticated');
const dbQuery = require('../db/dbquery');
/* Lobby */

/* PAGE: /lobby */
router.get('/', notLoggedInUser, async function (req, res, next) {
    const user = req.user
    const games = await dbQuery.findAllGames();
    const gamesinfo = [];
    for (let i = 0; i < games.length; i++){
        const numOfUsers = (await dbQuery.findAllUsersByGameId(games[i].id)).length;
        gamesinfo[i] = {
            id: games[i].id,
            gamename:games[i].name,
            nums: numOfUsers
        } ;
    }
    res.render('lobby', { user: user, games: gamesinfo });
});

/* API: /lobby/send 
router.get("/send", function (req, res, next) {
    res.render("profile", { title: "Express" });
});
*/

module.exports = router;