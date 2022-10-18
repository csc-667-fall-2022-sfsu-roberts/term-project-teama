var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", { title: "Express" });
});

/* GET login page. */
router.get("/login", function (req, res, next) {
    res.render("login", { title: "Express" });
});

/* GET logout page. */
router.get("/logout", function (req, res, next) {
    res.render("logout", { title: "Express" });
});

/* GET profile page. */
router.get("/profile", function (req, res, next) {
    res.render("profile", { title: "Express" });
});

/* GET ERROR page. */
router.get("/error", function (req, res, next) {
    res.render("error", { title: "Express" });
});

module.exports = router;
