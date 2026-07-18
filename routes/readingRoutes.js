const express = require("express");
const router = express.Router();

const cards = require("../data");
const { THEMES, byCardId } = require("../data/themes");
const { makeSeed, shuffleDeck } = require("../services/deck");
const store = require("../services/readingStore");
const requireUser = require("../middlewares/requireUser");
const { generateReading } = require("../services/premium");

const SPREADS = {
  single: { key: "single", label: { ko: "한 장 뽑기" }, positions: ["card"] },
  ppf: {
    key: "ppf",
    label: { ko: "과거 · 현재 · 미래" },
    positions: ["past", "present", "future"],
  },
};
const POSITION_LABELS = {
  card: { ko: "카드" },
  past: { ko: "과거" },
  present: { ko: "현재" },
  future: { ko: "미래" },
};

// GET /readings/meta — themes and spreads for building the frontend.
router.get("/meta", (req, res) => {
  res.json({
    themes: Object.values(THEMES),
    spreads: Object.values(SPREADS).map((s) => ({
      ...s,
      positions: s.positions.map((p) => ({ key: p, label: POSITION_LABELS[p] })),
    })),
    deckSize: cards.length,
  });
});

// POST /readings { theme, spread, kick? } — shuffle a new deck session.
// The user then picks cards by position from the face-down deck.
// `kick` is an open-ended object mixed into the shuffle seed (정의 확정 전
// 인터페이스만 고정: 어떤 JSON이 오든 셔플 결과에 실제로 반영된다).
router.post("/", (req, res) => {
  const { theme = "general", spread = "single", kick } = req.body || {};
  if (!THEMES[theme]) {
    return res.status(400).json({ error: `unknown theme: ${theme}` });
  }
  if (!SPREADS[spread]) {
    return res.status(400).json({ error: `unknown spread: ${spread}` });
  }

  const seed = makeSeed(kick);
  const { order, orientations } = shuffleDeck(seed, cards.length);
  const reading = store.create({
    theme,
    spread,
    seed,
    order,
    orientations,
    draws: [],
  });

  res.status(201).json({
    readingId: reading.id,
    theme: THEMES[theme],
    spread: SPREADS[spread],
    deckSize: cards.length,
    drawsRemaining: SPREADS[spread].positions.length,
  });
});

const interpret = (card, orientation, themeKey) => {
  const themed = themeKey !== "general" ? byCardId[card.id]?.[themeKey]?.[orientation] : null;
  return {
    orientation,
    keywords: card.keywords[orientation].ko,
    general: { ko: card.meanings[orientation].ko, en: card.meanings[orientation].en },
    theme: themeKey === "general" ? null : { key: themeKey, ko: themed ? themed.ko : null },
  };
};

const drawToResponse = (reading, draw) => {
  const card = cards[reading.order[draw.deckIndex]];
  return {
    position: { key: draw.position, label: POSITION_LABELS[draw.position] },
    deckIndex: draw.deckIndex,
    card: {
      id: card.id,
      name: card.name,
      arcana: card.arcana,
      suit: card.suit,
      number: card.number,
      image: card.image,
      media: card.media,
    },
    interpretation: interpret(card, reading.orientations[draw.deckIndex], reading.theme),
  };
};

// POST /readings/:id/draw { deckIndex } — reveal the card the user picked
// (deckIndex = position in the face-down shuffled deck, 0..77).
router.post("/:id/draw", (req, res) => {
  const reading = store.get(req.params.id);
  if (!reading) return res.status(404).json({ error: "reading not found or expired" });

  const positions = SPREADS[reading.spread].positions;
  if (reading.draws.length >= positions.length) {
    return res.status(409).json({ error: "all cards for this spread already drawn" });
  }

  const { deckIndex } = req.body || {};
  if (!Number.isInteger(deckIndex) || deckIndex < 0 || deckIndex >= cards.length) {
    return res.status(400).json({ error: `deckIndex must be an integer 0..${cards.length - 1}` });
  }
  if (reading.draws.some((d) => d.deckIndex === deckIndex)) {
    return res.status(400).json({ error: "that card has already been drawn" });
  }

  const draw = { position: positions[reading.draws.length], deckIndex };
  reading.draws.push(draw);

  res.json({
    ...drawToResponse(reading, draw),
    drawsRemaining: positions.length - reading.draws.length,
    complete: reading.draws.length === positions.length,
  });
});

// GET /readings/:id — full reading state (drawn cards only; the rest of
// the deck stays face-down server-side).
router.get("/:id", (req, res) => {
  const reading = store.get(req.params.id);
  if (!reading) return res.status(404).json({ error: "reading not found or expired" });

  const positions = SPREADS[reading.spread].positions;
  res.json({
    readingId: reading.id,
    theme: THEMES[reading.theme],
    spread: SPREADS[reading.spread],
    draws: reading.draws.map((d) => drawToResponse(reading, d)),
    drawsRemaining: positions.length - reading.draws.length,
    complete: reading.draws.length === positions.length,
  });
});

// POST /readings/:id/premium { question } — LLM personalized reading
// grounded in the drawn cards' Waite source text + our dictionaries.
// TODO: gate on req.user.isPremium once billing lands.
router.post("/:id/premium", requireUser, async (req, res, next) => {
  try {
    const reading = store.get(req.params.id);
    if (!reading) return res.status(404).json({ error: "reading not found or expired" });

    const positions = SPREADS[reading.spread].positions;
    if (reading.draws.length < positions.length) {
      return res.status(409).json({ error: "draw all cards before requesting a premium reading" });
    }

    const question = (req.body?.question || "").trim();
    if (!question) return res.status(400).json({ error: "question is required" });
    if (question.length > 500) return res.status(400).json({ error: "question too long (max 500 chars)" });

    const draws = reading.draws.map((d) => ({
      position: { key: d.position, label: POSITION_LABELS[d.position] },
      card: cards[reading.order[d.deckIndex]],
      orientation: reading.orientations[d.deckIndex],
    }));

    const result = await generateReading({
      themeKey: reading.theme,
      spreadLabel: SPREADS[reading.spread].label.ko,
      question,
      draws,
    });
    if (result.error) return res.status(422).json({ error: result.error });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
