var express = require("express");
var router = express.Router();

/* Logout */

/* PAGE: /logout */
router.get("/", function (req, res, next) {
    res.render("logout", { title: "Tock" });
});

module.exports = router;