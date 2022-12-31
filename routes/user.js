const express = require("express");
const router = express.Router();
const { Users } = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv/config");
// get request
router.get("/", async (req, res) => {
  const users = await Users.find().select("-passwordHash");
  if (!users) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(users);
});

// get user by id request
router.get("/:id", (req, res) => {
  Users.findById(req.params.id)
    .select("-passwordHash")
    .then((users) => {
      if (!users) {
        res.status(404).json({ message: "User not found" });
      } else {
        res.status(200).send(users);
      }
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

//post register for Admin to add users request
router.post("/", (req, res) => {
  const user = new Users({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
    Id: req.body.id,
  });
  user
    .save()
    .then((createdUser) => {
      if (!createdUser) {
        res
          .status(500)
          .json({ message: "An error has occurred while creating user" });
      } else {
        res.status(200).json(createdUser);
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error.message, success: false });
    });
});


//post register request
router.post("/register", (req, res) => {
  const user = new Users({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
    Id: req.body.id,
  });
  user
    .save()
    .then((createdUser) => {
      if (!createdUser) {
        res
          .status(500)
          .json({ message: "An error has occurred while creating user" });
      } else {
        res.status(200).json(createdUser);
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error.message, success: false });
    });
});


//login post request
router.post("/login", (req, res) => {
  const secret = process.env.SECRET;
  Users.findOne({ email: req.body.email, password: req.body.password })
    .then((user) => {
      if (!user) {
        res.status(404).send("Wrong email!");
      } else {
        if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
          //if user is authenticated, we send jwt token
          const token = jwt.sign(
            {
              userId: user.id,
              isAdmin: user.isAdmin
            },
            secret,
            { expiresIn: "1d" }
          );
          res.status(200).send({ user: user.email, token: token });
        } else {
          res.status(404).send("wrong password!");
        }
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error.message, success: false });
    });
});


//delete users
router.delete("/:id", (req, res) => {
  Users.findByIdAndRemove(req.params.id)
    .then((users) => {
      if (!users) {
        res.status(404).send("users not found!");
      } else {
        res
          .status(200)
          .send(`The following users has been removed: ${users.name}`);
      }
    })
    .catch((error) => {
      res.status(500).send({ message: error.message });
    });
});

//get userCount
router.get("/get/usersCount", (req, res) => {
  Users.countDocuments()
    .then((usersCount) => {
      if (!usersCount) {
        res.status(404).send("invalid user count!");
      } else {
        res.status(200).send({ usersCount: usersCount });
      }
    })
    .catch((error) => {
      res.status(500).send({ message: error.message });
    });
});
module.exports = router;
