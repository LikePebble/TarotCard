const express = require("express");
const router = express.Router();

const db = require("../services/db");
const requireUser = require("../middlewares/requireUser");
const store = require("../services/readingStore");
const cards = require("../data");

router.use(requireUser);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

// Snapshot a completed (or partial) reading so the journal survives the
// session store's TTL and future schema changes.
const snapshotReading = (reading) => ({
  theme: reading.theme,
  spread: reading.spread,
  draws: reading.draws.map((d) => {
    const card = cards[reading.order[d.deckIndex]];
    return {
      position: d.position,
      cardId: card.id,
      name: card.name,
      image: card.image,
      orientation: reading.orientations[d.deckIndex],
    };
  }),
});

// PUT /journal/:date { readingId?, memo? } — upsert the day's entry.
router.put("/:date", (req, res) => {
  const { date } = req.params;
  if (!DATE_RE.test(date)) return res.status(400).json({ error: "date must be YYYY-MM-DD" });

  const { readingId, memo = "" } = req.body || {};
  let theme = null;
  let spread = null;
  let drawsJson = null;
  if (readingId) {
    const reading = store.get(readingId);
    if (!reading) return res.status(404).json({ error: "reading not found or expired" });
    const snap = snapshotReading(reading);
    theme = snap.theme;
    spread = snap.spread;
    drawsJson = JSON.stringify(snap.draws);
  }

  db.prepare(
    `INSERT INTO journal_entries (user_id, date, theme, spread, draws_json, memo, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(user_id, date) DO UPDATE SET
       theme = COALESCE(excluded.theme, journal_entries.theme),
       spread = COALESCE(excluded.spread, journal_entries.spread),
       draws_json = COALESCE(excluded.draws_json, journal_entries.draws_json),
       memo = excluded.memo,
       updated_at = datetime('now')`
  ).run(req.user.id, date, theme, spread, drawsJson, String(memo));

  res.json({ date, saved: true });
});

const toEntry = (row) => ({
  date: row.date,
  theme: row.theme,
  spread: row.spread,
  draws: row.draws_json ? JSON.parse(row.draws_json) : [],
  memo: row.memo,
  updatedAt: row.updated_at,
});

// GET /journal?month=YYYY-MM — the month's entries for the calendar grid.
router.get("/", (req, res) => {
  const { month } = req.query;
  if (!MONTH_RE.test(month || "")) return res.status(400).json({ error: "month must be YYYY-MM" });
  const rows = db
    .prepare(
      "SELECT * FROM journal_entries WHERE user_id = ? AND date LIKE ? ORDER BY date"
    )
    .all(req.user.id, `${month}-%`);
  res.json({ month, entries: rows.map(toEntry) });
});

// GET /journal/:date — one day's full entry.
router.get("/:date", (req, res) => {
  const { date } = req.params;
  if (!DATE_RE.test(date)) return res.status(400).json({ error: "date must be YYYY-MM-DD" });
  const row = db
    .prepare("SELECT * FROM journal_entries WHERE user_id = ? AND date = ?")
    .get(req.user.id, date);
  if (!row) return res.status(404).json({ error: "no entry for that date" });
  res.json(toEntry(row));
});

// DELETE /journal/:date
router.delete("/:date", (req, res) => {
  const { date } = req.params;
  if (!DATE_RE.test(date)) return res.status(400).json({ error: "date must be YYYY-MM-DD" });
  db.prepare("DELETE FROM journal_entries WHERE user_id = ? AND date = ?").run(req.user.id, date);
  res.json({ date, deleted: true });
});

module.exports = router;
