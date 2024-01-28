const User = require("../model/User.model");
const Config = require("../config/config.json");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

const auth = async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json("login again");
  }

  const user = await verifyToken(token);
  if (user == false) {
    return res.status(402).json("Unauthorize");
  }

  req.userAuth = user;

  next();
};

const verifyToken = (token) => {
  try {
    var decoded = jwt.verify(token, Config.API.jwtpass);
    return decoded.id;
  } catch (error) {
    return false;
  }
};

module.exports = { auth, verifyToken };
