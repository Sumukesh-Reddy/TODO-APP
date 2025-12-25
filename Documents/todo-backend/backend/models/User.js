const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true },
  name: String,
  email: { type: String, unique: true },
  picture: String
});

module.exports = mongoose.model("User", UserSchema);
