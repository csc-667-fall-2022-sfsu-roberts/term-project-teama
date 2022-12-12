const express = require("express");
const router = express.Router();
const dbQuery = require("../db/dbquery");
const { notLoggedInUser } = require('../config/authenticated');
const { makeValidator } = require("../models/validator");
/* Game */

/* PAGE: /game/:id */
router.get("/show/:id", async function (req, res, next) {
    let numPlayers = 4;
    let gameId = req.params.id;
    // console.log(req.game.state);
    if (req.game.state == 0) {
        res.redirect('/game/created/' + gameId);
    } else if (req.game.state == 2) {
        res.redirect('/game/summary/' + gameId);
    } else {

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
            attributes.activePlayer = true;
            attributes.hands = [
                { location_id: -1, amount: 0 },
                { location_id: 0, amount: 5 },
                { location_id: 1, amount: 5 },
                { location_id: 2, amount: 5 },
                { location_id: 3, amount: 5 },
                { location_id: 18, amount: 34 }
            ];
            attributes.curHand = [
                { id: 1, cardID: 1, category: "Spade", value: 1 },
                { id: 2, cardID: 20, category: "Heart", value: 7 },
                { id: 3, cardID: 54, category: "Red", value: 0 },
                { id: 4, cardID: 24, category: "Heart", value: 11 },
                { id: 5, cardID: 52, category: "Club", value: 13 }
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
            attributes.game = req.game;
            attributes.players = req.players;
            attributes.gamePlayerId = req.user.gamePlayerId;
            attributes.curPlayerIndex = req.game.curPlayerIndex;
            attributes.activePlayer = req.game.activePlayerIndex == req.game.curPlayerIndex;
            attributes.hands = await dbQuery.countHands(gameId);
            attributes.curHand = await dbQuery.getHand(gameId, req.game.curPlayerIndex);
            attributes.marbles = await dbQuery.getMarbles(gameId);
            // console.log(attributes);
        }
        res.render("game", attributes);
    }
});

/* PAGE: /game/summary/:id */
router.get("/summary/:id", async function (req, res, next) {
    const user = req.user;
    const id = req.params.id;
    const game = await dbQuery.findGamesByGameId(id);
    const gameUser = await dbQuery.findUserByGameUserId(id, user.id);
    const rank = await dbQuery.getRanking();
    let win = false;
    let concede = false;
    let isConcedePlayer = false;
    let playername;
    if (!game.winner) {
        concede = true;
        let game_players = await dbQuery.findPlayersByGameId(id);
        for (let i = 0; i < game_players.length; i++) {
            if (game_players[i].has_conceded) {
                if (game_players[i].player_id === user.id) {
                    isConcedePlayer = true;
                }
                playername = (await dbQuery.findUserById(game_players[i].player_id)).username;
            }
        }
    }else{
        if (game.winner === user.id) {
            win = true;
        }
    }
    console.log('request user', user, 'is concede player', isConcedePlayer, 'concede playername', playername);
    res.render("summary", { title: "Tock", game: game, concede: concede, isConcedePlayer: isConcedePlayer, playername: playername, win: win, user: user, rankings: rank });
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

router.post("/create", async function (req, res, next) {
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
router.get("/created/:id", notLoggedInUser, async function (req, res, next) {
    try {
        res.render("created", { user: req.user, game: req.game, players: req.players });
    } catch (err) {
        console.log(err)
    }
});

/** API: /game/state
*  req = { user_id, game_id }
*/
router.post("/state", async function (req, res, next) {
    console.log("State reached");
    console.log("Request Data: ");
    console.log(req.body);
    if (req.user == undefined) {
        res.json({ status: "illegal", message: "Please sign in." })
    } else {
        let data = {
            status: "spectator",
            gameID: req.body.game_id,
            user: req.user,
            userID: req.user.id,
            numPlayers: 4
        };
        let game = await dbQuery.findGamesByGameId(data.gameID);
        if (game) {
            data.game = {
                id: data.gameID,
                name: game.name,
                state: game.state,
                isPlayer: false,
                activePlayerIndex: game.turn
            };
            let gameusers = await dbQuery.findAllUsersByGameId(data.gameID);
            data.players = [];
            for (let playerIndex = 0; playerIndex < gameusers.length; playerIndex++) {
                let player = gameusers[playerIndex];
                const userinfo = await dbQuery.findUserById(player.player_id);
                console.log("Checking game_player for id " + data.userID + ": " + userinfo.id);
                if (data.userID === userinfo.id) {
                    data.game.isPlayer = true;
                    data.game.curPlayerIndex = player.player_index;
                    data.user.gamePlayerId = player.id;
                    data.curPlayer = player.player_index;
                    data.status = "player";
                }
                data.players[playerIndex] = {
                    id: userinfo.id,
                    name: userinfo.username,
                    avatar: userinfo.avatar,
                    isCreator: player.player_index === 0,
                    player_index: player.player_index
                };
            }
            data.activePlayer = false;
            data.hands = await dbQuery.countHands(data.gameID);
            data.marbles = await dbQuery.getMarbles(data.gameID);
            if (data.game.isPlayer) {
                if (data.game.curPlayerIndex == data.game.activePlayerIndex) {
                    data.activePlayer = true;
                }
                data.curHand = await dbQuery.getHand(data.gameID, data.game.curPlayerIndex);
            }
        }
        res.json(data);
    }
})

/** API: /game/move
*  req = {user_id, game_id, player_index, hand, card_used(card_id), moves(marble_id, from_spot_id, to_spot_id)}
*/
router.post("/move", async function (req, res, next) {
    console.log("Move reached");
    if (req.user) {
        let validator = makeValidator(req.body, req.user.id);
        let isValid = await validator.validate();
        if (isValid) {
            console.log("Valid!");
            let socketIO = req.app.io;
            let data = validator.truth;
            // Log the turn
            let turnId = await dbQuery.logTurn(data.game_player.id, data.card_used.card_id);
            console.log("logTurn");
            // Discard the used card
            await dbQuery.discardGameCards(data.card_used.id);
            console.log("Discarded card " + data.card_used.id);
            // Reorder the cards in hand
            for (let cardIndex = 0; cardIndex < data.cardShifts.length; cardIndex++) {
                let card = data.cardShifts[cardIndex];
                console.log("Moving card " + card.id + " to handIndex " + card.index);
                await dbQuery.setGameCardIndex(card.id, card.index);
            }
            // Log the moves and move the marbles
            for (let moveIndex = 0; moveIndex < data.moves.length; moveIndex++) {
                let move = data.moves[moveIndex];
                console.log("Logging move and updating marbles for:  (turnID:" + turnId.id + ")");
                console.log(move);
                await dbQuery.logMove(turnId.id, move.marble_id, move.from_spot_id, move.to_spot_id, move.movement_type);
                console.log("Move logged...");
                await dbQuery.updateMarbles(move.marble_id, move.to_spot_id);
                console.log("Marbles moved.");
            }
            // Check for end game
            if (data.gameOver) {
                // - - If so, edit the game table to complete the game
                await dbQuery.endGameByWin(data.game_id, data.user_id);
                // - - Send everyone to summary
                socketIO.to(data.game_id).emit("endGame", data.game_id);
            } else {
                // If still playing...
                let newTurn = (data.player_index + 1) % 4;
                let newDealer = data.game.dealer;
                // Check for joker use,
                if (data.card_used.value == 0) {
                    // - If so, deal another card and decrement turn
                    await dbQuery.getANewCard(data.game_id, data.player_index);
                    newTurn = data.player_index;
                }
                // Check for number of cards in hand and who is dealer
                console.log("Getting card counts...");
                data.rawCardCounts = await dbQuery.countHands(data.game_id);
                console.log("Deciphering...");
                data.cardCounts = [];
                console.log("cardCounts:");
                data.rawCardCounts.forEach((location) => {
                    console.log(location.location_id + ": " + location.amount);
                    data.cardCounts[location.location_id] = location.amount;
                });
                console.log("dealer: " + data.game.dealer);
                console.log("player: " + data.player_index);
                console.log("cardCount: " + data.cardCounts[data.player_index]);
                if (data.game.dealer == data.player_index && data.cardCounts[data.player_index] === undefined) {
                    console.log("Need to deal");
                    let numberOfCardsToDeal = 4;
                    // - Check number of cards in draw
                    console.log("Draw Count: " + data.cardCounts[18]);
                    if (data.cardCounts[18] === undefined || data.cardCounts[18] <= 2) {
                        // - - If 2 or less, reshuffle the deck, 
                        numberOfCardsToDeal = 5;
                        console.log("Need to reshuffle");
                        await dbQuery.reshuffleCards(data.game_id);
                        // - - Then increment dealer and set turn to (dealer +1)%4
                        newDealer = (newDealer + 1) % 4;
                        newTurn = (newDealer + 1) % 4;
                    }
                    // - Deal hand of cards (5 if just shuffled, 4 otherwise)
                    await dbQuery.dealCardsToPlayer(data.game_id, numberOfCardsToDeal);
                    console.log("Dealing cards");
                }
                // Increment turn ( %4 ) and send trigger to new player.
                console.log("Updating game " + data.game_id + " to " + newTurn + "|" + newDealer);
                await dbQuery.updateGameTurn(data.game_id, newTurn, newDealer);
                socketIO.to(data.game_id).emit("startTurn", newTurn);
            }
        }
        console.log("Sending Validator Status.");
        res.json(validator.getStatus());
    } else {
        res.json({ status: "Not Logged In." });
    }
})

/* PAGE: /game/concede/:id */
router.post("/concede", notLoggedInUser, async function (req, res, next) {
    const {gameId} = req.body;
    console.log("Hit concede { game_id: %i, user_id: %i", gameId, req.user.id);
    try {
        await dbQuery.setPlayerAsConceded(gameId, req.user.id);
        await dbQuery.endGameByConcession(gameId);
        // let socketIO = req.app.io;

        // socketIO.to(req.game.id).emit("endGame", req.game.id);
        res.json({
            code: 1,
        })
        
    } catch (err) {
        console.log(err)
    }
});

router.param("id", async (req, res, next, id) => {
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
                    isPlayer: false,
                    activePlayerIndex: game.turn
                };
                let gameusers = await dbQuery.findAllUsersByGameId(id);
                req.players = [];
                for (let i = 0; i < gameusers.length; i++) {
                    const userinfo = await dbQuery.findUserById(gameusers[i].player_id);
                    if (currentUser === userinfo.id) {
                        req.game.isPlayer = true;
                        req.game.curPlayerIndex = gameusers[i].player_index;
                        req.user.gamePlayerId = gameusers[i].id;
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