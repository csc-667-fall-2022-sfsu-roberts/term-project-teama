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

module.exports = {
    createNewUser,
    findUser
};