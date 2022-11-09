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
    res.render("rules", { title: "Tock" });
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
        const game = await dbQuery.createNewGame(gamename)
        await dbQuery.createNewGameUsers(game.id, user.id, true);
        // console.log(user.name, 'created', gamename, 'gameid =', game.id)
        res.redirect(`/game/created/${game.id}`);
    } catch (err) {
        console.log(err)
    }
});

/* PAGE: /game/created/:id */
router.get("/created/:id", notLoggedInUser, async function (req, res, next) {
    try {
        const currentUser = await dbQuery.findUserByGameUserId(req.game.id, req.user.id);
        if(currentUser){ 
            if(currentUser.isstarted){
                res.redirect(`/game/show/${req.game.id}`);
            }
        } 
        res.render("created", { user: req.user, game: req.game, players: req.players });
    } catch (err) {
        console.log(err)
    }
});

router.post("/join", notLoggedInUser, async (req, res, next) => {
    try {
        const { gameid } = req.body;
        const user = req.user;
        const results = await dbQuery.findUserByGameUserId(gameid, user.id);
        if (!results) {
            await dbQuery.createNewGameUsers(gameid, user.id, false);
            // console.log(user.name, 'joined in game', gameid)
        }
        res.json({
            code: 1,
            status: 'success'
        })
    } catch (err) {
        console.log(err)
    }
})

router.post("/quit", notLoggedInUser, async (req, res, next) => {
    try {
        const { gameid } = req.body;
        const user = req.user;
        const results = await dbQuery.findUserByGameUserId(gameid, user.id)
        if (results.iscreator) {
            await dbQuery.deleteALLUserByGameId(gameid);
            await dbQuery.deleteGameById(gameid);

        } else {
            await dbQuery.deleteUserByGameUserId(gameid, user.id);
        }
        console.log(user.name, 'quit from game', gameid)
        res.json({
            code: 1,
            status: 'success'
        })
    } catch (err) {
        console.log(err)
    }
})

router.post("/start", notLoggedInUser, async (req, res, next) => {
    try {
        const { gameid } = req.body;
        const user = req.user;
        console.log('start gameid', gameid, user);
        const requser = await dbQuery.findUserByGameUserId(gameid, user.id)
        if (!requser.isstarted) {
            await dbQuery.updateToStarted(gameid, user.id);
        }

        // if all users start game, then game.state become 1
        console.log(user.name, 'started', gameid)
        let gameState;
        
        res.json({
            code: 1,
            status: 'success'
        })
    } catch (err) {
        console.log(err)
    }
})

router.param("id", async (req, res, next, id) => {
    try {
        const game = await dbQuery.findGamesByGameId(id);
        req.game =
        {
            id: id,
            name: game.name,
            state: game.state
        };
        gameusers = await dbQuery.findAllUsersByGameId(id);
        req.players = [];
        let startedUser = 0;
        for (let i = 0; i < gameusers.length; i++) {
            const userinfo = await dbQuery.findUserById(gameusers[i].user_id);
            req.players[i] =
            {
                name: userinfo.name,
                // avatar: userinfo.avatar,
                iscreator: gameusers[i].iscreator,
                isstarted: gameusers[i].isstarted
            };
            if(gameusers[i].isstarted){
                startedUser += 1;
            }
        }
        // update game state=1 if all users start game
        if(startedUser == 4){
            req.game.state = 1;
            dbQuery.updateGamestate(req.game.id, 1)
        }
        req.game.num = req.players.length;
        if (req.game.num == 4) {
            req.game.isFull = true;
        } else {
            req.game.isFull = false;
        }
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