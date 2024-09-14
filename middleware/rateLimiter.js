const redisCache = require("../cache/quizCache");

module.exports.allowUser = async (req, res, next) => {
  let attempts = await redisCache.get_user(req.user._id);
  if (attempts && Number(attempts) >= 5) {
    return res.status(401).send({
      message: "You can not make request right now. Try after some times",
    });
  } else {
    redisCache.save_user(
      req.user._id,
      Number(attempts) ? Number(attempts) + 1 : 1
    );
    return next();
  }
};
