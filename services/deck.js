const crypto = require("crypto");

// Deterministic PRNG (mulberry32) so a reading's shuffle is reproducible
// from its seed. The seed mixes server entropy with client "kick"
// parameters, so the kick genuinely influences the shuffle result.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Kick parameters are open-ended by design (to be defined later):
// any JSON object the client sends is canonicalized into the seed.
function makeSeed(kick) {
  const entropy = crypto.randomBytes(16).toString("hex");
  const kickStr = JSON.stringify(kick ?? null);
  return crypto.createHash("sha256").update(`${entropy}:${kickStr}`).digest("hex");
}

function rngFromSeed(seedHex) {
  return mulberry32(parseInt(seedHex.slice(0, 8), 16));
}

// Fisher-Yates shuffle of card indices [0..n) plus a per-slot orientation.
function shuffleDeck(seedHex, size) {
  const rng = rngFromSeed(seedHex);
  const order = Array.from({ length: size }, (_, i) => i);
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const orientations = order.map(() => (rng() < 0.5 ? "upright" : "reversed"));
  return { order, orientations };
}

module.exports = { makeSeed, shuffleDeck };
