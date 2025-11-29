const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    username: {
      type: String,
    },
    avatar: {
      type: String,
    },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
