var express = require("express");
var router = express.Router();

/* Lobby */

/* PAGE: /lobby */
router.get("/", function (req, res, next) {
    res.render("lobby", { title: "Tock" });
});

/* API: /lobby/send 
router.get("/send", function (req, res, next) {
    res.render("profile", { title: "Express" });
});
*/

module.exports = router;