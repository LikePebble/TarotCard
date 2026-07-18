// Theme metadata + per-card theme interpretation lookup.
// Theme dictionaries live in data/themes/{group}.json keyed by card id.
const THEMES = {
  general: { key: "general", label: { ko: "종합", en: "General" } },
  love: { key: "love", label: { ko: "연애", en: "Love" } },
  money: { key: "money", label: { ko: "금전", en: "Money" } },
  career: { key: "career", label: { ko: "직장·사업", en: "Career" } },
  study: { key: "study", label: { ko: "학업·자기계발", en: "Study" } },
  health: { key: "health", label: { ko: "건강", en: "Health" } },
  relationship: { key: "relationship", label: { ko: "대인관계", en: "Relationships" } },
};

const byCardId = Object.assign(
  {},
  require("./major.json"),
  require("./wands.json"),
  require("./cups.json"),
  require("./swords.json"),
  require("./pentacles.json")
);

module.exports = { THEMES, byCardId };
