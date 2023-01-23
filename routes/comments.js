const express = require("express");
const { Comments } = require("../models/comments");
const router = express.Router();

// get request
router.get("/", async (req, res) => {
  const comments = await Comments.find();
  if (!comments) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(comments);
});
//post request
router.post("/", async (req, res) => {
  if (!req.body.message)
    res.status(400).json({ message: "message body cannot be empty be empty" });
  else {
    let comment = new Comments({
      message: req.body.message,
    });
    comment = await comment.save();
    if (!comment) return res.status(500).send("comment cannot be created");
    res.send(comment);
  }
});

module.exports = router;
