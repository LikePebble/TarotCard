/* ============================================================
   Reading flow logic.
   DOM 계약: 아래 id / data-* 훅만 참조한다. 클래스명·마크업 구조는
   디자인 교체 시 자유롭게 변경 가능 (docs/ui-spec.md 참고).
   ============================================================ */

// All server interaction goes through `api` so a standalone build can
// swap in a mock implementation.
const api = window.__mockApi || {
  meta: () => fetch("/readings/meta").then((r) => r.json()),
  create: (body) =>
    fetch("/readings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  draw: (id, deckIndex) =>
    fetch(`/readings/${id}/draw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deckIndex }),
    }).then((r) => r.json()),
  img: (path) => path,

  // ---- Phase 4/5: identity, journal, premium ----
  ensureUser: async () => {
    let id = localStorage.getItem("tarot_user_id");
    if (!id) {
      const r = await fetch("/users", { method: "POST" }).then((r) => r.json());
      id = r.userId;
      localStorage.setItem("tarot_user_id", id);
    }
    return id;
  },
  saveJournal: async (date, body) => {
    const userId = await api.ensureUser();
    return fetch(`/journal/${date}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-User-Id": userId },
      body: JSON.stringify(body),
    }).then((r) => r.json());
  },
  premium: async (readingId, question) => {
    const userId = await api.ensureUser();
    return fetch(`/readings/${readingId}/premium`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Id": userId },
      body: JSON.stringify({ question }),
    }).then((r) => r.json());
  },
};

const $ = (id) => document.getElementById(id);
const state = { theme: null, spread: null, kickTaps: [], readingId: null, positions: [], draws: [] };

const setStep = (id, mode) => {
  const el = $(id);
  el.classList.remove("active", "done");
  if (mode) el.classList.add(mode);
};

async function init() {
  const meta = await api.meta();
  for (const t of meta.themes) {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = t.label.ko;
    b.addEventListener("click", () => {
      state.theme = t.key;
      [...$("themeChips").children].forEach((c) => c.classList.toggle("selected", c === b));
      setStep("stepTheme", "done");
      setStep("stepSpread", "active");
      $("stepSpread").scrollIntoView({ behavior: "smooth", block: "center" });
    });
    $("themeChips").appendChild(b);
  }
  for (const s of meta.spreads) {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = s.label.ko;
    b.addEventListener("click", () => {
      state.spread = s.key;
      state.positions = s.positions;
      [...$("spreadChips").children].forEach((c) => c.classList.toggle("selected", c === b));
      setStep("stepSpread", "done");
      setStep("stepShuffle", "active");
      $("stepShuffle").scrollIntoView({ behavior: "smooth", block: "center" });
    });
    $("spreadChips").appendChild(b);
  }
}

// STEP 3 — kick: tap count + rhythm feed the shuffle seed.
$("shuffleDeck").addEventListener("click", () => {
  state.kickTaps.push(Date.now());
  $("kickCount").textContent = state.kickTaps.length;
  const deck = $("shuffleDeck");
  deck.classList.add("shaking");
  setTimeout(() => deck.classList.remove("shaking"), 240);
});

$("shuffleDone").addEventListener("click", async () => {
  $("shuffleDone").disabled = true;
  const taps = state.kickTaps;
  const kick = {
    tapCount: taps.length,
    rhythm: taps.slice(1).map((t, i) => t - taps[i]),
    finishedAt: Date.now(),
  };
  const reading = await api.create({ theme: state.theme, spread: state.spread, kick });
  state.readingId = reading.readingId;
  buildSlots();
  buildFan();
  setStep("stepShuffle", "done");
  setStep("stepPick", "active");
  $("pickHint").textContent = `마음이 가는 카드 ${state.positions.length}장을 골라 주세요`;
  $("stepPick").scrollIntoView({ behavior: "smooth", block: "start" });
});

function buildSlots() {
  $("slots").innerHTML = "";
  for (const p of state.positions) {
    const d = document.createElement("div");
    d.className = "slot";
    d.dataset.key = p.key;
    d.innerHTML = `<div class="frame">${p.label.ko}</div><div class="slot-name">${p.label.ko}</div><div class="slot-card"></div>`;
    $("slots").appendChild(d);
  }
  markNextSlot();
}

function markNextSlot() {
  const slots = [...$("slots").children];
  slots.forEach((s) => s.classList.remove("next"));
  const next = slots.find((s) => !s.classList.contains("filled"));
  if (next) next.classList.add("next");
}

function buildFan() {
  $("fan").innerHTML = "";
  for (let i = 0; i < 78; i++) {
    const c = document.createElement("div");
    c.className = "f-card";
    c.dataset.index = i;
    c.addEventListener("click", () => pick(c, i));
    $("fan").appendChild(c);
  }
}

let picking = false;
async function pick(el, deckIndex) {
  if (picking || el.classList.contains("taken")) return;
  picking = true;
  const result = await api.draw(state.readingId, deckIndex);
  picking = false;
  if (result.error) return;

  el.classList.add("taken");
  state.draws.push(result);

  const slot = $("slots").querySelector(`[data-key="${result.position.key}"]`);
  const rev = result.interpretation.orientation === "reversed";
  slot.classList.add("filled");
  slot.querySelector(".frame").innerHTML =
    `<img src="${api.img(result.card.image)}" alt="${result.card.name.ko}" class="${rev ? "reversed" : ""}" />`;
  slot.querySelector(".slot-card").textContent = result.card.name.ko;
  markNextSlot();
  renderResult(result);

  if (result.complete) {
    setStep("stepPick", "done");
    setStep("stepResult", "active");
    $("afterPanels").hidden = false;
    $("stepResult").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderResult(r) {
  const rev = r.interpretation.orientation === "reversed";
  const themed = r.interpretation.theme;
  const div = document.createElement("div");
  div.className = "result-card";
  div.innerHTML = `
    <div class="art"><img src="${api.img(r.card.image)}" alt="${r.card.name.ko}" class="${rev ? "reversed" : ""}" /></div>
    <div>
      <div class="r-pos">${r.position.label.ko}</div>
      <div class="r-name">${r.card.name.ko}<small>${r.card.name.en}</small></div>
      <span class="badge ${rev ? "reversed" : "upright"}">${rev ? "역방향" : "정방향"}</span>
      <div class="kw">${r.interpretation.keywords.map((k) => `<span>${k}</span>`).join("")}</div>
      ${themed && themed.ko ? `<p class="r-theme"><b>${themeLabelKo()}</b> · ${themed.ko}</p>` : ""}
      <details class="r-general"><summary>종합 해석 보기</summary><p>${r.interpretation.general.ko}</p></details>
    </div>`;
  $("results").appendChild(div);
  setStep("stepResult", "active");
}

function themeLabelKo() {
  const chip = $("themeChips").querySelector(".selected");
  return chip ? chip.textContent : "";
}

// ---- Phase 4: 오늘의 기록 저장 ----
$("saveJournal").addEventListener("click", async () => {
  const btn = $("saveJournal");
  btn.disabled = true;
  $("saveStatus").textContent = "저장 중…";
  const today = new Date().toISOString().slice(0, 10);
  const r = await api.saveJournal(today, {
    readingId: state.readingId,
    memo: $("memoInput").value.trim(),
  });
  if (r.error) {
    $("saveStatus").textContent = `저장 실패: ${r.error}`;
    btn.disabled = false;
  } else {
    $("saveStatus").textContent = `${today} 기록에 저장되었습니다`;
  }
});

// ---- Phase 5: 프리미엄 해석 ----
$("premiumAsk").addEventListener("click", async () => {
  const q = $("premiumQuestion").value.trim();
  if (!q) {
    $("premiumStatus").textContent = "질문을 입력해 주세요";
    return;
  }
  const btn = $("premiumAsk");
  btn.disabled = true;
  $("premiumStatus").textContent = "리딩을 준비하고 있습니다…";
  const r = await api.premium(state.readingId, q);
  btn.disabled = false;
  if (r.error) {
    $("premiumStatus").textContent = `실패: ${r.error}`;
    return;
  }
  $("premiumStatus").textContent = r.mock ? "(미리보기 모드)" : "";
  $("premiumResult").textContent = r.reading;
  $("premiumResult").hidden = false;
});

$("restart").addEventListener("click", () => location.reload());

init();
