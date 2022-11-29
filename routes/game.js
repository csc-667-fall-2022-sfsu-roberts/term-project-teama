const express = require("express");
const router = express.Router();
const dbQuery = require("../db/dbquery");
const { notLoggedInUser } = require('../config/authenticated');
const { request } = require("express");
/* Game */

/* PAGE: /game/:id */
router.get("/show/:id", async function(req, res, next) {
    let numPlayers = 4;
    let gameId = req.params.id;

    let head = '<link rel="stylesheet" href="/stylesheets/cards.css">\n' +
        '<link rel="stylesheet" href="/stylesheets/spots.css">\n' +
        '<link rel="stylesheet" href="/stylesheets/gameChatAvatar.css">\n' +
        '<link rel="stylesheet" href="/stylesheets/board_' + numPlayers + '.css">\n' +
        '<script src="/javascripts/game_board.js" defer="true" > </script>\n' +
        '<script src="/javascripts/game_chat.js" defer="true" > </script>\n';
    let attributes = {
        title: "Tock",
        gameId: gameId,
        siteCSS: false,
        user: req.user,
        userId: req.user.id,
        head: head,
        numPlayers: numPlayers,
    };
    if (gameId == -1) { // If this is not tied to the database and is a test game
        attributes.curPlayerIndex = 1;
        attributes.gamePlayerId = 1;
        attributes.players = [
            { name: "tryHard2012", avatar: 4 },
            { name: "wjplachno", avatar: 10 },
            { name: "jStangle", avatar: 3 },
            { name: "rubySoho1998", avatar: 5 }
        ];
        attributes.hands = [
            { location_id: -1, amount: 0 },
            { location_id: 0, amount: 5 },
            { location_id: 1, amount: 5 },
            { location_id: 2, amount: 5 },
            { location_id: 3, amount: 5 },
            { location_id: 18, amount: 34 }
        ];
        attributes.curHand = [
            { id: 1,cardID: 1, category: "Spade", value: 1 },
            { id: 2,cardID: 20, category: "Heart", value: 7 },
            { id: 3,cardID: 54, category: "Red", value: 0 },
            { id: 4,cardID: 24, category: "Heart", value: 11 },
            { id: 5,cardID: 52, category: "Club", value: 13 }
        ];
        attributes.marbles = [
            { id: 1, player_index: 3, current_spot: 16 },
            { id: 2, player_index: 2, current_spot: 12 },
            { id: 3, player_index: 1, current_spot: 8 },
            { id: 4, player_index: 0, current_spot: 33 },
            { id: 5, player_index: 3, current_spot: 15 },
            { id: 6, player_index: 2, current_spot: 11 },
            { id: 7, player_index: 1, current_spot: 7 },
            { id: 8, player_index: 0, current_spot: 3 },
            { id: 9, player_index: 3, current_spot: 14 },
            { id: 10, player_index: 2, current_spot: 10 },
            { id: 11, player_index: 1, current_spot: 6 },
            { id: 12, player_index: 0, current_spot: 2 },
            { id: 13, player_index: 3, current_spot: 13 },
            { id: 14, player_index: 2, current_spot: 9 },
            { id: 15, player_index: 1, current_spot: 5 },
            { id: 16, player_index: 0, current_spot: 1 }
        ];
    } else {
        /*
        console.log('gamepage, game', req.game)
        console.log('gamepage players', req.players)
        // let gamePlayer = dbQuery.findGamePlayer(gameId, req.user.id); 
        */
        attributes.players = req.players;
        attributes.gamePlayerId = req.user.gamePlayerId;
        attributes.curPlayerIndex = req.game.curPlayerIndex;
        attributes.hands = await dbQuery.countHands(gameId);
        attributes.curHand = await dbQuery.getHand(gameId, req.game.curPlayerIndex);
        attributes.marbles = await dbQuery.getMarbles(gameId);
        console.log(attributes);
    }
    res.render("game", attributes);
});

/* PAGE: /game/summary/:id */
router.get("/summary/:id", async function(req, res, next) {
    const user = req.user;
    const id = req.params.id;
    const game = await dbQuery.findGamesByGameId(id);
    const rank = await dbQuery.getRanking();
    let win = false;
    if (game.winner === user.id) {
        win = true;
    }
    res.render("summary", { title: "Tock", game: game, win: win, user: user, rankings: rank });
});

/* PAGE: /game/rules */
router.get("/rules", function(req, res, next) {
    res.render("rules", {
        title: "Tock",
        as_page: true,
        head: '<link rel="stylesheet" href="/stylesheets/cards.css">\n'
    });
});

/* PAGE: /game/create */
router.get("/create", notLoggedInUser, function(req, res, next) {
    const user = req.user;
    res.render("create", { user: user });
});

router.post("/create", async function(req, res, next) {
    try {
        const { gamename, user } = req.body;
        const gameid = await dbQuery.createNewGame(gamename, user.id)
        res.json({
            code: 1,
            gameid: gameid,
            user: user
        })
    } catch (err) {
        console.log(err)
    }
});

/* PAGE: /game/created/:id */
router.get("/created/:id", notLoggedInUser, async function(req, res, next) {
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

router.param("id", async(req, res, next, id) => {
    try {
        if (id > 0) {
            // console.log('userinfo', req.user);
            if (req.user == undefined) {
                res.redirect('/users/login');
            }
            let currentUser = req.user.id;
            let game = await dbQuery.findGamesByGameId(id);
            if (game) {
                req.game = {
                    id: id,
                    name: game.name,
                    state: game.state,
                    isPlayer: false
                };
                let gameusers = await dbQuery.findAllUsersByGameId(id);
                req.players = [];
                for (let i = 0; i < gameusers.length; i++) {
                    const userinfo = await dbQuery.findUserById(gameusers[i].player_id);
                    if (currentUser === userinfo.id) {
                        req.game.isPlayer = true;
                        req.game.curPlayerIndex = gameusers[i].player_index;
                        req.user.gamePlayerId = gameusers[1].id;
                    }
                    req.players[i] = {
                        id: userinfo.id,
                        name: userinfo.username,
                        avatar: userinfo.avatar,
                        iscreator: gameusers[i].player_index === 0,
                        player_index: gameusers[i].player_index
                    };
                }

                req.game.num = req.players.length;
                next();
            }
        }

    } catch (err) {
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