const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const db = require("../services/db");
const requireUser = require("../middlewares/requireUser");

// POST /users — issue an anonymous identity the client stores locally.
router.post("/", (req, res) => {
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO users (id) VALUES (?)").run(id);
  res.status(201).json({ userId: id });
});

// GET /users/me — identity check + premium flag.
router.get("/me", requireUser, (req, res) => {
  res.json({ userId: req.user.id, isPremium: req.user.isPremium });
});

module.exports = router;
