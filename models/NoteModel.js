const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    user: { type: String, ref: "User", required: true }, // <-- string instead of ObjectId
    title: {
      type: String,
      required: true,
      unique: true,
    },
    tags: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Note", noteSchema);
