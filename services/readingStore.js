const crypto = require("crypto");

// In-memory reading sessions. Swapped for a database when accounts and
// the calendar/journal land; the interface is what the routes depend on.
const TTL_MS = 30 * 60 * 1000;
const sessions = new Map();

function create(session) {
  const id = crypto.randomUUID();
  const record = { id, createdAt: Date.now(), ...session };
  sessions.set(id, record);
  return record;
}

function get(id) {
  const record = sessions.get(id);
  if (!record) return null;
  if (Date.now() - record.createdAt > TTL_MS) {
    sessions.delete(id);
    return null;
  }
  return record;
}

setInterval(() => {
  const now = Date.now();
  for (const [id, record] of sessions) {
    if (now - record.createdAt > TTL_MS) sessions.delete(id);
  }
}, 60 * 1000).unref();

module.exports = { create, get };
