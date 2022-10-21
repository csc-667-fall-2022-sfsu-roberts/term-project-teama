const express = require("express");
const router = express.Router();

/* Landing */

/* PAGE: / */
router.get("/", function (req, res, next) {
    const user = req.user;
    res.render("index", { user: user });
});

/* Page: /error. */
router.get("/error", function (req, res, next) {
    res.render("error", { title: "Tock" });
});

module.exports = router;
