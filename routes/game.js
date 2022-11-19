const express = require("express");
const router = express.Router();
const dbQuery = require("../db/dbquery");
const { notLoggedInUser } = require('../config/authenticated');
/* Game */

/* PAGE: /game/:id */
router.get("/show/:id", function (req, res, next) {
    let numPlayers = 4;
    let gameId = req.params.id;
    let head = '<link rel="stylesheet" href="/stylesheets/cards.css">\n'
    + '<link rel="stylesheet" href="/stylesheets/spots.css">\n'
    + '<link rel="stylesheet" href="/stylesheets/gameChatAvatar.css">\n'
    + '<link rel="stylesheet" href="/stylesheets/board_'+numPlayers+'.css">\n'
    + '<script src="/javascripts/game_board.js" defer="true" > </script>\n'
    + '<script src="/javascripts/game_chat.js" defer="true" > </script>\n';
    console.log('gamepage, game', req.game)
    console.log('gamepage players', req.players)
    res.render("game", { 
        title: "Tock", 
        gameId: gameId, 
        siteCSS: false,
        head: head,
        numPlayers: 4,
        curPlayerIndex: 1,
        player: [
            { name: "tryHard2012", avatar: 4 },
            { name: "wjplachno", avatar: 10 },
            { name: "jStangle", avatar: 3 },
            { name: "rubySoho1998", avatar: 5}
        ],
        hands: [5, 5, 5, 5],
        curHand: [
            { category: "Spade", value: 2 },
            { category: "Heart", value: 6 },
            { category: "Red", value: 0 },
            { category: "Heart", value: 11 },
            { category: "Club", value: 13 }
        ]
     });
});

/* PAGE: /game/summary/:id */
router.get("/summary/:id", function (req, res, next) {
    res.render("summary", { title: "Tock", gameId: req.params.id });
});

/* PAGE: /game/rules */
router.get("/rules", function (req, res, next) {
    res.render("rules", { 
        title: "Tock", 
        as_page: true,
        head: '<link rel="stylesheet" href="/stylesheets/cards.css">\n' 
    });
});

/* PAGE: /game/create */
router.get("/create", notLoggedInUser, function (req, res, next) {
    const user = req.user;
    res.render("create", { user: user });
});

router.post("/create", notLoggedInUser, async function (req, res, next) {
    try {
        const { gamename } = req.body;
        const user = req.user;
        const gameid = await dbQuery.createNewGame(gamename, user.id)
        res.json({
            code: 1,
            gameid: gameid,
            user: req.user
        })
    } catch (err) {
        console.log(err)
    }
});

/* PAGE: /game/created/:id */
router.get("/created/:id", notLoggedInUser, async function (req, res, next) {
    try {
        /*
        const gameInfo = findGamesByGameId(req.game.id);
        if (gameInfo) {
            if (gameInfo.state === 1){
                if (userIsPlayingGame(req.game.id, req.user.id)){
                    res.redirect(`/game/show/${req.game.id}`);
                } else {
                    res.redirect('/lobby');
                }
                
            }
        } 
        */
       
        res.render("created", { user: req.user, game: req.game, players: req.players });
    } catch (err) {
        console.log(err)
    }
});

router.param("id", async (req, res, next, id) => {
    try {
        let currentUser = req.user.id;
        let game = await dbQuery.findGamesByGameId(id);
        req.game =
        {
            id: id,
            name: game.name,
            state: game.state,
            isPlayer: false
        };
        let gameusers = await dbQuery.findAllUsersByGameId(id);
        req.players = [];
        for (let i = 0; i < gameusers.length; i++) {
            const userinfo = await dbQuery.findUserById(gameusers[i].player_id);
            if(currentUser === userinfo.id){
                req.game.isPlayer = true;
            }
            req.players[i] =
            {
                name: userinfo.username,
                avatar: userinfo.avatar,
                iscreator: gameusers[i].player_index===1    
            };
        }
   
        req.game.num = req.players.length;
        next();
    }catch (err) {
        console.log(err)
    }
})

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