const jwt = require("jsonwebtoken");
const User = require("../models/User");
const googleClient = require("../config/google");

exports.googleLogin = async (req, res) => {
  const { token } = req.body;

  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  const { sub, email, name, picture } = payload;

  let user = await User.findOne({ googleId: sub });

  if (!user) {
    user = await User.create({
      googleId: sub,
      email,
      name,
      picture
    });
  }

  const jwtToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token: jwtToken, user });
};
