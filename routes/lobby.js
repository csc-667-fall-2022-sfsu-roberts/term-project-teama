const express = require("express");
const router = express.Router();
const { notLoggedInUser } = require('../config/authenticated');
const dbQuery = require('../db/dbquery');
/* Lobby */

/* PAGE: /lobby */
router.get('/', notLoggedInUser, async function (req, res, next) {
    const user = req.user;
    const results = await dbQuery.findEngaedGames(user.id);
    const engaedGames = [];
    for (let i = 0; i < results.length; i++){
        engaedGames[i] = {
            game: results[i],
            numOfUsers: (await dbQuery.findNumOfUsersByGameId(results[i].id)).count
        }
    }
    // console.log('engaged',engaedGames);

    const games = [];
    const rs = await dbQuery.findNotEngagedGames(user.id);
   
    for (let i = 0; i < rs.length; i++){
        games[i] = {
            game:rs[i],
            numOfUsers: (await dbQuery.findNumOfUsersByGameId(rs[i].id)).count
        }
    }

    // console.log('Games',games);
    
    res.render('lobby', { user: user, engaedGames: engaedGames, games: games });
});

/* API: /lobby/send 
router.get("/send", function (req, res, next) {
    res.render("profile", { title: "Express" });
});
*/

module.exports = router;