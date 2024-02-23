var express = require("express");
var router = express.Router();

router.all("/user/", require("./user/index"));
router.all("/user/*", require("./user/index"));


module.exports = router;
