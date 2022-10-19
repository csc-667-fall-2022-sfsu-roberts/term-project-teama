var express = require("express");
var router = express.Router();

/* Landing */

/* PAGE: / */
router.get("/", function (req, res, next) {
    res.render("index", { title: "Tock" });
});

/* Page: /error. */
router.get("/error", function (req, res, next) {
    res.render("error", { title: "Tock" });
});

module.exports = router;
