const express = require("express");
const router = express.Router();
const dbQuery = require("../db/dbquery");
const { notLoggedInUser } = require('../config/authenticated');
/* Game */

/* PAGE: /game/:id */
router.get("/show/:id", function (req, res, next) {
    let numPlayers = 4;
    res.render("game", { 
        title: "Tock", 
        gameId: req.params.id, 
        siteCSS: false,
        head: '<link rel="stylesheet" href="/stylesheets/cards.css">\n'
            + '<link rel="stylesheet" href="/stylesheets/spots.css">\n'
            + '<link rel="stylesheet" href="/stylesheets/gameChatAvatar.css">\n'
            + '<link rel="stylesheet" href="/stylesheets/board_'+numPlayers+'.css">\n'
            + '<script src="/javascripts/game_board.js" defer="true" > </script>\n'
            + '<script src="/javascripts/game_chat.js" defer="true" > </script>'
     });
});

/* PAGE: /game/summary/:id */
router.get("/summary/:id", function (req, res, next) {
    res.render("summary", { title: "Tock", gameId: req.params.id });
});

/* PAGE: /game/create */
router.get("/create", notLoggedInUser, function (req, res, next) {
    res.render("create", { username: req.user.name});
});

router.post("/create", notLoggedInUser, async function (req, res, next) {
    try {
        const {gamename} = req.body;
        const gameid = await dbQuery.createNewGame(gamename);
        await dbQuery.createNewGameUsers(gameid[0].id, req.user.id, true);
        console.log("gameid", gameid)
        console.log("userid", req.user.id)
        res.redirect(`/game/created/${gameid[0].id}`);
    } catch {
        res.redirect('/game/create')
    }
    
});

/* PAGE: /game/created/:id */
router.get("/created/:id",notLoggedInUser, async function (req, res, next) {
    const game = await dbQuery.findGamesByGameId(req.params.id);
    console.log('game', game);
    const gameusers = await dbQuery.findAllUsersByGameId(req.params.id);
    console.log(gameusers)
    const players = [];
    for(let i = 0; i < gameusers.length; i++) {
        console.log(gameusers[i].user_id)
        const userinfo = await dbQuery.findUserById(gameusers[i].user_id);
        console.log('user info', userinfo)
        players[i] = 
        { 
            info: userinfo,
            iscreator: gameusers[i].iscreator,
        };
    }
   
    const numberOfPlayers = players.length;
    let isFull = false;
    if(numberOfPlayers == 4){
        isFull = true;
    };

    res.render("created", { user: req.user, gamename: game.name, num: numberOfPlayers, players: players, isFull: isFull});
});

/* API: /game/chat/:id 
router.get("/login/forget", function (req, res, next) {
    res.render("profile", { title: "Express" });
});
*/

/* API: /game/turn/:id 
router.get("/login/forget", function (req, res, next) {
    res.render("profile", { title: "Express" });
});
*/

module.exports = router;