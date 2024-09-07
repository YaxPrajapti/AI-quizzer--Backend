const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.isAuthenticated = (req, res, next) => {
  try {
    const bearertoken = req.headers.authorization;
    if (!bearertoken) {
      return res.status(403).send({ message: "You are not authenticated" });
    }
    const jwtToken = bearertoken.split(" ")[1];
    const decode = jwt.verify(jwtToken, process.env.JWTSECRET);
    if (!decode) {
      throw new Error("Invalid token");
    }
    req.user = decode;
    next();
  } catch (error) {
    return res.status(401).send({ message: "You are not authenticated" });
  }
};
