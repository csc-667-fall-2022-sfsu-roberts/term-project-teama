const db = require('./index');

/* Table: Users */
// createNewUser(name, email, password)
// findUser(username)
// findUserById(userId)
// getRanking() - top 10 ranked by wins
// changeAvatar(avatar, userId)

const createNewUser = (name, email, password) => {
    db.any('INSERT INTO "users" ("username", "email", "password") VALUES ( ${name}, ${email}, ${password})', { name, email, password })
};

const findUser = (input) => {
    return db.oneOrNone('SELECT * FROM "users" WHERE "username"=${input} OR "email"=${input}', { input })
};

const findUserById = (userid) => {
    return db.oneOrNone('SELECT * FROM "users" WHERE "id"=${userid}', { userid })
};

const getRanking = () => {
    return db.any('SELECT * FROM "users" ORDER BY "wins" DESC LIMIT 10');
};

const changeAvatar = (avatar_num, userid) => {
    return db.any('UPDATE "users" SET "avatar"=${avatar_num} WHERE "id"=${userid}', { avatar_num, userid })
};

/* Table: Games */
// createNewGame(name, userId)
// findAllGames()
// findGamesByGameId(gameId)
// checkGameStarted(gameId)
// checkCreator(gameId, userId)
// findEnGames(userId) - Games the player has joined
// notEngagedGames(userId) - Games the player has not joined
// setCreator(gameId, userId)
// updateGamestate(gameId, state)
// updateToStarted(gameId, userId) - unnecesary request of userId
// endGameByConcession(gameId)
// endGameByWin(gameId, userId)
// updateGameTurn(gameId, playerIndex)
// deleteGameById(gameId)

const createNewGame = async (gamename, userid) => {
    let game = await db.one('INSERT INTO "games" ("name") VALUES ( ${gamename}) RETURNING "id"', { gamename })
    createNewGameUsers(game.id, userid, true);
    return game.id;
};

const findAllGames = () => {
    return db.any('SELECT * FROM "games" ORDER BY "id" DESC');
};

const findGamesByGameId = (gameid) => {
    return db.oneOrNone('SELECT * FROM "games" WHERE "id"=${gameid}', { gameid });
};

const checkGameStarted = (gameId) => {
    let res = db.one('SELECT "state" FROM "games" WHERE "id"=${gameId}', { gameid });
    if (res && res.state >= 1) { return true; }
    return false;
};

const checkCreator = (gameId, userId) => {
    let res = db.one('SELECT "creator" FROM "games" WHERE "id"=${gameId}', { gameId });
    if (res && res.creator === userId) { return true; }
    return false;
};

const findEnGames = (userid) => {
    return db.any('SELECT * FROM "games" WHERE "id" IN (SELECT "game_id" FROM "game_players" WHERE "player_id"=${userid}) ORDER BY "date_created" DESC', { userid })
};

const notEngagedGames = (userid) => {
    return db.any('SELECT * FROM "games" WHERE "id" NOT IN (SELECT "game_id" FROM "game_players" WHERE "player_id"=${userid}) ORDER BY "id" DESC', { userid })
};

const setCreator = (gameId, userId) => {
    return db.none('UPDATE "games" SET "creator"=${userId} WHERE "id"=${gameId}', { gameId, userId });
};

const updateGamestate = (gameid, state) => {
    db.none('UPDATE "games" SET "state"=${state} WHERE "id"=${gameid}', { gameid, state })
};

const updateToStarted = (gameid, userid) => {
    return updateGamestate(gameid, 1);
};

const endGameByConcession = (game_id)=>{
    return db.oneOrNone('UPDATE "games" SET "state"=2, "date_ended"=NOW() WHERE "id"=${game_id}', { game_id });
};

const endGameByWin = async (game_id, user_id)=>{
    await db.oneOrNone('UPDATE "games" SET "state"=2, "winner"=${user_id}, "date_ended"=NOW() WHERE "id"=${game_id}', { game_id, user_id });
    let players = await findAllUsersByGameId(game_id);
    for(let i = 0; i < players.length; i++){
        let id = players[i].player_id;
        if(id === user_id){
            await db.oneOrNone('UPDATE "users" SET "wins"="wins"+1 WHERE "id"=${id}', {id});
        }else{
            await db.oneOrNone('UPDATE "users" SET "loses"="loses"+1 WHERE "id"=${id}', {id});
        }
    } 
    return;
};

const updateGameTurn = (game_id, turn, dealer) => {
    if (dealer == undefined) {
        return db.none('UPDATE games SET turn=${turn} WHERE id=${game_id}', {turn, game_id});
    } else {
        return db.none('UPDATE games SET turn=${turn}, dealer=${dealer} WHERE id=${game_id}', {turn, dealer, game_id});
    }
};

const deleteGameById = (gameid) => {
    return db.any('DELETE FROM "games" WHERE "id"=${gameid}', { gameid })
};

/* Table: Game_Players */
// createNewGameUsers(gameId, userId, isCreator)
// joinGame(gameId, userId) - possible recode of createNewGameUsers
// numOfPlayers(gameId)
// findAllUsersByGameId(gameId)
// findGameIdByUserId(userId)
// findGamePlayer(gameId, userId)
// findUserByGameUserId(gameId, userId) - repeat of findGamePlayer
// userIsPlayingGame(gameId, userId) - boolean repeat of findGamePlayer
// updatePlayerIndex(gameId, playerIndex) - Why is this necessary?
// setPlayerAsConceded(gameId, userId)
// deleteUserByGameUserId(gameId, userId)
// deleteALLUsersByGameId(gameId, userId) - Uneccessary userId
// quitGame(gameId, userId)

const createNewGameUsers = async (gameid, userid, iscreator) => {
    const results = await findAllUsersByGameId(gameid);
    const playerIndex = results.length;
    if (iscreator) {
        await setCreator(gameid, userid);
    }
    return db.one('INSERT INTO "game_players" ("game_id", "player_id", "player_index") VALUES (${gameid}, ${userid}, ${playerIndex}) RETURNING id', { gameid, userid, playerIndex });
};

const joinGame = async (gameid, userid) => {
    const results = await findAllUsersByGameId(gameid);
    const playerIndex = results.length;
    db.one('INSERT INTO "game_players" ("game_id", "player_id", "player_index") VALUES (${gameid}, ${userid}, ${playerIndex}) RETURNING id', { gameid, userid, playerIndex });
    return;
};

const numOfPlayers = (gameid) => {
    return db.one('SELECT COUNT(*) FROM "game_players" WHERE "game_id"=${gameid}', { gameid })
};

const findAllUsersByGameId = (gameid) => {
    return db.any('SELECT * FROM "game_players" WHERE "game_id"=${gameid} ORDER BY "player_index" ASC', { gameid })
};

const findGameIdByUserId = (userid) => {
    return db.any('SELECT "game_id" FROM "game_players" WHERE "player_id"=${userid}', { userid })
};

const findPlayersByGameId = (gameid) => {
    return db.any('SELECT * FROM "game_players" WHERE "game_id"=${gameid}', { gameid });
}

const findGamePlayer = (game_id, user_id) => {
    return db.oneOrNone('SELECT * FROM "game_players" WHERE "game_id"=${game_id} AND "player_id"=${user_id}', { game_id, user_id });
};

const findUserByGameUserId = (gameid, userid) => {
    return db.oneOrNone('SELECT * FROM "game_players" WHERE "game_id"=${gameid} AND "player_id"=${userid}', { gameid, userid })
};

const userIsPlayingGame = (gameid, userid) => {
    let res = db.one('SELECT "player_id" FROM "game_players" WHERE "game_id"=${gameId} AND "player_id"=${userId}', { gameid, userid });
    if (res && res.length === 1) { return true; }
    return false;
};

const updatePlayerIndex = (gameid, index) => {
    db.any('SELECT id FROM "game_players" WHERE "game_id"=${gameid} AND player_index>${index} ORDER BY "player_index" ASC', { gameid, index })
        .then(players => {
            for (let i = 0; i < players.length; i++) {
                let id = players[i].id;
                console.log('game_playerid', players, id)
                db.none('UPDATE game_players SET player_index=player_index-1 WHERE id=${id}', { id });
            }
        })
};

const setPlayerAsConceded = (game_id, user_id)=>{
    return db.oneOrNone('UPDATE "game_players" SET "has_conceded"=true WHERE "game_id"=${game_id} AND "player_id"=${user_id}', { game_id, user_id })
};

const deleteUserByGameUserId = (gameid, userid) => {
    return db.any('DELETE FROM "game_players" WHERE "game_id"=${gameid} AND "player_id"=${userid}', { gameid, userid })
};

const deleteALLUserByGameId = (gameid, userid) => {
    return db.any('DELETE FROM "game_players" WHERE "game_id"=${gameid}', { gameid, userid })
};

const quitGame = (gameid, userid) => {
    db.one('DELETE FROM "game_players" WHERE "game_id"=${gameid} AND "player_id"=${userid} RETURNING player_index', { gameid, userid })
        .then(rs => {
            let index = rs.player_index;
            console.log('quit game', index)
            updatePlayerIndex(gameid, index);
        })
};

/* Table: Game_Cards */
// insertCard(gameId, cardId, index)
// countHands(gameId)
// getHand(gameId, playerIndex)
// getCardIDs(gameId)
// discardGameCards(gameCardsId)
// setGameCardIndex(id, index)
// getANewCard(gameId, playerIndex)

const insertCard = (game_id, value, index) => {
    db.oneOrNone('INSERT INTO game_cards(game_id, card_id, location_id, index) VALUES(${game_id}, ${value}, 18, ${index})', { game_id, value, index });
};

const countHands = (game_id) => {
    return db.any('SELECT COUNT(card_id) AS "amount", location_id FROM game_cards WHERE game_id=${game_id} GROUP BY location_id ORDER BY location_id ASC', { game_id });
};

const getHand = (game_id, player_index) => {
    return db.any('SELECT cards.suite AS "category", cards.value AS "value", cards.id AS "card_id", game_cards.id AS "id", game_cards.index AS "index" FROM game_cards INNER JOIN cards ON game_cards.card_id=cards.id WHERE game_id=${game_id} AND location_id=${player_index}', { game_id, player_index });
    // return db.any('SELECT cards.suite AS "category", cards.value AS "value" FROM cards WHERE cards.id IN (SELECT card_id from game_cards WHERE game_id=${game_id} AND location_id=${player_index})', { game_id, player_index });
};

const getCardIDs = (game_id) => {
    return db.any('SELECT id FROM game_cards WHERE game_id=${game_id};', { game_id });
};

const discardGameCards = (id) => {
    return db.one('UPDATE "game_cards" SET "location_id"=-1 WHERE "id"=${id} RETURNING location_id;', {id});
};

const setGameCardIndex = (id, index) => {
    return db.one('UPDATE game_cards SET index=${index} WHERE id=${id} RETURNING index', {id, index});
};

const resetGameCard = (id, index) => {
    return db.one('UPDATE game_cards SET index=${index}, location_id=18 WHERE id=${id} RETURNING index', {id, index});
};

const getANewCard = (game_id, player_index) => {
    return db.one('UPDATE game_cards SET location_id=${player_index} WHERE id IN (SELECT id FROM game_cards WHERE location_id = 18 AND game_id = ${ game_id } ORDER BY index ASC FETCH FIRST 1 ROWS ONLY) RETURNING card_id', {player_index, game_id});
};

/* Table: Marbles */
// addMarbles(gameId, playerId, spotId, marbleIndex)
// getMarbles(gameId)
// marblePlayerId(gameId, spotId)
// marblePlayerIndex(gameId, marbleId) - What is this for?
// updateMarbles(marbleId, spotId)

const addMarbles = (game_id, player_id, spot_id, marbleIndex) => {
    return db.oneOrNone('INSERT INTO marbles (game_id, player_id, spot_id, marble_index) VALUES (${game_id}, ${player_id}, ${spot_id}, ${marbleIndex})', { game_id, player_id, spot_id, marbleIndex });
};

const getMarbles = (game_id) => {
    return db.any("SELECT id, player_index, current_spot FROM (SELECT m.game_id AS game_id, m.id AS id, gp.player_index AS player_index, m.spot_id AS current_spot FROM marbles m INNER JOIN game_players gp ON m.game_id=gp.game_id AND m.player_id=gp.player_id) AS rs WHERE game_id=${game_id}", { game_id });
};

const marblePlayerId = (game_id, spot_id) => {
    return db.any('SELECT id, player_id, marble_index from marbles WHERE game_id=${game_id} AND spot_id=${spot_id}', {spot_id, game_id});
};

const marblePlayerIndex = (game_id, marble_id) => {
    return db.one('SELECT player_index, marble_index FROM ((SELECT game_id, player_id, marble_index FROM marbles WHERE game_id=${game_id} and id=${marble_id}) AS m INNER JOIN game_players gp ON m.game_id=gp.game_id AND m.player_id=gp.player_id) AS rs', {game_id, marble_id})
};

const updateMarbles = (marble_id, spot_id) => {
    return db.none('UPDATE marbles SET spot_id=${spot_id} WHERE id=${marble_id}', {spot_id, marble_id});
};

/* Table: Turns */
// logTurn(gamePlayerId, cardId)
// countCardUsageInGame(gamePlayerId, cardValue) TODO
// countTotalCardUsage(playerId, cardValue) TODO

const logTurn = (gamePlayerId, cardId) => {
    return db.one('INSERT INTO "turns" ("game_player_id", "card_id") VALUES ( ${gamePlayerId}, ${cardId}) RETURNING "id"', { gamePlayerId, cardId })
};

/* Table: Moves */
// logMove(turnId, marbleId, fromSpotId, toSpotId, movementType)
// countTocks(playerId, gameId) TODO
// countSwitched(playerId, gameId) TODO - (number of moves with movementType.Switch)/2 TODO
// countStarts(playerId, gameId) TODO

const logMove = (turnId, marbleId, fromSpotId, toSpotId, movementType) => {
    return db.oneOrNone('INSERT INTO "moves" ("turn_id", "marble_id", "from_spot_id", "to_spot_id", "movement_type") VALUES (${turnId}, ${marbleId}, ${fromSpotId}, ${toSpotId}, ${movementType})', { turnId, marbleId, fromSpotId, toSpotId, movementType });
}

/* Logic */

/* routes/lobby */
const playersInGame = async (gameid) => {
    let gameusers = await findAllUsersByGameId(gameid);
    let game_players = [];
    for (let k = 0; k < gameusers.length; k++) {
        const userinfo = await findUserById(gameusers[k].player_id);
        game_players[k] = {
            name: userinfo.username,
            avatar: userinfo.avatar,
            iscreator: gameusers[k].player_index === 0
        };
    }
    return game_players;
};

const enOrStartedGames = async (userid) => {
    let rs = {
        startedGames: [],
        normalGames: [],
        endedGames: []
    };
    let m = 0;
    let n = 0;
    let q = 0;
    let games = await findEnGames(userid);
    for (let i = 0; i < games.length; i++) {
        let num = (await numOfPlayers(games[i].id)).count;
        if (num && num > 0) {
            if (games[i].state == 1) {
                rs.startedGames[m] = {
                    game: games[i],
                    numOfUsers: num,
                    isFull: (num == 4),
                    players: await playersInGame(games[i].id)
                };
                m++;
            } else if(games[i].state == 2 && games[i].winner !== null){
                rs.endedGames[q] = {
                    game: games[i],
                    numOfUsers: num,
                    winner: (await findUserById(games[i].winner)).username,
                    players: await playersInGame(games[i].id)
                };
                q++;
            } else if(games[i].state == 0){
                rs.normalGames[n] = {
                    game: games[i],
                    numOfUsers: num,
                    isFull: (num == 4),
                    players: await playersInGame(games[i].id)
                };
                n++;
            }
        }
    }
    return rs;
};

const notEnOrFullGames = async (userid) => {
    let rs = {
        fullGames: [],
        notEngagedGames: []
    };
    let m = 0;
    let n = 0;
    let games = await notEngagedGames(userid);
    for (let i = 0; i < games.length; i++) {
        let num = (await numOfPlayers(games[i].id)).count;
        if (num && num > 0) {
            if (num == 4) {
                rs.fullGames[m] = {
                    game: games[i],
                    numOfUsers: num,
                    players: await playersInGame(games[i].id)
                }
                m++;
            } else {
                rs.notEngagedGames[n] = {
                    game: games[i],
                    numOfUsers: num,
                    players: await playersInGame(games[i].id)
                }
                n++;
            }
        }
    }
    return rs;
};

/* socket/initialization */
const initRooms = async () => {
    let rooms = {};
    let games = await db.any('SELECT * FROM "games" WHERE state != 2 ORDER BY "id" DESC');;
    if (games) {
        for (let i = 0; i < games.length; i++) {
            let game = games[i];
            rooms[game.id] = {};
            rooms[game.id].gamename = game.name;
            rooms[game.id].state = game.state;
            rooms[game.id].host = game.creator;
            let players = await findAllUsersByGameId(game.id);
            if (players) {
                rooms[game.id].players = [];
                for (let j = 0; j < players.length; j++) {
                    // rooms[game.id].players[j] = {};
                    let playerInfo = await findUserById(players[j].player_id);
                    rooms[game.id].players[j] = {
                        id: players[j].player_id,
                        username: playerInfo.username,
                        avatar: playerInfo.avatar
                    }
                }
            }
        }
    }
    return rooms;
};

const deleteGame = (gameid) => {
    db.any('DELETE FROM "game_players" WHERE "game_id"=${gameid}', { gameid })
    .then(rs => {
        db.any('DELETE FROM "games" WHERE "id"=${gameid}', { gameid });
    })
    return;
};

const shuffle = () => {
    let cards = Array.from({ length: 54 }, (_, i) => i + 1);
    let currentIndex = cards.length,
        randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [cards[currentIndex], cards[randomIndex]] = [cards[randomIndex], cards[currentIndex]];
    }
    return cards;
};

/** initialize cards for a game when game start or game_cards all used */
const initialCards = (game_id) => {
    let cards = shuffle();
    for (let i = 0; i < cards.length; i++) {
        insertCard(game_id, cards[i], i);
    }
};

const reshuffleCards = async (game_id) => {
    console.log("Reshuffling...");
    let cardIDs = await getCardIDs(game_id);
    let cardIndices = shuffle();
    for (let cardIDIndex = 0; cardIDIndex < cardIDs.length; cardIDIndex++){
        console.log("Card "+cardIDs[cardIDIndex].id+" placed at "+cardIndices[cardIDIndex]);
        await resetGameCard(cardIDs[cardIDIndex].id, cardIndices[cardIDIndex]);
    }
    console.log("Done");
}

/* dbQuery.dealCardsToPlayer(game_id, player_index, handSize) */
const HANDCARDS =
    "UPDATE game_cards SET location_id = ${ player_index } WHERE id IN (SELECT id FROM game_cards WHERE location_id = 18 AND game_id = ${ game_id } ORDER BY index ASC FETCH FIRST ${handSize} ROWS ONLY)";

const dealCardsToPlayer = async (game_id, hand_size=5) => {
    for (let player_index = 0; player_index < 4; player_index++) {
        await db.none(HANDCARDS, { player_index: player_index, game_id: game_id, handSize: hand_size });
    }
    return true;
};

const handCards = (player_index) => {
    let cards = [];
    db.any("select card_id from game_cards where location_id = ${player_index}", { player_index })
        .then(rs => {
            console.log('get players cards', rs);
            for (let i = 0; i < rs.length; i++) {
                cards[i] = rs.card_id;
            }
            console.log(player_index, cards);
        })
    return cards;
};

module.exports = {
    createNewUser,
    findUser,
    createNewGame,
    findGameIdByUserId,
    findAllUsersByGameId,
    findAllGames,
    findGamesByGameId,
    createNewGameUsers,
    findUserById,
    findUserByGameUserId,
    deleteGameById,
    deleteUserByGameUserId,
    deleteALLUserByGameId,
    updateToStarted,
    numOfPlayers,
    enOrStartedGames,
    notEnOrFullGames,
    updateGamestate,
    changeAvatar,
    joinGame,
    quitGame,
    deleteGame,
    initRooms,
    getRanking,
    findPlayersByGameId,
    findGamePlayer,
    countHands,
    getHand,
    getMarbles,
    addMarbles,
    initialCards,
    dealCardsToPlayer,
    handCards,
    marblePlayerId,
    updateMarbles,
    setPlayerAsConceded,
    endGameByConcession,
    marblePlayerIndex,
    discardGameCards,
    updateGameTurn,
    getANewCard,
    logTurn,
    logMove,
    setGameCardIndex,
    endGameByWin,
    getCardIDs, 
    reshuffleCards
};