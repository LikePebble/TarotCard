/* 캘린더 로직 — id / data-* 훅만 참조 (docs/ui-spec.md의 훅 계약 참고) */
const $ = (id) => document.getElementById(id);

async function ensureUser() {
  let id = localStorage.getItem("tarot_user_id");
  if (!id) {
    const r = await fetch("/users", { method: "POST" }).then((r) => r.json());
    id = r.userId;
    localStorage.setItem("tarot_user_id", id);
  }
  return id;
}

const authed = async (path, opts = {}) => {
  const userId = await ensureUser();
  return fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", "X-User-Id": userId, ...(opts.headers || {}) },
  }).then((r) => r.json());
};

const THEME_KO = {
  general: "종합", love: "연애", money: "금전", career: "직장·사업",
  study: "학업·자기계발", health: "건강", relationship: "대인관계",
};
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

let current = new Date();
current.setDate(1);
let entriesByDate = {};
let selectedDate = null;

const monthStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

async function loadMonth() {
  const month = monthStr(current);
  $("monthTitle").textContent = `${current.getFullYear()}년 ${current.getMonth() + 1}월`;
  const r = await authed(`/journal?month=${month}`);
  entriesByDate = {};
  for (const e of r.entries || []) entriesByDate[e.date] = e;
  renderGrid();
}

function renderGrid() {
  const grid = $("calGrid");
  grid.innerHTML = DOW.map((d) => `<div class="cal-dow">${d}</div>`).join("");
  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < firstDow; i++) {
    grid.insertAdjacentHTML("beforeend", `<div class="cal-day empty"></div>`);
  }
  for (let day = 1; day <= days; day++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const cls = [
      "cal-day",
      entriesByDate[date] ? "has-entry" : "",
      date === todayStr ? "today" : "",
      date === selectedDate ? "selected" : "",
    ].filter(Boolean).join(" ");
    grid.insertAdjacentHTML("beforeend", `<button class="${cls}" data-date="${date}">${day}</button>`);
  }
  grid.querySelectorAll(".cal-day[data-date]").forEach((el) => {
    el.addEventListener("click", () => selectDate(el.dataset.date));
  });
}

async function selectDate(date) {
  selectedDate = date;
  renderGrid();
  const entry = entriesByDate[date];
  $("entryPanel").hidden = false;
  $("entryDate").textContent = date;
  $("entryStatus").textContent = "";
  if (entry) {
    $("entryMeta").textContent = entry.theme
      ? `테마: ${THEME_KO[entry.theme] || entry.theme} · 스프레드: ${entry.spread === "ppf" ? "과거·현재·미래" : "한 장 뽑기"}`
      : "";
    $("entryCards").innerHTML = (entry.draws || []).map((d) => `
      <div class="mini">
        <img src="${d.image}" alt="${d.name.ko}" class="${d.orientation === "reversed" ? "reversed" : ""}" />
        <div>${d.name.ko}</div>
      </div>`).join("");
    $("entryMemo").value = entry.memo || "";
  } else {
    $("entryMeta").textContent = "이 날의 기록이 없습니다. 메모만 남길 수도 있어요.";
    $("entryCards").innerHTML = "";
    $("entryMemo").value = "";
  }
}

$("entrySave").addEventListener("click", async () => {
  if (!selectedDate) return;
  $("entryStatus").textContent = "저장 중…";
  const r = await authed(`/journal/${selectedDate}`, {
    method: "PUT",
    body: JSON.stringify({ memo: $("entryMemo").value.trim() }),
  });
  $("entryStatus").textContent = r.error ? `실패: ${r.error}` : "저장되었습니다";
  await loadMonth();
});

$("entryDelete").addEventListener("click", async () => {
  if (!selectedDate || !entriesByDate[selectedDate]) return;
  await authed(`/journal/${selectedDate}`, { method: "DELETE" });
  $("entryPanel").hidden = true;
  selectedDate = null;
  await loadMonth();
});

$("prevMonth").addEventListener("click", () => { current.setMonth(current.getMonth() - 1); loadMonth(); });
$("nextMonth").addEventListener("click", () => { current.setMonth(current.getMonth() + 1); loadMonth(); });

loadMonth();
