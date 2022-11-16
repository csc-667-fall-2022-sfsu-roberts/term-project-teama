const db = require('./index');

const createNewUser =  (name, email, password) => {
     db.any('INSERT INTO "User" (username, email, password) VALUES ( ${name}, ${email}, ${password})', {name, email, password})
};

const findUser = (input) => {
    return db.oneOrNone('SELECT * FROM "User" WHERE username=${input} OR email=${input}', {input})
}

const findUserById = (userid) => {
    return db.oneOrNone('SELECT * FROM "User" WHERE id=${userid}', {userid})
}

/* Game */

const concedeGame = (gameId, userId) => {
    // set Game_Player.hasConceded = true;
    // set Game.state = 2 and game.DateEnded = now
}
const createNewGame = (name) => {
    return db.one('INSERT INTO "Game" (username) VALUES ( ${name}) RETURNING id', {name})
}

const deleteGameById = (gameid) => {
    return db.any('DELETE FROM "Game" WHERE id=${gameid}', {gameid})
}

const findGameIdByUserId = (userid) => {
    return db.any('SELECT "gameID" FROM "Game_Player" WHERE "userID"=${userid}', {userid})
}

const findAllGames = () => {
    return db.any('SELECT * FROM "Game" ORDER BY id DESC');
}

const findGamesByGameId = (gameid) =>{
    return db.oneOrNone('SELECT * FROM "Game" WHERE id=${gameid}', {gameid});
}

const updateGamestate = (gameid, state) => {
    db.any('UPDATE "Game" SET state=${state} WHERE id=${gameid}', {gameid, state})
}

const userIsPlayingGame = (gameid, userid) => {
    let res = db.one('SELECT "userID" FROM "Game_Player" WHERE "gameID"=${gameId} AND "userID"=${userId}', {gameid, userid});
    if (res && res.length === 1) { return true; }
    return false;
}

const checkGameStarted = (gameId) => {
    let res = db.one('SELECT state FROM "Game" WHERE id=${gameId}', {gameid});
    if (res && res.state >= 1) { return true; }
    return false;
}

// Game_Player
const  createNewGameUsers = async (gameid, userid, iscreator) => {
    const results = await findAllUsersByGameId(gameid);
    const playerIndex = results.length + 1;
    if (iscreator) {
        await setCreator(gameid, userid);
    }
    return db.one('INSERT INTO "Game_Player" ("gameID", "userID", "playerIndex") VALUES (${gameid}, ${userid}, ${playerIndex}) RETURNING id', {gameid, userid, playerIndex});
}

const setCreator = (gameId, userId) => {
    return db.none('UPDATE "Game" SET creator=${userId} WHERE id=${gameId}', {gameId, userId});
}

const checkCreator = (gameId, userId) => {
    let res = db.one('SELECT creator FROM "Game" WHERE id=${gameId}', {gameId});
    if (res && res.creator === userId) { return true; }
    return false;
}

const findAllUsersByGameId = (gameid) => {
    return db.any('SELECT * FROM "Game_Player" WHERE "gameID"=${gameid} ORDER BY "playerIndex" ASC', {gameid})
}

const findUserByGameUserId = (gameid, userid) => {
    return db.oneOrNone('SELECT * FROM "Game_Player" WHERE "gameID"=${gameid} AND "userID"=${userid}', {gameid, userid})
}

const deleteUserByGameUserId = (gameid, userid) => {
    return db.any('DELETE FROM "Game_Player" WHERE "gameID"=${gameid} AND "userID"=${userid}', {gameid, userid})
}

const deleteALLUserByGameId = (gameid, userid) => {
    return db.any('DELETE FROM "Game_Player" WHERE "gameID"=${gameid}', {gameid, userid})
}

const updateToStarted = (gameid, userid) => {
    return updateGamestate(gameid, 1);
}

const findNumOfUsersByGameId = (gameid) => {
    return db.one('SELECT COUNT(*) FROM "Game_Player" WHERE "gameID"=${gameid}', {gameid})
}
const findEngagedGames = async (userid) => {
    return db.any('SELECT * FROM "Game" WHERE id IN (SELECT "gameID" FROM "Game_Player" WHERE "userID"=${userid}) ORDER BY id DESC', {userid})
}

const findNotEngagedGames = (userid) => {
    return db.any('SELECT * FROM "Game" WHERE id NOT IN (SELECT "gameID" FROM "Game_Player" WHERE "userID"=${userid}) ORDER BY id DESC', {userid})
}

const changeAvatar = (avatar_num, userid) => {
    return db.any('UPDATE "User" SET avatar=${avatar_num} WHERE id=${userid}', {avatar_num, userid})
}
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
    findNumOfUsersByGameId,
    findEngagedGames,
    findNotEngagedGames,
    updateGamestate,
    changeAvatar
};