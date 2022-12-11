const bcrypt = require('bcrypt');
const localStrategy = require('passport-local').Strategy;
const db = require('../db')
const dbQuery = require('../db/dbquery')

function initilize(passport) {
    const authenticateUser = async (username, password, done) => {
        const user = await dbQuery.findUser(username);
        if (!user) {
            return done(null, false, { message: 'Invalid username or password' });
        } else {
            const compareResult = await bcrypt.compare(password, user.password);
            if (compareResult) {
                return done(null, user)
            } else {
                return done(null, false, { message: 'Invalid username or password' })
            }
        }

    }
    passport.use(new localStrategy({ usernameField: 'username' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        db.any(`SELECT "id", "username", "email", "avatar", "date_added", "wins", "loses" FROM "users"`)
            .then(results => {
                user = results.find(user => user.id === id)
                return done(null, user)
            })
    })
}

module.exports = initilize