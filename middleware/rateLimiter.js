const { token } = require("morgan");
const redisCache = require("../cache/quizCache");

module.exports.allowUser = async (req, res, next) => {
  let attempts = await redisCache.get_user(req.user._id);
  if (attempts && Number(attempts) >= 5) {
    return res.status(401).send({
      message: "You have attempted to many requests",
    });
  } else {
    redisCache.save_user(
      req.user._id,
      Number(attempts) ? Number(attempts) + 1 : 1
    );
    return next();
  }
};

let tokens = ["AAAA", "AAAA", "AAAA", "AAAA", "AAAA"]; // 5 req allowed.
let time = new Date().getTime();
module.exports.tokenBucket = async (req, res, next) => {
  let currentTime = new Date().getTime();
  const refilInterval = 20000;
  const maxTokens = 5;
  if (tokens.length > 0 && currentTime - time < refilInterval) {
    tokens.pop();
    next();
  } else {
    if (currentTime - time >= refilInterval) {
      const tokensToAdd = maxTokens - tokens.length;
      for (let i = 0; i < tokensToAdd; i++) {
        tokens.push("AAAA");
      }
    }
    if (tokens.length > 0) {
      tokens.pop();
      next();
    } else {
      res.status(429).send({
        message: `You have attempted to many requests. Try again after ${
          refilInterval - (currentTime - time)
        } milliseconds`,
      });
    }
  }
};
