var express = require("express");
var router = express.Router();

/* Profile */

/* PAGE: /profile */
router.get("/", function (req, res, next) {
    res.render("profile", { title: "Edit Profile" });
});

/* API: /profile/apply 
router.get("/apply", function (req, res, next) {
    res.render("profile", { title: "Express" });
});
*/

module.exports = router;