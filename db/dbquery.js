const db = require('./index');

const createNewUser =  (name, email, password) => {
     db.any('INSERT INTO users (name, email, password) VALUES ( ${name}, ${email}, ${password})', {name, email, password})
};

const findUser = (input) => {
    return db.oneOrNone('SELECT * FROM users WHERE name=${input} OR email=${input}', {input})
}

const findUserById = (userid) => {
    return db.oneOrNone('SELECT * FROM users WHERE id=${userid}', {userid})
}

/* game */
const createNewGame = (name) => {
    return db.one('INSERT INTO games (name) VALUES ( ${name}) RETURNING id', {name})
}

const deleteGameById = (gameid) => {
    return db.any('DELETE FROM games WHERE id=${gameid}', {gameid})
}

const findGameIdByUserId = (userid) => {
    return db.any('SELECT game_id FROM game_users WHERE user_id=${userid}', {userid})
}

const findAllGames = () => {
    return db.any('SELECT * FROM games ORDER BY id DESC');
}

const findGamesByGameId = (gameid) =>{
    return db.oneOrNone('SELECT * FROM games WHERE id=${gameid}', {gameid});
}

const updateGamestate = (gameid, state) => {
    db.any('UPDATE games SET state=${state} WHERE id=${gameid}', {gameid, state})
}

// game_users
const  createNewGameUsers = async (gameid, userid, iscreator) => {
    const results = await findAllUsersByGameId(gameid);
    const playerIndex = results.length + 1;
    return db.one('INSERT INTO game_users (game_id, user_id, iscreator, playerindex) VALUES (${gameid}, ${userid}, ${iscreator}, ${playerIndex}) RETURNING id', {gameid, userid, iscreator, playerIndex});
}

const findAllUsersByGameId = (gameid) => {
    return db.any('SELECT * From game_users WHERE game_id=${gameid} ORDER BY playerindex ASC', {gameid})
}

const findUserByGameUserId = (gameid, userid) => {
    return db.oneOrNone('SELECT * From game_users WHERE game_id=${gameid} AND user_id=${userid}', {gameid, userid})
}

const deleteUserByGameUserId = (gameid, userid) => {
    return db.any('DELETE From game_users WHERE game_id=${gameid} AND user_id=${userid}', {gameid, userid})
}

const deleteALLUserByGameId = (gameid, userid) => {
    return db.any('DELETE From game_users WHERE game_id=${gameid}', {gameid, userid})
}

const updateToStarted = (gameid, userid) => {
    return db.any('UPDATE game_users SET isstarted=true WHERE game_id=${gameid} AND user_id=${userid}', {gameid, userid})
}

const findNumOfUsersByGameId = (gameid) => {
    return db.one('SELECT COUNT(*) FROM game_users WHERE game_id=${gameid}', {gameid})
}
const findEngaedGames = async (userid) => {
    return db.any('SELECT * FROM games WHERE id IN (SELECT game_id FROM game_users WHERE user_id=${userid}) ORDER BY id DESC', {userid})
}

const findNotEngagedGames = (userid) => {
    return db.any('SELECT * FROM games WHERE id NOT IN (SELECT game_id FROM game_users WHERE user_id=${userid}) ORDER BY id DESC', {userid})
}

const changeAvater = (avatar_num, userid) => {
    return db.any('UPDATE users SET avatar=${avatar_num} WHERE id=${userid}', {avatar_num, userid})
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
    findEngaedGames,
    findNotEngagedGames,
    updateGamestate,
    changeAvater
};