// authenticated user, cannot access login/signup
const LoggedInUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/lobby')
    }
    next()
}

// no login user can only go to home/login/signup
const notLoggedInUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('errorMessage', 'Please login to play with others');
    res.redirect('/users/login')
}

module.exports = {
    LoggedInUser,
    notLoggedInUser
};