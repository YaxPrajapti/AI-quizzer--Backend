const User = require("../models/user");
const authService = require("../services/authService");

module.exports.login = async (req, res, next) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ message: "Username, password and email are required." });
  }
  try {
    let user = await User.findOne({ username: username });
    if (!user) {
      user = new User({
        username: username,
        password: password,
        email: email,
      });
    }
    await user.save();
    const token = authService.setUser({
      _id: user._id,
      username,
      password,
      email,
    });
    return res.status(200).send({ message: "Login successfull", token: token });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error while creating user", error: error.message });
  }
};
