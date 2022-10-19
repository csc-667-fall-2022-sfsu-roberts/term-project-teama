var express = require("express");
var router = express.Router();

/* Registration */

/* PAGE: /register */
router.get("/", function (req, res, next) {
    res.render("register", { layout: "form", title: "Tock" });
});

/* PAGE: /register/ok */
router.get("/ok", function (req, res, next) {
    res.render("registered", { layout: "form", title: "Tock" });
});

module.exports = router;