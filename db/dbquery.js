const db = require('./index');

const createNewUser = async (name, email, password) => {
    await db.any('INSERT INTO users (name, email, password) VALUES ( ${name}, ${email}, ${password})', {name, email, password})
    .catch(error => {
        console.log(error);
      })
};

const findUser = (input) => {
    return db.oneOrNone('SELECT * FROM users WHERE name=${input} OR email=${input}', {input})
}

const findUserById = (userid) => {
    return db.oneOrNone('SELECT * FROM users WHERE id=${userid}', {userid})
}

const createNewGame = (name) => {
    return db.any('INSERT INTO games (name) VALUES ( ${name}) RETURNING id', {name})
}

const findGameIdByUserId = (userid) => {
    return db.oneOrNone('SELECT game_id FROM game_users WHERE user_id=${userid}', {userid})
}

// game_users
const  createNewGameUsers = (gameid, userid, iscreator) => {
    console.log(iscreator);
    db.any('INSERT INTO game_users (game_id, user_id, iscreator) VALUES (${gameid}, ${userid}, ${iscreator})', {gameid, userid, iscreator});
}

const findAllUsersByGameId = (gameid) => {
    return db.any('SELECT * From game_users WHERE game_id=${gameid}', {gameid})
}

// games
const findAllGames = () => {
    return db.any('SELECT * FROM games ORDER BY id DESC');
}

const findGamesByGameId = (id) =>{
    return db.oneOrNone('SELECT * FROM games WHERE id=${id}', {id});
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
    findUserById
};