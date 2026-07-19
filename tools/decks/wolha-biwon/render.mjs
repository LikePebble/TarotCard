#!/usr/bin/env node
// 월하비원 덱 공유 이미지 렌더러.
//
// 앱의 런타임 오버레이(src/components/CardArt.tsx)와 같은 규칙으로 카드 한 장을
// PNG로 합성한다. 아트 -> 프레임(overlay 카드) -> 텍스트(번호/카드명) 순서이며,
// 좌표와 서체는 public/decks/wolha-biwon/canvas.tokens.json(기준 1200x2040)을
// renderWidth/1200 비율로 스케일해 사용한다. baked 카드는 아트만 출력한다.
//
// 사용법:
//   node --experimental-strip-types tools/decks/wolha-biwon/render.mjs the-star
//   node --experimental-strip-types tools/decks/wolha-biwon/render.mjs --all
//   node --experimental-strip-types tools/decks/wolha-biwon/render.mjs the-star --width 1200 --out /tmp
//
// Noto Serif KR 폰트 파일이 필요하다. tools/decks/wolha-biwon/fonts/README.md 참조.

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { cards, cardBySlug, romanNumeral } from "../../../src/data/cards.ts";
import { koCards } from "../../../src/data/ko.ts";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const DECK_ID = "wolha-biwon";
const deckDir = join(repoRoot, "public/decks", DECK_ID);

// ---- fonts -------------------------------------------------------------
const FONT_SERIF = "Noto Serif KR";
const FONT_SANS = "Wanted Sans";
const notoPath = join(here, "fonts/NotoSerifKR-SemiBold.ttf");
if (!existsSync(notoPath)) {
  console.error(
    `Noto Serif KR 폰트가 없습니다: ${notoPath}\n` +
      `tools/decks/wolha-biwon/fonts/README.md의 curl 명령으로 내려받으세요.`,
  );
  process.exit(1);
}
const wantedTtf = require.resolve("wanted-sans/fonts/ttf/WantedSans-Regular.ttf");
GlobalFonts.registerFromPath(notoPath, FONT_SERIF);
GlobalFonts.registerFromPath(wantedTtf, FONT_SANS);

// ---- args --------------------------------------------------------------
const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const width = Number(flag("--width", "1200"));
const outDir = resolve(flag("--out", join(repoRoot, "out/share", DECK_ID)));
const all = argv.includes("--all");
const slugArg = argv.find((a) => !a.startsWith("--") && a !== String(width));

// ---- deck config -------------------------------------------------------
const tokens = JSON.parse(
  await readFile(join(deckDir, "canvas.tokens.json"), "utf8"),
);
const deckJson = JSON.parse(await readFile(join(deckDir, "deck.json"), "utf8"));
const canvasMode = (slug) =>
  deckJson.canvasOverrides?.[slug] ?? deckJson.canvasDefault ?? "overlay";

const base = tokens.canvas.width; // 1200
const scale = width / base;
const height = Math.round(tokens.canvas.height * scale);
const S = (v) => v * scale;

let frameImg = null;
async function getFrame() {
  if (!frameImg) frameImg = await loadImage(join(deckDir, "frame.png"));
  return frameImg;
}

function drawCenteredText(ctx, text, token, weight = "normal") {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = token.color;
  const family = token.fontFamily.includes("Wanted") ? FONT_SANS : FONT_SERIF;
  // 장문 축소: 토큰의 medium/long 임계값 적용
  let size = token.fontSize;
  const len = [...text].length;
  if (token.longThreshold && len >= token.longThreshold) size = token.fontSizeLong;
  else if (token.mediumThreshold && len >= token.mediumThreshold)
    size = token.fontSizeMedium;
  ctx.font = `${weight} ${S(size)}px "${family}"`;
  if (token.letterSpacing) ctx.letterSpacing = `${S(token.letterSpacing)}px`;
  const sh = tokens.shadow;
  if (sh) {
    ctx.shadowColor = sh.color;
    ctx.shadowBlur = S(sh.blur);
    ctx.shadowOffsetY = S(sh.offsetY);
    ctx.globalAlpha = 1;
  }
  ctx.fillText(text, S(token.anchorX), S(token.baselineY));
  ctx.restore();
}

async function renderCard(slug) {
  const card = cardBySlug.get(slug);
  if (!card) throw new Error(`알 수 없는 slug: ${slug}`);
  const mode = canvasMode(slug);
  const nameKo = koCards[card.slug]?.nameKo ?? card.nameEn;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const art = await loadImage(join(deckDir, "art", `${slug}.webp`));
  ctx.drawImage(art, 0, 0, width, height);

  if (mode !== "baked") {
    if (mode === "overlay") {
      const frame = await getFrame();
      ctx.drawImage(frame, 0, 0, width, height);
    }
    if (card.arcana === "major" && tokens.number.visibleFor !== "none") {
      drawCenteredText(ctx, romanNumeral(card.number), tokens.number, "bold");
    }
    drawCenteredText(ctx, nameKo, tokens.titleKo, "600");
    drawCenteredText(ctx, card.nameEn.toUpperCase(), tokens.titleEn, "normal");
  }

  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, `${slug}.png`);
  await writeFile(outPath, canvas.toBuffer("image/png"));
  return outPath;
}

// ---- run ---------------------------------------------------------------
const targets = all ? cards.map((c) => c.slug) : slugArg ? [slugArg] : [];
if (targets.length === 0) {
  console.error("slug 또는 --all 을 지정하세요.");
  process.exit(1);
}
for (const slug of targets) {
  const path = await renderCard(slug);
  console.log(`rendered ${slug} -> ${path}`);
}
console.log(`done: ${targets.length}장, ${width}x${height}`);
