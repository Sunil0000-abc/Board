const express = require("express");
const router = express.Router();
const Post = require("./schemas/userschema");



router.get("/userdata", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch posts",
      error: error.message,
    });
  }
});



router.post("/create-userdata", async (req, res) => {
  try {
    const { name, text, tag, color } = req.body;

    const newPost = await Post.create({
      name,
      text,
      tag,
      color,
    });

    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create post",
      error: error.message,
    });
  }
});

module.exports = router;