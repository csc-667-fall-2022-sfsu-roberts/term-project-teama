const db = require('./index');

const createNewUser =  (name, email, password) => {
     db.any('INSERT INTO "users" ("username", "email", "password") VALUES ( ${name}, ${email}, ${password})', {name, email, password})
};

const findUser = (input) => {
    return db.oneOrNone('SELECT * FROM "users" WHERE "username"=${input} OR "email"=${input}', {input})
}

const findUserById = (userid) => {
    return db.oneOrNone('SELECT * FROM "users" WHERE "id"=${userid}', {userid})
}

/* Game */

const concedeGame = (gameId, userId) => {
    // set Game_Player.hasConceded = true;
    // set Game.state = 2 and game.DateEnded = now
}
const createNewGame = async (gamename, userid) => {
    let game = await db.one('INSERT INTO "games" ("name") VALUES ( ${gamename}) RETURNING "id"', {gamename})
    createNewGameUsers(game.id, userid, true);
    return game.id;
}

const joinGame = async (gameid, userid) => {
    const results = await findAllUsersByGameId(gameid);
    const playerIndex = results.length + 1;
    return db.one('INSERT INTO "game_players" ("game_id", "player_id", "player_index") VALUES (${gameid}, ${userid}, ${playerIndex}) RETURNING id', {gameid, userid, playerIndex});
}

const quitGame = (gameid, userid) => {
    return db.any('DELETE FROM "game_players" WHERE "game_id"=${gameid} AND "player_id"=${userid}', {gameid, userid})
}

const deleteGame = (gameid) => {
    db.any('DELETE FROM "game_players" WHERE "game_id"=${gameid}', {gameid});
    db.any('DELETE FROM "games" WHERE "id"=${gameid}', {gameid});
    return;
}

const deleteGameById = (gameid) => {
    return db.any('DELETE FROM "games" WHERE "id"=${gameid}', {gameid})
}

const findGameIdByUserId = (userid) => {
    return db.any('SELECT "game_id" FROM "game_players" WHERE "player_id"=${userid}', {userid})
}

const findAllGames = () => {
    return db.any('SELECT * FROM "games" ORDER BY "id" DESC');
}

const findGamesByGameId = (gameid) =>{
    return db.oneOrNone('SELECT * FROM "games" WHERE "id"=${gameid}', {gameid});
}

const updateGamestate = (gameid, state) => {
    db.any('UPDATE "games" SET "state"=${state} WHERE "id"=${gameid}', {gameid, state})
}

const userIsPlayingGame = (gameid, userid) => {
    let res = db.one('SELECT "player_id" FROM "game_players" WHERE "game_id"=${gameId} AND "player_id"=${userId}', {gameid, userid});
    if (res && res.length === 1) { return true; }
    return false;
}

const checkGameStarted = (gameId) => {
    let res = db.one('SELECT "state" FROM "games" WHERE "id"=${gameId}', {gameid});
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
    return db.one('INSERT INTO "game_players" ("game_id", "player_id", "player_index") VALUES (${gameid}, ${userid}, ${playerIndex}) RETURNING id', {gameid, userid, playerIndex});
}

const setCreator = (gameId, userId) => {
    return db.none('UPDATE "games" SET "creator"=${userId} WHERE "id"=${gameId}', {gameId, userId});
}

const checkCreator = (gameId, userId) => {
    let res = db.one('SELECT "creator" FROM "games" WHERE "id"=${gameId}', {gameId});
    if (res && res.creator === userId) { return true; }
    return false;
}

const findAllUsersByGameId = (gameid) => {
    return db.any('SELECT * FROM "game_players" WHERE "game_id"=${gameid} ORDER BY "player_index" ASC', {gameid})
}

const findUserByGameUserId = (gameid, userid) => {
    return db.oneOrNone('SELECT * FROM "game_players" WHERE "game_id"=${gameid} AND "player_id"=${userid}', {gameid, userid})
}

const deleteUserByGameUserId = (gameid, userid) => {
    return db.any('DELETE FROM "game_players" WHERE "game_id"=${gameid} AND "player_id"=${userid}', {gameid, userid})
}

const deleteALLUserByGameId = (gameid, userid) => {
    return db.any('DELETE FROM "game_players" WHERE "game_id"=${gameid}', {gameid, userid})
}

const updateToStarted = (gameid, userid) => {
    return updateGamestate(gameid, 1);
}

const numOfPlayers = (gameid) => {
    return db.one('SELECT COUNT(*) FROM "game_players" WHERE "game_id"=${gameid}', {gameid})
}

/** return notEngaged games, engagedGames, fullGames */
const engagedGames = async (userid) => {
    let enGames = [];
    let games = await db.any('SELECT * FROM "games" WHERE "id" IN (SELECT "game_id" FROM "game_players" WHERE "player_id"=${userid}) ORDER BY "date_created" DESC', {userid})
    for(let i = 0; i < games.length; i++){
        let num = (await numOfPlayers(games[i].id)).count;
        enGames[i] = {
            game: games[i],
            numOfUsers: num,
            isFull: (num==4)
        }
    }
    console.log(enGames)
    return enGames;
}

const notEngagedGames = (userid) => {
    return db.any('SELECT * FROM "games" WHERE "id" NOT IN (SELECT "game_id" FROM "game_players" WHERE "player_id"=${userid}) ORDER BY "id" DESC', {userid})
}

const notEnOrFullGames = async (userid) => {
    let rs = {
        fullGames: [],
        notEngagedGames:[]
    };
    let m = 0;
    let n = 0;
    let games = await notEngagedGames(userid);

    for(let i = 0; i < games.length; i++){
        let num =  (await numOfPlayers(games[i].id)).count;
        if(num == 4){
            rs.fullGames[m] = {
                game: games[i],
                numOfUsers: num
            }
            m++;
        }else{
            rs.notEngagedGames[n] = {
                game: games[i],
                numOfUsers: num
            }
            n++;
        }
    }
    return rs;
}

const changeAvatar = (avatar_num, userid) => {
    return db.any('UPDATE "users" SET "avatar"=${avatar_num} WHERE "id"=${userid}', {avatar_num, userid})
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
    numOfPlayers,
    engagedGames,
    notEnOrFullGames,
    updateGamestate,
    changeAvatar,
    joinGame,
    quitGame,
    deleteGame
};