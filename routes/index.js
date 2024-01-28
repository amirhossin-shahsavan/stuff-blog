var express = require("express");
var router = express.Router();

router.all("/user/", require("./user"));
router.all("/user/*", require("./user"));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
