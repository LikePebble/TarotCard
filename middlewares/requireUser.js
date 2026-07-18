// Anonymous device identity: clients present the X-User-Id issued by
// POST /users. Swap this for real session auth when accounts launch.
const db = require("../services/db");

const requireUser = (req, res, next) => {
  const userId = req.get("X-User-Id");
  if (!userId) return res.status(401).json({ error: "X-User-Id header required" });
  const user = db.prepare("SELECT id, is_premium FROM users WHERE id = ?").get(userId);
  if (!user) return res.status(401).json({ error: "unknown user" });
  req.user = { id: user.id, isPremium: Boolean(user.is_premium) };
  next();
};

module.exports = requireUser;
