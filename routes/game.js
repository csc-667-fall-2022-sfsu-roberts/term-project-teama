var express = require("express");
var router = express.Router();

/* Game */

/* PAGE: /game/:id */
router.get("/:id", function (req, res, next) {
    res.render("game", { title: "Tock", gameId: req.params.id });
});

/* PAGE: /game/summary/:id */
router.get("/summary/:id", function (req, res, next) {
    res.render("summary", { title: "Tock", gameId: req.params.id });
});

/* PAGE: /game/create */
router.get("/create", function (req, res, next) {
    res.render("create", { title: "Create Game" });
});

/* PAGE: /game/create/:id */
router.get("/create/:id", function (req, res, next) {
    res.render("create", { title: "Waiting for Players", gameId: req.params.id });
});

/* API: /game/chat/:id 
router.get("/login/forget", function (req, res, next) {
    res.render("profile", { title: "Express" });
});
*/

/* API: /game/turn/:id 
router.get("/login/forget", function (req, res, next) {
    res.render("profile", { title: "Express" });
});
*/

module.exports = router;