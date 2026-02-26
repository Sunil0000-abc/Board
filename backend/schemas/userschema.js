const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    text: {
      type: String,
      required: [true, "Text is required"],
      trim: true,
      maxlength: [1000, "Text cannot exceed 1000 characters"],
    },
    tag: {
      type: String,
      enum: ["Lifestyle", "Tech", "Food", "Books", "Travel", "Other"],
      default: "Other",
    },
    color: {
      type: String,
      default: "#888888",
    },
  },
  {
    timestamps: true, // ✅ creates createdAt and updatedAt
  }
);

module.exports = mongoose.model("Post", postSchema);