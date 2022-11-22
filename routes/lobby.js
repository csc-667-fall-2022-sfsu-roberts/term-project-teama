const express = require("express");
const router = express.Router();
const { notLoggedInUser } = require('../config/authenticated');
const dbQuery = require('../db/dbquery');
/* Lobby */

/* PAGE: /lobby */
router.get('/', notLoggedInUser, async function (req, res, next) {
    const user = req.user;
    const {startedGames, normalGames} = await dbQuery.enOrStartedGames(user.id);
    const {notEngagedGames, fullGames} = await dbQuery.notEnOrFullGames(user.id);
    for(let i = 0; i < normalGames.length; i++) {
        let creator = normalGames[i].game.creator;
        normalGames[i].isCreator = false;
        if(user.id == creator && normalGames[i].isFull){
            normalGames[i].isCreator = true;
        }
    }
   
    /*
    console.log('en-started:', startedGames)
    console.log('en-normal:', normalGames)
    console.log('not-en:',notEngagedGames);
    console.log('not-en-full:',fullGames);
   */
  
    res.render('lobby', { user, startedGames, normalGames, notEngagedGames, fullGames });
});

/* API: /lobby/send 
router.get("/send", function (req, res, next) {
    res.render("profile", { title: "Express" });
});
*/

module.exports = router;