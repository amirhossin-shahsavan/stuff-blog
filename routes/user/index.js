var express = require("express");
var router = express.Router();
const User = require("../../model/User.model");
const path = require("path");
const fs = require("fs");
const { auth } = require("../../middleware/auth");

router.post("/user/register", async function (req, res, next) {
  const { firstname, lastname, email, password, type } = req.body;

  try {
    if (typeof email == "undefined" || email == "") {
      return res.status(400).json({
        code: -10001,
        msg: "Enter Email",
      });
    }
    if (typeof password == "undefined" || password == "") {
      return res.status(400).json({
        code: -10001,
        msg: "Enter Password",
      });
    }

    var Userfind = await User.findOne({
      $or: [{ email: email }],
    });
    if (Userfind) {
      return res.status(400).json({
        code: -10001,
        msg: "Email Exist Please Login",
      });
    }

    var newuser = await new User({
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: password,
      type: type,
    }).save();

    return res.status(200).json({
      code: 10001,
      msg: "user registered",
      data: {
        firstname: newuser.firstname,
        lastname: newuser.lastname,
        email: newuser.email,
        type: newuser.type,
      },
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
    if (typeof email == "undefined" || email == "") {
      return res.status(400).json({
        code: -10001,
        msg: "Enter Email",
      });
    }
    if (typeof password == "undefined" || password == "") {
      return res.status(400).json({
        code: -10001,
        msg: "Enter Password",
      });
    }
    var user = await User.findOne({ email });

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

router.get("/user/getall", async (req, res, next) => {
  try {
    const userfound = await User.find({
      permission: "user",
      type: "developer",
    })
      .select("-_id firstname lastname image")
      .limit(12)
      .exec();
    return res.status(200).json({
      code: 102,
      data: userfound,
    });
  } catch (error) {
    return res.status(400).json({
      code: -10001,
      msg: "server crashed",
    });
  }
});

////////////////////////////IMAGES API

router.get("/user/image/:name", auth, async (req, res, next) => {
  const name = req.params.name;
  res.sendFile(path.join(__dirname, "./../../file/images", name));
});

router.post("/user/upload/", auth, async (req, res) => {
  const userid = req.userAuth;
  try {
    const userfound = await User.findOne({ _id: userid });

    if (!userfound) {
      return res.status(404).json({
        code: -10001,
        msg: "user not found",
      });
    }
    const buffer = Buffer.from(req.files.image.data);

    const filePath = path.join(
      __dirname,
      "./../../file/images",
      userfound._id.toString() + ".png"
    );
    await User.updateMany(
      { _id: userfound._id },
      { image: userfound._id.toString() + ".png" }
    );

    fs.writeFileSync(filePath, buffer);
    return res.status(200).json({
      code: 10001,
      msg: "File uploaded!",
    });
  } catch (error) {
    return res.status(500).json({
      code: -10001,
      msg: error,
    });
  }
});

router.get("/user/upload/", auth, async (req, res) => {
  const userid = req.userAuth;
  try {
    const userfound = await User.findOne({ _id: userid });
    if (!userfound) {
      return res.status(404).json({
        code: -10001,
        msg: "user not found",
      });
    }

    var imagelink = "http://localhost:2000/user/image/" + userfound.image;
    res.json({
      code: 100,
      msg: "get image link success",
      data: imagelink,
    });
  } catch (error) {
    return res.status(500).json({
      code: -10001,
      msg: error,
    });
  }
});

module.exports = router;
