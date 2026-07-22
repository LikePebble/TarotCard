# 3장 결과 화면 재설계 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 과거·현재·미래 결과를 "세 장을 늘어놓고 해석을 스크롤"에서 "한 번에 한 포지션"으로 바꾼다. 탭·작은 카드·스와이프 세 경로가 같은 선택 상태를 움직이고, 카드와 해석이 함께 전환된다.

**Architecture:** 선택 인덱스(0=과거) 하나가 화면 전체를 지배한다. `ThreeCardResult` 내부 상태이며 밖으로 새지 않는다. 액션 버튼이 선택된 카드를 따라가야 하므로, 지금처럼 부모가 `actions`를 주입하는 구조는 유지할 수 없다 — 부모는 선택을 모른다.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind v4, `motion/react`, Vitest 2 (`environment: "node"`).

## Global Constraints

- **`npm run build`를 돌리지 않는다** — dev 서버가 떠 있으면 `.next`가 깨진다. `npx tsc --noEmit`과 `npm test`로 확인한다.
- 기존 테스트 73개는 계속 통과해야 한다.
- 한국어 주석, 짧게, 왜 그런지 위주. 2-space, 큰따옴표, Tailwind v4.
- 테스트 환경은 `node`다. `window`·DOM이 없다. 새 테스트는 순수 함수만 대상으로 한다.
- `useReducedMotion`이 켜져 있으면 **모든 전환을 즉시 교체로 낮춘다**. 이 화면은 이미 그 값을 prop으로 받고 있다.
- DRY, YAGNI, 잦은 커밋.

---

### Task 1: 결과 액션을 공용 컴포넌트로

**왜 먼저인가.** Task 2가 탭별 액션을 요구하는데, 지금은 부모가 `actions: ReactNode`를 만들어 넘긴다. 부모는 어느 탭이 선택됐는지 모르므로 이 구조로는 불가능하다.

**공짜로 따라오는 정리.** 네 호출부(`draw`×2, `/reading/[id]`×2)가 이미 **같은 버튼 묶음**을 각자 적고 있다. 3장 결과에 "카드 자세히 보기"가 생기면 네 곳이 완전히 같아진다.

- [x] **1a.** `src/app/reading/ResultActions.tsx`(신규, 클라이언트). props `{ deckId: string; slug: string; localDate: string | null }`.
  - `카드 자세히 보기` → `/collection/${deckId}/${slug}`, `btn btn-gold w-full lg:w-auto`
  - `컬렉션 보기` → `/collection`, `btn btn-ghost w-full lg:w-auto`
  - `localDate`가 있으면 `<JournalLink localDate={localDate} />`. 없으면 그 자리를 비운다(뽑기 직후 기록 전 한 프레임).
- [x] **1b.** `OneCardResult`·`ThreeCardResult`에서 `actions: ReactNode` prop을 없애고 `localDate: string | null`을 받는다. 내부에서 `ResultActions`를 그린다. `OneCardResult`는 `card.slug`를, `ThreeCardResult`는 **선택된 카드의 slug**를 넘긴다.
- [x] **1c.** `src/app/reading/draw/page.tsx`와 `src/app/reading/[id]/page.tsx`의 네 호출부에서 `actions={...}` 블록을 걷어내고 `localDate`를 넘긴다. draw는 `readingRecord?.localDate ?? null`, `/reading/[id]`는 `reading.localDate`.
- [x] **1d.** `npx tsc --noEmit` · `npm test` 통과 확인.

---

### Task 2: 탭 · 작은 카드 · 스와이프

레이아웃(위에서 아래로): 탭 → 큰 카드 → 작은 카드 줄 → 해석 → 수집 배너 → 액션.

- [x] **2a.** `ThreeCardResult`에 `const [index, setIndex] = useState(0)`과 직전 인덱스 ref를 둔다. 전환 방향(`+1`/`-1`)은 애니메이션이 어느 쪽에서 들어올지 정하는 데만 쓴다.
- [x] **2b.** **탭.** `role="tablist"`, 각 탭 `role="tab"` + `aria-selected` + `aria-controls` + `id`. 해석 컨테이너는 `role="tabpanel"` + `aria-labelledby`. ←/→ 키로 이동한다(Home/End는 넣지 않는다 — 항목이 셋뿐이다).
- [x] **2c.** **큰 카드.** 선택된 카드 한 장. `CardArtViewer`로 감싸 눌러서 전체화면이 유지되게 한다. 크기는 모바일 `w-[248px]`, 데스크톱 `lg:w-[340px]`. **`sizes`를 그 크기에 맞춰 넘긴다**(`"(min-width: 1024px) 340px, 248px"`). 첫 카드만 `priority`.
- [x] **2d.** **작은 카드 줄.** 세 장을 **순서 그대로 전부** 둔다. 선택된 것을 빼지 않는다 — 두 장만 남기면 선택할 때마다 줄이 재배치돼 과거→미래 축이 읽히지 않는다. 각 항목은 `CardArt`(뷰어 아님) + 포지션 라벨, 누르면 선택. 선택된 항목은 금색 테두리로 표시. 크기 `w-16 lg:w-[88px]`.
- [x] **2e.** **해석 컨테이너.** 선택된 카드의 포지션 문장·설명 문단·포커스 해석만 보여준다. ~~`AnimatePresence mode="wait"`에 `key={index}`, 진행 방향으로 x 슬라이드 + 페이드.~~

  **어긋남(구현 중 발견).** 이 화면에 `AnimatePresence`를 붙이면 exit가 끝나지 않아, `mode="wait"`에서는 새 해석이 이전 내용에 가려지고 `mode` 없이는 이전 해석들이 DOM에 쌓였다. 구현자는 이를 motion 12.42.2 + React 19.2 조합 탓으로 단정했으나, **격리 재현으로 반증됐다** — sync/wait/popLayout × StrictMode 12가지 모두 `onExitComplete`가 정상 발화하고 노드도 언마운트됐다(재현 앱은 이 저장소 밖 스크래치패드에 있다). 원인은 이 화면 쪽 통합에 있고 아직 특정하지 못했다.

  현재 구현은 `AnimatePresence` 없이 `key={index}` 교체 + 들어오는 쪽 슬라이드만이다. **나가는 슬라이드는 미구현으로 남는다.** 다시 손댈 사람은 라이브러리 버전을 의심하는 데서 시작하지 말 것.
- [x] **2f.** `npx tsc --noEmit` · `npm test` 통과 확인.

---

### Task 3: 스와이프와 전체화면 탭의 충돌 해소

**이 배치에서 가장 깨지기 쉬운 지점이다.** 큰 카드는 이제 두 가지다 — 옆으로 끌면 포지션 전환, 누르면 전체화면 뷰어. 손가락을 옆으로 끌었을 뿐인데 뷰어가 열리면 안 된다.

**framer의 drag가 click을 막아 주리라 기대하지 않는다.** 포인터 이벤트로 직접 판정한다.

- [x] **3a.** 큰 카드를 감싸는 div에 포인터 핸들러를 단다:
  - `onPointerDown` — 시작 x를 ref에 저장, 억제 플래그 해제.
  - `onPointerUp` — 이동량 계산. `|dx| > 10px`이면 **억제 플래그를 세운다**.
  - `onClickCapture` — 억제 플래그가 서 있으면 `stopPropagation()` + `preventDefault()` 후 플래그 해제. 뷰어가 열리지 않는다.
- [x] **3b.** 전환 판정은 `|dx| >= 50px`일 때. 왼쪽으로 끌면 다음, 오른쪽으로 끌면 이전.
- [x] **3c.** **양 끝에서 순환하지 않는다.** 과거에서 오른쪽, 미래에서 왼쪽은 아무 일도 일어나지 않는다. 시간 축이라 미래에서 과거로 감기면 방향 감각이 깨진다.
- [x] **3d.** 세로 스크롤을 막지 않는다. 가로 이동이 세로보다 클 때만 스와이프로 본다(`|dx| > |dy|`).
- [x] **3e.** `npx tsc --noEmit` · `npm test` 통과 확인.

---

## 수동 검증

`/reading` 하단의 `[개발] 오늘 리딩 N건 리셋`으로 3장 리딩을 만든 뒤 확인한다.

- [x] 탭 세 개가 보이고, 누르면 큰 카드와 해석이 함께 바뀐다.
- [x] 작은 카드 줄에 세 장이 **항상** 순서대로 있고, 선택된 것이 표시된다.
- [x] 작은 카드를 눌러도 같은 전환이 일어난다.
- [x] 큰 카드를 옆으로 스와이프하면 포지션이 넘어간다.
- [x] **스와이프한 뒤 전체화면 뷰어가 열리지 않는다.** (가장 중요)
- [x] 큰 카드를 그냥 탭하면 전체화면 뷰어는 정상적으로 열린다.
- [x] 과거에서 오른쪽, 미래에서 왼쪽 스와이프는 아무 일도 하지 않는다.
- [x] 카드 위에서 세로로 스크롤하는 데 방해가 없다.
- [x] `카드 자세히 보기`가 **선택된 카드**의 상세로 간다(탭을 바꾸면 목적지도 바뀐다).
- [x] 1장 결과 화면의 액션 세 개가 이전과 같다(Task 1 리팩터가 깨뜨리지 않았다).
- [x] ←/→ 키로 탭이 이동한다.
- [ ] OS 접근성 설정에서 모션 줄이기를 켜면 전환이 즉시 교체된다.
