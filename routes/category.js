const express = require("express");
const router = express.Router();
const { Category } = require("../models/category");

// get request
router.get("/", async (req, res) => {
  const category = await Category.find();
  if (!category) {
    res.status(500).json({
      success: false,
    });
  }
  res.status(200).send(category);
});
// get request by id
router.get("/:id", (req, res) => {
  Category.findById(req.params.id)
    .then((category) => {
      if (!category) {
        res.status(500).json({
          success: false,
          message: "No category found by this id",
        });
      } else {
        res.status(200).send(category);
      }
    })
    .catch((err) => {
      res.status(500).json({ success: false, message: err.message });
    });
});

//post request
router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  category = await category.save();
  if (!category) return res.status(404).send("category cannot be created");
  res.send(category);
});

// delete request its better not to use async function here
router.delete("/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        res.status(200).json({
          success: true,
          message: "delete category successfully!",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "category not found!",
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

//update category by id
router.put(
  "/:id",
  (req, res) => {
    Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
      },

      { new: true }
    )
    .then((category) => {
      if (!category) {
        res.status(500).json({
          success: false,
          message: "No category found by this id",
        });
      } else {
        res.status(200).send(category);
      }
    })
    .catch((err) => {
      res.status(500).json({ success: false, message: err.message });
    })});

module.exports = router;
