const major = require("./cards/major.json");
const wands = require("./cards/wands.json");
const cups = require("./cards/cups.json");
const swords = require("./cards/swords.json");
const pentacles = require("./cards/pentacles.json");

const cards = [...major, ...wands, ...cups, ...swords, ...pentacles];

module.exports = cards;
