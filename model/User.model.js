const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Config = require("../config/config.json");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    default: "",
  },
  lastname: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "",
    enum: ["developer", "customer", "employer"],
  },
  permission: {
    type: String,
    default: "user",
    enum: ["user", "admin", "support"],
  },
});

userSchema.pre("save", async function (next) {
  var user = this;
  if (!user.password || user.password == "") {
    return next("Password Require");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedpass = await bcrypt.hash(user.password, salt);
  user.password = hashedpass;
  next();
});

userSchema.methods.CreateToken = async function () {
  var user = this;
  return jwt.sign({ id: user._id.toString() }, Config.API.jwtpass, {
    expiresIn: Config.API.jwtexpire,
  });
};

userSchema.methods.ComparePasssword = async function (password, hash) {
  const isPasswordMatch = await bcrypt.compare(password, hash);
  if (isPasswordMatch) {
    return true;
  } else {
    return false;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
