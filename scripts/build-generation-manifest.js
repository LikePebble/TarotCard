#!/usr/bin/env node
// 카드별 프롬프트(data/art/*.json) + 스타일 설정(style.config.json) +
// 기술 스펙(비율·해상도·네거티브)을 합쳐, 이미지 생성기에 바로 넣을 수 있는
// 매니페스트(data/art/generation-manifest.json)를 만든다.
//
// 사용법:
//   1. data/art/style.config.json 의 "style" 을 확정 문자열로 교체
//   2. node scripts/build-generation-manifest.js
//   3. generation-manifest.json 의 각 항목을 생성기(API/디자이너)에 전달
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ART_DIR = path.join(ROOT, "data", "art");
const GROUPS = ["major", "wands", "cups", "swords", "pentacles"];

const config = JSON.parse(fs.readFileSync(path.join(ART_DIR, "style.config.json"), "utf8"));

if (config.style.startsWith("REPLACE_ME")) {
  console.warn(
    "경고: style.config.json 의 style 이 아직 플레이스홀더입니다. " +
      "매니페스트는 생성되지만 {STYLE} 자리에 플레이스홀더가 들어갑니다.\n"
  );
}

const manifest = [];
for (const g of GROUPS) {
  const art = JSON.parse(fs.readFileSync(path.join(ART_DIR, `${g}.json`), "utf8"));
  for (const [id, card] of Object.entries(art)) {
    const prompt = [
      card.promptEn.replace("{STYLE}", config.style),
      config.promptSuffix,
    ]
      .filter(Boolean)
      .join(", ");
    manifest.push({
      id,
      group: g,
      title: card.title,
      outputFile: `images/${id}.${config.params.outputFormat}`,
      prompt,
      negativePrompt: config.negativePrompt,
      aspectRatio: config.params.aspectRatio,
      width: config.params.width,
      height: config.params.height,
      // 생성 후 검수용 — 이 상징들이 이미지에 있는지 확인 (스펙 §6 체크리스트)
      reviewChecklist: {
        requiredSymbols: card.symbols,
        safeZone: "핵심 심볼·캐릭터가 중앙 60% 안",
        noText: "문자·숫자 없음",
        reversible: "180° 회전 시 파탄 없음",
      },
    });
  }
}

const out = path.join(ART_DIR, "generation-manifest.json");
fs.writeFileSync(out, JSON.stringify(manifest, null, 2));
console.log(`${manifest.length}장 → ${path.relative(ROOT, out)}`);
console.log(`예시 프롬프트 (${manifest[0].id}):\n${manifest[0].prompt.slice(0, 200)}…`);
