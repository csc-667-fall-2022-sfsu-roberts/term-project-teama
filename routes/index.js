const express = require("express");
const router = express.Router();
const dbQuery = require("../db/dbquery");

/* Landing */

/* PAGE: / */
router.get("/", async function (req, res, next) {
    const user = req.user;
    const rank = await dbQuery.getRanking();
    res.render("index", { user: user, rankings: rank });
});

/* Page: /error. */
router.get("/error", function (req, res, next) {
    res.render("error", { title: "Tock" });
});

module.exports = router;
