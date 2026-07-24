# 게스트 수집 UX·덱 정보 모달·역방향 변형 재저작 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 게스트 미수집 칩 + `/login`, 도감 수집됨 필터, 덱 정보 모달을 붙이고, 역방향 변형 624건을 Codex 저작 + Opus 5 검수로 재작성한다.

**Architecture:** 이중 트랙 — Task 1에서 Codex 백그라운드 잡 6개(테마 5 + 포지션 1)를 먼저 발사해 `.scratch/reversed-rewrite/*.json`에 산출하고, 도는 동안 UI 3건(Task 2~5)을 진행한다. Task 6에서 산출을 TS 파일로 재조립·검증하고 Task 7에서 Opus 5이 검수한다.

**Tech Stack:** Next.js(App Router), TypeScript, vitest, Codex(codex:codex-rescue 백그라운드 잡), Supabase auth(기존 `useSession`).

**스펙:** `docs/superpowers/specs/2026-07-25-guest-ux-deck-modal-reversed-rewrite-design.md`

## Global Constraints

- 테스트·타입체크: `./node_modules/.bin/vitest run` / `./node_modules/.bin/tsc --noEmit`. dev 서버가 떠 있는 동안 `npm run build` 금지.
- Codex 샌드박스: `.git` read-only(커밋 불가), `npx` 불가 → 검증·커밋은 컨트롤러가 한다. Codex 잡 지시문에 커밋·테스트 단계를 넣지 않는다.
- 톤: 겁주지 않는 성찰적 존댓말. 예언 단정("~할 것입니다") 금지.
- 재저작 검수는 **Opus 5 서브에이전트 고정**(사용자 지정). 저작은 **Codex**(사용자 지정).
- 수집 판정: 카드별 만남 기록 `store.collection[deckId][slug]`(로그인 사용자만 "수집"으로 표기). 게스트 판정은 `useSession()`의 `user === null`.
- 데이터 구조·키 불변: `reversedFocus`(5테마×78), `reversedPositions`(78×{past,present,future})의 export명·타입·slug 키를 바꾸지 않는다. 텍스트만 교체.

---

### Task 1 (컨트롤러 직접 수행): 재저작 Codex 잡 6개 발사

서브에이전트 구현 태스크가 아니다 — 컨트롤러가 `codex:codex-rescue` 서브에이전트로 백그라운드 잡 6개를 띄우고 task-id를 기록한다. 결과 수합은 Task 6.

**Files:**
- Create: `.scratch/reversed-rewrite/` (Codex 산출 대상 디렉터리)
- Create: `.scratch/reversed-rewrite/jobs.md` (task-id 기록)

- [ ] **Step 1: 산출 디렉터리 생성** — `mkdir -p .scratch/reversed-rewrite`

- [ ] **Step 2: 테마 잡 5개 발사** — `codex:codex-rescue` 서브에이전트에 각각 아래 지시문을 주어 **백그라운드 Codex 잡**으로 실행하게 한다. `{THEME}`/`{THEME_KO}`/`{THEME_HINT}`를 치환:

| THEME | THEME_KO | THEME_HINT |
|---|---|---|
| love | 사랑 | 관계·마음·대화의 구체 상황 |
| work | 일 | 업무·성취·동료·프로젝트의 구체 상황 |
| self | 나 자신 | 내면·습관·자기 돌봄의 구체 상황 |
| health | 건강 | 몸·컨디션·생활 리듬의 구체 상황 |
| money | 금전 | 돈을 대하는 마음·소비·계획의 구체 상황 |

지시문(잡 하나당):

```
한국어 타로 앱의 역방향 {THEME_KO} 테마 해석 78건을 재저작한다. 작업 디렉터리: 이 저장소 루트.

읽을 것:
1. docs/reversed-variants-basis-2026-07-23/focus-{THEME}.json — 카드별 현행 텍스트(text)와 근거(basis: Waite·Mathers 역방향 키워드). 의미의 출발점은 이 basis다.
2. src/data/reversed.ts — 역방향 정본. 의미 참고용일 뿐, 이 파일의 구절·문형을 그대로 옮기는 것을 금지한다.
3. src/data/reversed-focus.ts 의 {THEME} 블록 — 현행이 왜 문제인지 참고: 정본 구절이 "X 역방향은 {THEME_KO}에서 <정본 구절> 모습으로 나타날 수 있습니다" 틀에 그대로 삽입돼 테마 고유 맥락이 약하다.

산출: .scratch/reversed-rewrite/{THEME}.json 파일 하나. UTF-8 JSON, 형태는 {"the-fool": "...", "the-magician": "...", ...} — focus-{THEME}.json과 동일한 78개 slug 키 전부.

저작 규칙:
- 각 텍스트 3문장 내외, 존댓말, 겁주지 않는 성찰적 톤. 예언 단정("~할 것입니다") 금지.
- 정본(reversed.ts)의 구절·핵심 어구를 그대로 재사용하지 말 것. "X 역방향은 {THEME_KO}에서 ~ 모습/양상으로 나타날 수 있습니다" 템플릿도 금지 — 문장 구조를 카드마다 변주하라.
- 의미는 basis의 Waite·Mathers 키워드에서 출발해 {THEME_HINT}으로 번역하라. 조언은 실행 가능하고 구체적으로.
- 카드의 한국어 이름 표기는 현행 텍스트(focus-{THEME}.json의 text 첫 어절)를 따른다.
- 78건 모두 빠짐없이. 비거나 중복된 텍스트 금지.

하지 말 것: .scratch/reversed-rewrite/{THEME}.json 외 파일 생성·수정 금지. git 커밋 금지. npx/npm 실행 금지.
```

- [ ] **Step 3: 포지션 잡 1개 발사** — 같은 방식, 지시문:

```
한국어 타로 앱의 역방향 포지션(과거/현재/미래) 문장 234건(78카드×3)을 재저작한다. 작업 디렉터리: 이 저장소 루트.

읽을 것:
1. docs/reversed-variants-basis-2026-07-23/positions.json — 카드별 현행 문장과 근거.
2. src/data/reversed.ts — 정본. 의미 참고용, 구절 재사용 금지.
3. src/data/reversed-positions.ts — 현행이 왜 문제인지 참고: 정본에서 딴 한 구("흩어진 의지" 등)를 과거="~한 자리입니다", 현재="~하고 있습니다", 미래="~살펴보세요/열어 두세요" 틀에 기계적으로 끼운 획일 구조다.

산출: .scratch/reversed-rewrite/positions.json 파일 하나. UTF-8 JSON, 형태는 {"the-fool": {"past": "...", "present": "...", "future": "..."}, ...} — 78개 slug 키 전부.

저작 규칙:
- 각 문장 1문장, 존댓말, 겁주지 않는 톤.
- 과거=이미 지나간 영향으로(회고의 어법), 현재=지금 작동 중인 힘으로(진단의 어법), 미래=열려 있는 가능성과 대비로(전망의 어법) — 시점마다 어법 자체가 달라야 하며, 한 카드의 세 문장이 같은 구를 돌려쓰지 않아야 한다.
- 의미는 basis의 Waite·Mathers 키워드에서 출발하되 그 시점의 삶의 장면으로 번역하라.
- 78건 모두, 세 키 전부. 빈 문자열 금지.

하지 말 것: .scratch/reversed-rewrite/positions.json 외 파일 생성·수정 금지. git 커밋 금지. npx/npm 실행 금지.
```

- [ ] **Step 4: task-id 기록** — 6개 잡의 Codex task-id를 `.scratch/reversed-rewrite/jobs.md`에 한 줄씩 기록. 폴링은 `node ~/.claude/plugins/cache/openai-codex/codex/<version>/scripts/codex-companion.mjs status <task-id>` (완료 시 `result <task-id>`). 커밋 없음.

---

### Task 2: `SignInButtons` 추출 + `/login` 페이지

**Files:**
- Create: `src/components/SignInButtons.tsx`
- Create: `src/app/login/page.tsx`
- Modify: `src/app/my/AccountCard.tsx:97-112` (버튼 블록을 SignInButtons로 대체)

**Interfaces:**
- Consumes: `signInWithProvider`, `useSession` (`@/lib/auth/session`)
- Produces: `<SignInButtons />` — 카카오/구글 버튼 2개(스타일·동작은 기존 AccountCard와 동일). Task 3·4가 `/login` 경로에 링크를 건다.

- [ ] **Step 1: SignInButtons 작성**

```tsx
// src/components/SignInButtons.tsx
"use client";

import { signInWithProvider } from "@/lib/auth/session";

/** 카카오/구글 로그인 버튼 한 쌍. AccountCard와 /login이 공유한다. */
export function SignInButtons() {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row">
      <button
        type="button"
        onClick={() => void signInWithProvider("kakao")}
        className="btn btn-gold flex-1"
      >
        카카오로 시작
      </button>
      <button
        type="button"
        onClick={() => void signInWithProvider("google")}
        className="btn btn-ghost flex-1"
      >
        구글로 시작
      </button>
    </div>
  );
}
```

- [ ] **Step 2: AccountCard의 로그인 버튼 블록 교체** — `src/app/my/AccountCard.tsx`의 signed-out 반환부에서 `<div className="mt-4 flex flex-col gap-2.5 sm:flex-row">…두 버튼…</div>`를 아래로 교체하고 import 추가(`import { SignInButtons } from "@/components/SignInButtons";`). `signInWithProvider` import는 더 이상 안 쓰면 제거:

```tsx
<div className="mt-4">
  <SignInButtons />
</div>
```

- [ ] **Step 3: /login 페이지 작성**

```tsx
// src/app/login/page.tsx
"use client";

import Link from "next/link";
import { CaretLeft, UserCircle } from "@phosphor-icons/react";
import { SignInButtons } from "@/components/SignInButtons";
import { useSession } from "@/lib/auth/session";

/** 로그인 랜딩. 유도 지점(미수집 칩, 수집됨 필터 빈 상태 등)이 이곳으로 보낸다. */
export default function LoginPage() {
  const { user, loading, configured } = useSession();

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <nav className="flex h-14 flex-none items-center px-5">
        <Link
          href="/my"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
        >
          <CaretLeft size={16} aria-hidden />
          돌아가기
        </Link>
      </nav>
      <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-6 pb-24">
        <UserCircle size={30} className="text-gold-soft" aria-hidden />
        <h1 className="mt-3 font-display text-[27px] font-semibold">로그인</h1>
        {loading ? (
          <p className="mt-2 min-h-[120px]" aria-hidden />
        ) : user ? (
          <>
            <p className="mt-2 text-[14.5px] text-muted">
              이미 로그인되어 있습니다. {user.email ?? user.id}
            </p>
            <Link href="/my" className="btn btn-gold mt-6">
              MY로 가기
            </Link>
          </>
        ) : configured ? (
          <>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
              기록을 기기 간에 안전하게 보관하고, 뽑은 카드를 도감에
              수집합니다.
            </p>
            <div className="mt-6">
              <SignInButtons />
            </div>
          </>
        ) : (
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
            로그인 준비 중입니다. 카카오·구글 로그인이 곧 열립니다 — 그때까지
            기록은 이 기기에 안전하게 보관됩니다.
          </p>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 4: 정적 검증** — Run: `./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/vitest run` / Expected: PASS.

- [ ] **Step 5: 브라우저 검증(컨트롤러)** — dev 서버에서 `/login`: 미설정 환경이므로 "로그인 준비 중입니다" 문구·돌아가기 링크 확인. `/my`의 AccountCard 렌더 회귀 없음(준비 중 카드 그대로). 콘솔 에러 없음.

- [ ] **Step 6: 커밋**

```bash
git add src/components/SignInButtons.tsx src/app/login/page.tsx src/app/my/AccountCard.tsx
git commit -m "Add the login page, extracting the sign-in buttons"
```

---

### Task 3: CollectHistory 게스트 '미수집' 칩

**Files:**
- Modify: `src/components/CollectHistory.tsx`

**Interfaces:**
- Consumes: `useSession` (`@/lib/auth/session`), Task 2의 `/login` 경로
- Produces: 게스트 분기 UI(칩+CTA). 다른 태스크가 의존하지 않는다.

- [ ] **Step 1: 게스트 분기 추가** — `CollectHistory` 본문을 아래로 교체(import에 `Link`(`next/link`)와 `useSession` 추가):

```tsx
export function CollectHistory({
  slug,
  deckId,
}: {
  slug: string;
  deckId: string;
}) {
  const { store } = useArcanaStore();
  const { user, loading } = useSession();
  const entry = store?.collection[deckId]?.[slug];

  return (
    <div className="mt-7 border-t border-line pt-5 lg:mt-10 lg:pt-7">
      {store === null || loading ? (
        <p className="text-[12.5px] text-muted" aria-hidden>
          {" "}
        </p>
      ) : user === null ? (
        <div>
          <span className="inline-block rounded-full border border-line px-3 py-1 text-[12px] text-muted">
            미수집
          </span>
          <p className="mt-2.5 text-[14px] text-muted">
            로그인하면 이 카드가 도감에 수집됩니다.
          </p>
          <Link
            href="/login"
            className="btn btn-gold mt-3.5 w-full sm:w-auto sm:px-8"
          >
            로그인하고 수집하기
          </Link>
        </div>
      ) : entry ? (
        <div className="flex gap-10 lg:gap-14">
          <div>
            <p className="text-[12.5px] text-muted lg:text-[13px]">첫 수집</p>
            <p className="font-display text-[17px] lg:text-[19px]">
              {formatKoDate(entry.firstAt)}
            </p>
          </div>
          <div>
            <p className="text-[12.5px] text-muted lg:text-[13px]">뽑은 횟수</p>
            <p className="font-display text-[17px] lg:text-[19px]">
              {entry.count}회
            </p>
          </div>
        </div>
      ) : (
        <p className="text-[14px] text-muted">아직 수집하지 않은 카드입니다</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 정적 검증** — Run: `./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/vitest run` / Expected: PASS.

- [ ] **Step 3: 브라우저 검증(컨트롤러)** — 미설정(=게스트) 상태의 카드 상세에서 미수집 칩+문구+버튼 노출, 버튼 → `/login` 랜딩 확인.

- [ ] **Step 4: 커밋**

```bash
git add src/components/CollectHistory.tsx
git commit -m "Show an uncollected chip with a login call for guests"
```

---

### Task 4: 도감 '수집됨' 필터

**Files:**
- Create: `src/lib/catalog-filter.ts`
- Test: `src/lib/catalog-filter.test.ts`
- Modify: `src/app/collection/[deckId]/page.tsx`

**Interfaces:**
- Consumes: `useArcanaStore`(이미 사용 중), `useSession`, `/login`, `Card`(`@/data/cards`)
- Produces: `visibleCards(all: Card[], filter: string, collected: ReadonlySet<string>): Card[]`

- [ ] **Step 1: 실패하는 테스트 작성** — `src/lib/catalog-filter.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cards } from "@/data/cards";
import { visibleCards } from "./catalog-filter";

describe("visibleCards", () => {
  it("collected 필터는 만난 slug만 남긴다", () => {
    const collected = new Set(["the-fool", "ace-of-cups"]);
    const out = visibleCards(cards, "collected", collected);
    expect(out.map((c) => c.slug).sort()).toEqual(["ace-of-cups", "the-fool"]);
  });
  it("collected 필터에 만난 카드가 없으면 빈 배열", () => {
    expect(visibleCards(cards, "collected", new Set())).toEqual([]);
  });
  it("major 필터는 메이저 22장", () => {
    expect(visibleCards(cards, "major", new Set())).toHaveLength(22);
  });
  it("수트 필터는 그 수트 14장", () => {
    expect(visibleCards(cards, "cups", new Set())).toHaveLength(14);
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `./node_modules/.bin/vitest run src/lib/catalog-filter.test.ts` / Expected: FAIL — 모듈 없음.

- [ ] **Step 3: 헬퍼 구현** — `src/lib/catalog-filter.ts`:

```ts
import type { Card } from "@/data/cards";

/** 도감 그리드 필터. collected는 만남 기록이 있는 slug 집합이다. */
export function visibleCards(
  all: Card[],
  filter: string,
  collected: ReadonlySet<string>,
): Card[] {
  if (filter === "collected") return all.filter((c) => collected.has(c.slug));
  if (filter === "major") return all.filter((c) => c.arcana === "major");
  return all.filter((c) => c.suit === filter);
}
```

- [ ] **Step 4: 페이지 배선** — `FILTERS` 배열 끝에 `{ id: "collected", label: "수집됨" }` 추가. `useSession` import 추가(`@/lib/auth/session`), 컴포넌트에서 `const { user } = useSession();`. `visible` 계산을 교체:

```tsx
const collectedSet = new Set(Object.keys(store?.collection[deck.id] ?? {}));
const visible = visibleCards(cards, filter, collectedSet);
```

(import: `import { visibleCards } from "@/lib/catalog-filter";`)

- [ ] **Step 5: 빈 상태 추가** — 그리드 `<div className="mt-4 grid …">` 바로 앞에:

```tsx
{filter === "collected" && store && visible.length === 0 ? (
  <div className="mt-5 rounded-2xl border border-line bg-ink-1 p-6">
    <p className="font-display text-lg font-semibold">
      아직 수집한 카드가 없습니다.
    </p>
    <p className="mt-1 text-[13.5px] text-muted">
      {user === null
        ? "로그인하면 뽑은 카드가 도감에 수집됩니다."
        : "리딩에서 뽑은 카드가 이곳에 모입니다."}
    </p>
    {user === null ? (
      <Link href="/login" className="btn btn-gold mt-4 w-full sm:w-auto sm:px-8">
        로그인하기
      </Link>
    ) : null}
  </div>
) : null}
```

- [ ] **Step 6: 정적 검증** — Run: `./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/vitest run` / Expected: PASS.

- [ ] **Step 7: 브라우저 검증(컨트롤러)** — ① 리딩 기록이 있는 덱: 수집됨 필터 → 뽑은 카드만 그리드에 남음 ② 기록 없는 덱: 빈 상태 배너 + (게스트) 로그인 버튼 ③ 기존 5개 필터 회귀 없음.

- [ ] **Step 8: 커밋**

```bash
git add src/lib/catalog-filter.ts src/lib/catalog-filter.test.ts "src/app/collection/[deckId]/page.tsx"
git commit -m "Add a collected filter to the deck catalog"
```

---

### Task 5: 덱 정보 데이터 확장 + DeckInfoModal

**Files:**
- Modify: `src/data/decks.ts`, `src/data/decks.test.ts`
- Modify: `public/decks/wolha-biwon/deck.json`, `public/decks/k-pop-museverse/deck.json`
- Create: `src/components/DeckInfoModal.tsx`
- Modify: `src/app/collection/[deckId]/page.tsx` (버튼+모달 배선)

**Interfaces:**
- Consumes: 기존 `Deck`/`decks`
- Produces: `Deck.info: DeckInfo` (`{ description: string[]; price?: number; productImages?: string[] }`), `<DeckInfoModal deck={Deck} onClose={() => void} />`

- [ ] **Step 1: 실패하는 테스트 추가** — `src/data/decks.test.ts`에:

```ts
it("모든 활성 덱은 소개 문구를 가진다", () => {
  for (const deck of decks.filter((d) => d.active)) {
    expect(deck.info.description.length, `${deck.id} description`).toBeGreaterThan(0);
    for (const p of deck.info.description) expect(p.trim()).not.toBe("");
  }
});
```

- [ ] **Step 2: 실패 확인** — Run: `./node_modules/.bin/vitest run src/data/decks.test.ts` / Expected: FAIL — `info` 없음(타입 에러 또는 undefined).

- [ ] **Step 3: 타입·데이터 확장** — `src/data/decks.ts`:

```ts
/** 덱 상품 정보. 문구·가격·이미지는 출시 전 교체 가능한 임시본이다. */
export type DeckInfo = {
  description: string[];
  price?: number;
  /** public 기준 경로. 첫 장은 800×1360(10:17) 상품 이미지, 이후 장은 모달에서 세로 스크롤. */
  productImages?: string[];
};

export type Deck = {
  id: string;
  nameKo: string;
  active: boolean;
  cardBack?: string;
  info: DeckInfo;
};
```

`decks` 배열: 클래식은 상수로, 프리미엄 2종은 deck.json의 `info`를 읽되 누락 시 빈 기본값:

```ts
const FALLBACK_INFO: DeckInfo = { description: [] };

export const decks: Deck[] = [
  {
    id: "classic",
    nameKo: "클래식 덱",
    active: true,
    info: {
      description: [
        "한 세기 넘게 타로의 표준이 되어 온 라이더-웨이트 도상을 담은 기본 덱입니다. 카드마다 장면이 이야기처럼 그려져 있어, 처음 만나는 분에게 가장 편안한 출발점이 됩니다.",
        "모든 리딩과 도감에서 언제나 무료로 쓸 수 있습니다.",
      ],
    },
  },
  {
    id: wolhaBiwon.id,
    nameKo: wolhaBiwon.nameKo,
    active: true,
    cardBack: `/decks/${wolhaBiwon.id}/card-back.webp`,
    info: (wolhaBiwon as { info?: DeckInfo }).info ?? FALLBACK_INFO,
  },
  {
    id: kpopMuseverse.id,
    nameKo: kpopMuseverse.nameKo,
    active: true,
    cardBack: `/decks/${kpopMuseverse.id}/card-back.webp`,
    info: (kpopMuseverse as { info?: DeckInfo }).info ?? FALLBACK_INFO,
  },
];
```

- [ ] **Step 4: deck.json 확장** — `public/decks/wolha-biwon/deck.json`:

```json
{
  "id": "wolha-biwon",
  "nameKo": "월하비원",
  "info": {
    "description": [
      "달이 가장 밝은 밤에만 문을 여는 비밀 정원, 월하비원. 78장의 카드가 달빛 아래 피어난 장면들로 새로 그려졌습니다.",
      "익숙한 카드의 의미는 그대로 두고, 그 위에 조용하고 서정적인 밤의 시선을 입혔습니다. 소장하시면 도감 78장이 한 번에 열립니다."
    ],
    "productImages": ["/decks/wolha-biwon/product/01.webp"]
  }
}
```

`public/decks/k-pop-museverse/deck.json`:

```json
{
  "id": "k-pop-museverse",
  "nameKo": "K-POP 뮤즈버스",
  "info": {
    "description": [
      "무대 위의 순간들을 타로의 상징으로 옮긴 K-POP 뮤즈버스. 78장의 카드가 데뷔부터 앙코르까지, 빛나는 장면들로 다시 태어났습니다.",
      "카드의 전통적 의미는 그대로, 표현은 무대의 언어로. 소장하시면 도감 78장이 한 번에 열립니다."
    ],
    "productImages": ["/decks/k-pop-museverse/product/01.webp"]
  }
}
```

주의: `nameKo`는 기존 deck.json 값을 유지한다(위 예시의 nameKo가 실제 파일과 다르면 실제 값을 보존).

- [ ] **Step 5: DeckInfoModal 작성**

```tsx
// src/components/DeckInfoModal.tsx
"use client";

import Image from "next/image";
import { useEffect } from "react";
import { X } from "@phosphor-icons/react";
import type { Deck } from "@/data/decks";

/** 덱 상품 정보 모달. 첫 이미지는 10:17(800×1360) 규격, 나머지는 아래로 이어 스크롤. */
export function DeckInfoModal({
  deck,
  onClose,
}: {
  deck: Deck;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const images = deck.info.productImages ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 lg:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${deck.nameKo} 덱 정보`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88dvh] w-full max-w-[440px] overflow-y-auto rounded-t-2xl border border-line bg-ink-1 lg:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ink-1 px-5 py-3.5">
          <p className="font-display text-[17px] font-semibold">{deck.nameKo}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex min-h-11 min-w-11 items-center justify-center text-muted hover:text-cream"
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        <div className="p-5">
          {images.length > 0 ? (
            <div className="space-y-3">
              {images.map((src, i) => (
                <div
                  key={src}
                  className="relative w-full overflow-hidden rounded-xl bg-ink-2"
                  style={{ aspectRatio: "10 / 17" }}
                >
                  <Image
                    src={src}
                    alt={i === 0 ? `${deck.nameKo} 상품 이미지` : ""}
                    fill
                    sizes="440px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex w-full items-center justify-center rounded-xl bg-ink-2 text-[13px] text-muted"
              style={{ aspectRatio: "10 / 17" }}
            >
              이미지 준비 중
            </div>
          )}
          <div className="mt-5 space-y-3 font-serif text-[14.5px] text-body">
            {deck.info.description.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-[13px] text-muted">가격</span>
            <span className="font-display text-[17px] text-gold-soft">
              {deck.info.price !== undefined
                ? `${deck.info.price.toLocaleString()}원`
                : deck.id === "classic"
                  ? "무료"
                  : "출시 예정"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

주의: 상품 이미지 파일(`public/decks/*/product/01.webp`)은 아직 없다 — `next/image`가 404를 던지므로, 파일이 실제로 없는 동안은 deck.json의 `productImages`를 **빈 배열이 아니라 아예 생략**하고 위 예시에서 productImages 줄을 뺀 채 커밋한다(플레이스홀더 경로를 규약 주석으로만 남김). 구현 시 `ls public/decks/*/product/ 2>/dev/null`로 실측해 결정하라.

- [ ] **Step 6: 카탈로그에 버튼+모달 배선** — `src/app/collection/[deckId]/page.tsx`: `useState`로 `const [infoOpen, setInfoOpen] = useState(false);`, import `DeckInfoModal`. "기본 덱으로 설정" 버튼(또는 기본 덱 문구)이 있는 `<div>` 안에서 그 요소를 flex 행으로 감싸고 옆에:

```tsx
<button
  type="button"
  onClick={() => setInfoOpen(true)}
  className="min-h-11 text-[13px] text-muted underline underline-offset-4 hover:text-cream"
>
  덱 정보
</button>
```

(기존 요소와 `flex items-center gap-4`로 나란히.) 컴포넌트 마지막, `<TabBar />` 앞에:

```tsx
{infoOpen ? (
  <DeckInfoModal deck={deck} onClose={() => setInfoOpen(false)} />
) : null}
```

- [ ] **Step 7: 통과 확인** — Run: `./node_modules/.bin/vitest run && ./node_modules/.bin/tsc --noEmit` / Expected: PASS(Step 1 테스트 포함).

- [ ] **Step 8: 브라우저 검증(컨트롤러)** — 월하비원 카탈로그에서 "덱 정보" → 모달(이미지 준비 중 블록, 문구 2문단, "출시 예정"), 클래식은 "무료", 바깥 클릭·ESC·닫기 버튼 동작, 배경 스크롤 잠금.

- [ ] **Step 9: 커밋**

```bash
git add src/data/decks.ts src/data/decks.test.ts public/decks/wolha-biwon/deck.json public/decks/k-pop-museverse/deck.json src/components/DeckInfoModal.tsx "src/app/collection/[deckId]/page.tsx"
git commit -m "Add the deck info modal with provisional product copy"
```

---

### Task 6 (컨트롤러 직접 수행): Codex 산출 수합 → TS 재생성 → 검증 → 커밋

**Files:**
- Modify: `src/data/reversed-focus.ts`, `src/data/reversed-positions.ts` (텍스트 전량 교체)
- Create: `src/data/reversed-variants.test.ts`

- [ ] **Step 1: 잡 완료 확인** — `.scratch/reversed-rewrite/jobs.md`의 6개 task-id를 `codex-companion.mjs status`로 폴링, 전부 completed면 `result`로 수합. 6개 JSON이 모두 존재하고 각각 78키(positions는 78×3)인지 python으로 검증. 미달 잡은 같은 지시문으로 재발사(전체 재실행 아님).

- [ ] **Step 2: 실패하는 테스트 작성** — `src/data/reversed-variants.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cards } from "./cards";
import { reversedCards } from "./reversed";
import { reversedFocus } from "./reversed-focus";
import { reversedPositions } from "./reversed-positions";

const THEMES = ["love", "work", "self", "health", "money"] as const;
const SLUGS = cards.map((c) => c.slug);

describe("역방향 변형", () => {
  it("테마 5×78 전수, 비어 있지 않음", () => {
    for (const theme of THEMES) {
      const block = reversedFocus[theme];
      expect(block, theme).toBeDefined();
      for (const slug of SLUGS) {
        expect(block![slug]?.trim(), `${theme}/${slug}`).toBeTruthy();
      }
    }
  });
  it("포지션 78×3 전수, 비어 있지 않음", () => {
    for (const slug of SLUGS) {
      const p = reversedPositions[slug];
      expect(p, slug).toBeDefined();
      expect(p.past.trim(), `${slug} past`).toBeTruthy();
      expect(p.present.trim(), `${slug} present`).toBeTruthy();
      expect(p.future.trim(), `${slug} future`).toBeTruthy();
    }
  });
  it("변형은 정본 문장을 통째로 재사용하지 않는다", () => {
    // 정본 각 문장(15자 이상)이 변형에 그대로 들어가면 재저작 실패의 신호다.
    for (const slug of SLUGS) {
      const canonical = reversedCards[slug]?.ko ?? "";
      const sentences = canonical
        .split(/[.!?。]\s*/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 15);
      for (const theme of THEMES) {
        const text = reversedFocus[theme]?.[slug] ?? "";
        for (const sen of sentences) {
          expect(text.includes(sen), `${theme}/${slug} 정본 문장 재사용`).toBe(false);
        }
      }
    }
  });
});
```

Run: `./node_modules/.bin/vitest run src/data/reversed-variants.test.ts` — 현행 데이터로도 1·2번은 통과할 수 있으나 3번(정본 재사용)이 현행의 문제를 드러내며 실패할 수 있다. 실패해도 좋다 — 교체 후 전부 통과가 목표.

- [ ] **Step 3: TS 파일 재생성** — 아래 python 스크립트를 스크래치에 저장해 실행(`python3 .scratch/reversed-rewrite/assemble.py`). 헤더 주석과 `reversedFocusParagraphOf` 헬퍼는 보존:

```python
import json, io

def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')

themes = ["love", "work", "self", "health", "money"]
data = {t: json.load(open(f".scratch/reversed-rewrite/{t}.json")) for t in themes}
import re
src = open("src/data/cards.ts").read()
slug_order = re.findall(r'slug: "([a-z0-9-]+)"', src)  # cards.ts의 정의 순서

out = io.StringIO()
out.write('''// 역방향 × 테마 해석. 정방향 테마(ko-focus-*.ts)와 같은 각도로, 각 카드의
// 역방향 의미를 Waite(1911)·Mathers(1888)의 역방향 점의에서 출발해 테마의
// 구체 상황으로 번역해 새로 썼다(2026-07-25 재저작 — 정본 워딩과 독립).
// 카드·문장별 출처 메모는 docs/reversed-variants-basis-2026-07-23/ 에 보존돼 있다.
// day 테마는 정방향과 마찬가지로 전용 텍스트가 없다(기본 역방향 해석 사용).

import type { FocusId } from "./focus";

export const reversedFocus: Partial<Record<FocusId, Record<string, string>>> = {
''')
for t in themes:
    out.write(f"  {t}: {{\n")
    for slug in slug_order:
        out.write(f'    "{slug}":\n      "{esc(data[t][slug])}",\n')
    out.write("  },\n")
out.write('''};

/** 역방향 테마 해석. 없으면(day 등) null. */
export function reversedFocusParagraphOf(
  focusId: string,
  slug: string,
): string | null {
  return reversedFocus[focusId as FocusId]?.[slug] ?? null;
}
''')
open("src/data/reversed-focus.ts", "w").write(out.getvalue())

pos = json.load(open(".scratch/reversed-rewrite/positions.json"))
out = io.StringIO()
out.write('''// 역방향 × 포지션(과거/현재/미래) 문장. ko-positions.ts의 역방향 대응물로,
// Waite·Mathers 근거를 각 시점의 어법(회고/진단/전망)으로 옮겨 새로 썼다
// (2026-07-25 재저작). 출처 메모는 docs/reversed-variants-basis-2026-07-23/ 에 보존돼 있다.

export const reversedPositions: Record<
  string,
  { past: string; present: string; future: string }
> = {
''')
for slug in slug_order:
    p = pos[slug]
    out.write(f'  "{slug}": {{\n')
    for k in ("past", "present", "future"):
        out.write(f'    {k}: "{esc(p[k])}",\n')
    out.write("  },\n")
out.write("};\n")
open("src/data/reversed-positions.ts", "w").write(out.getvalue())
print("done", len(slug_order))
```

- [ ] **Step 4: 검증** — Run: `./node_modules/.bin/vitest run && ./node_modules/.bin/tsc --noEmit` / Expected: 전부 PASS(재사용 금지 테스트 포함). 브라우저: 역방향 카드가 나온 리딩 결과에서 테마·포지션 역방향 문구가 새 텍스트로 렌더되는지 확인.

- [ ] **Step 5: 커밋**

```bash
git add src/data/reversed-focus.ts src/data/reversed-positions.ts src/data/reversed-variants.test.ts
git commit -m "Rewrite the reversed theme and position variants"
```

---

### Task 7: Opus 5 검수 → 반영

**Files:**
- Modify: `src/data/reversed-focus.ts`, `src/data/reversed-positions.ts` (검수 반영)

- [ ] **Step 1: Opus 5 서브에이전트 디스패치** — **반드시 `model: "opus"`**(사용자 지정). 프롬프트에 포함:
  - 대상: `src/data/reversed-focus.ts`·`reversed-positions.ts` 전량 정독
  - 기준 ① **정본 대비 워딩 독립성**(핵심): `src/data/reversed.ts`와 대조 — 구절 재사용·템플릿 답습 탐지 ② 테마·포지션 반영도: 각 텍스트가 그 테마/시점의 구체 상황으로 서 있는가 ③ 근거 정합: `docs/reversed-variants-basis-2026-07-23/`의 Waite·Mathers 키워드와 의미가 이어지는가(샘플 심층 + 전수 훑기) ④ 톤: 겁주지 않는 성찰적 존댓말, 예언 단정 금지
  - 산출: 파일:slug(테마/시점)별 지적 목록(심각도 구분), 수정 금지 — 보고만
- [ ] **Step 2: 지적 반영** — 컨트롤러가 타당한 지적을 반영(소량은 직접, 대량은 Codex 픽스 잡 재발사 → Step 3 재검증). 반영 후 Opus에 재검수(같은 에이전트 SendMessage) → 승인까지 반복.
- [ ] **Step 3: 최종 검증·커밋**

```bash
./node_modules/.bin/vitest run && ./node_modules/.bin/tsc --noEmit
git add src/data/reversed-focus.ts src/data/reversed-positions.ts
git commit -m "Apply the reversed variant review fixes"
```

---

## 실행 메모

- **순서**: Task 1(잡 발사) → Task 2~5(UI, 순차 SDD) → Task 6(수합·조립) → Task 7(검수). Task 6은 잡이 다 끝나야 하므로, UI가 먼저 끝나면 폴링 간격을 두고 대기.
- Task 2~4는 서로 다른 파일이지만 4·5가 같은 페이지(`collection/[deckId]/page.tsx`)를 수정하므로 **순차**로.
- UI 구현 워커는 코드가 플랜에 완결돼 있으므로 저렴한 모델로 충분. 브라우저 검증은 전부 컨트롤러가.
- Codex 잡이 JSON 키 누락·형식 오류를 내면 해당 잡만 재발사(멱등). 세 번 실패하면 그 블록만 Claude 워커로 폴백하되 사용자에게 보고.
