var express = require("express");
var router = express.Router();

/* Login */

/* PAGE: /login */
router.get("/", function (req, res, next) {
    res.render("login", { title: "Tock" });
});

/* API: /forget 
router.get("/forget", function (req, res, next) {
    res.render("profile", { title: "Express" });
});
*/

module.exports = router;