var express = require("express");
var router = express.Router();
const User = require("../../model/User.model");

router.post("/user/register", async function (req, res, next) {
  const { firstname, lastname, email, password } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        code: -10001,
        msg: "enter your email",
      });
    }

    var user = await User.findOne({ email: email });
    if (!user) {
      user = await new User({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
      }).save();
    }
    return res.status(200).json({
      code: 10001,
      msg: "user registered",
    });
  } catch (error) {
    return res.status(400).json({
      code: -10001,
      msg: "server crashed",
    });
  }
});

router.post("/user/login", async function (req, res) {
  try {
    const { email, password } = req.body;
    var user = await User.findOne({ email });
س
    if (!user) {
      return res.status(404).json({
        code: -10001,
        msg: "email or password wrong",
      });
    }
    var isok = await user.ComparePasssword(password, user.password);
    if (!isok) {
      return res.status(402).json({
        code: -10001,
        msg: "invalid login credentional",
      });
    }
    var jwtToken = await user.CreateToken();
    return res.status(200).json({
      code: 10001,
      msg: "user login",
      data: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        isAdmin: user.isAdmin,
        token: jwtToken,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      code: -10001,
      msg: "server crashed",
    });
  }
});

module.exports = router;
