var express = require("express");
var router = express.Router();
const User = require("../../model/User.model");
const path = require("path");
const fs = require("fs");
const auth = require("../../middleware/auth");

router.post("/user/register", async function (req, res, next) {
  const { firstname, lastname, email, password, type } = req.body;

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
        type: type,
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
    س;
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

router.get("/user/getall", async (req, res, next) => {
  try {
    const userfound = User.find({
      permission: "user",
      type: "developer",
    })
      .select("_id firstname lastname image")
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

router.get("/user/image/:name", auth, async function (req, res, next) {
  const userid = req.userAuth;
  const userfound = await User.findOne({ _id: userid });
  res.sendFile(
    path.join(__dirname, "./../../file/images", userfound._id.toString())
  );
});

router.post("/user/upload/", auth, async function (req, res) {
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

    var image_link = req.files.image.name;
    await User.findOneAndUpdate(
      { _id: userfound._id },
      { $push: { image: image_link } }
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

router.get("/user/upload/", auth, async function (req, res) {
  const shenase_book = req.params.id;
  try {
    const bookfound = await Book.findOne({ shenase_book: shenase_book });
    if (!bookfound) {
      return res.status(404).json({
        code: -10001,
        msg: "book not found",
      });
    }

    var lstsend = [];
    bookfound.image.forEach((file) => {
      lstsend.push("http://localhost:2000/user/image/:name" + file);
    });
    res.json({
      code: 100,
      msg: "get image link success",
      data: {
        file: lstsend,
      },
    });
  } catch (error) {
    return res.status(500).json({
      code: -10001,
      msg: error,
    });
  }
});

module.exports = router;
