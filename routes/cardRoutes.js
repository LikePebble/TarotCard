const express = require("express");
const router = express.Router();

const cards = require("../data");

// Legacy clients (demo.html) read `name`, `description`, `image` as flat strings.
// New clients should use `name.en/ko`, `meanings`, `keywords`, `narrative`, `media`.
const toResponse = (card) => ({
  ...card,
  name: card.name.en,
  nameKo: card.name.ko,
  description: card.narrative.en,
});

router.get("/", (req, res) => {
  res.json(cards.map(toResponse));
});

router.get("/onecard", (req, res) => {
  const randomIndex = Math.floor(Math.random() * cards.length);
  res.json(toResponse(cards[randomIndex]));
});

module.exports = router;
