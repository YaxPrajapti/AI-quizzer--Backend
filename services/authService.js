const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWTSECRET = process.env.JWTSECRET;

module.exports.setUser = (user) => {
  return jwt.sign(user, JWTSECRET, { expiresIn: "2h" });
};
