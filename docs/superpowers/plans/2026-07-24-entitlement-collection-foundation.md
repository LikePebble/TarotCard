# 엔타이틀먼트 · 도감 소유 모델 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 덱 소유(entitlement) 개념을 도입하고, 도감을 "뽑아 모으는 그라인드"에서 "소유 기반 갤러리"로 바꾸며, MY의 "수집 n/78"을 "함께한 날"로 교체한다.

**Architecture:** 순수 로직(소유·완성도·함께한날)을 먼저 세우고 유닛테스트한다. 도감 완성도는 리딩이 아니라 엔타이틀먼트에서 파생한다. 엔타이틀먼트는 로컬 우선(캐시) + 서버 pull. 로컬만으로 모델 전체를 개발용 지급 토글로 시연·검증한 뒤, 서버 브리지를 얹는다(서버 검증은 Supabase 설정 후).

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind v4, Vitest 2 (`environment: "node"`), Supabase.

**설계 근거:** [`docs/superpowers/specs/2026-07-24-entitlement-collection-foundation-design.md`](../specs/2026-07-24-entitlement-collection-foundation-design.md).

## Global Constraints

- **`npm run build`를 돌리지 않는다** — dev 서버가 떠 있으면 `.next`가 깨진다. `npx tsc --noEmit`과 `npm test`로 확인한다.
- 기존 테스트는 계속 통과해야 한다.
- 한국어 주석, 짧게, 왜 그런지 위주. 2-space, 큰따옴표, Tailwind v4.
- 테스트 환경은 `node`다. `window`·DOM이 없다. 새 테스트는 순수 함수만 대상으로 한다. React 컴포넌트는 유닛테스트하지 않고 `tsc`+기존 테스트+브라우저로 확인한다(이 저장소의 기존 관례).
- **클래식은 모두에게 암묵 소유** — entitlements에 행을 만들지 않고 코드 상수(`"classic"`)로 처리한다.
- 커밋마다 빌드가 초록이어야 한다 — 작업 순서가 그렇게 잡혀 있다.
- DRY, YAGNI, TDD(순수 로직), 잦은 커밋.

---

### Task 1: 엔타이틀먼트 순수 모델

**Files:**
- Create: `src/lib/entitlements.ts`
- Test: `src/lib/entitlements.test.ts`

**Interfaces:**
- Consumes: `cards` from `@/data/cards` (78장 slug 소스).
- Produces:
  - `type Entitlements = { ownedDeckIds: string[]; adFree: boolean }`
  - `const EMPTY_ENTITLEMENTS: Entitlements`
  - `ownsDeck(deckId: string, ent: Entitlements): boolean`
  - `collectedCount(deckId: string, ent: Entitlements): number`
  - `collectedSlugs(deckId: string, ent: Entitlements): Set<string>`

- [ ] **Step 1: Write the failing test**

`src/lib/entitlements.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import {
  EMPTY_ENTITLEMENTS,
  ownsDeck,
  collectedCount,
  collectedSlugs,
} from "@/lib/entitlements";

const NONE = EMPTY_ENTITLEMENTS;
const OWNS_WOLHA = { ownedDeckIds: ["wolha-biwon"], adFree: false };

describe("ownsDeck", () => {
  it("클래식은 항상 소유(행 없이도)", () => {
    expect(ownsDeck("classic", NONE)).toBe(true);
  });
  it("프리미엄은 목록에 있을 때만 소유", () => {
    expect(ownsDeck("wolha-biwon", NONE)).toBe(false);
    expect(ownsDeck("wolha-biwon", OWNS_WOLHA)).toBe(true);
    expect(ownsDeck("k-pop-museverse", OWNS_WOLHA)).toBe(false);
  });
});

describe("collectedCount", () => {
  it("소유 덱은 78, 미소유는 0", () => {
    expect(collectedCount("classic", NONE)).toBe(78);
    expect(collectedCount("wolha-biwon", NONE)).toBe(0);
    expect(collectedCount("wolha-biwon", OWNS_WOLHA)).toBe(78);
  });
});

describe("collectedSlugs", () => {
  it("소유 덱은 78개 슬러그, 미소유는 빈 집합", () => {
    expect(collectedSlugs("classic", NONE).size).toBe(78);
    expect(collectedSlugs("wolha-biwon", NONE).size).toBe(0);
    expect(collectedSlugs("classic", NONE).has("the-fool")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/entitlements.test.ts`
Expected: FAIL — `entitlements.ts` 없음 / import 오류.

- [ ] **Step 3: Write minimal implementation**

`src/lib/entitlements.ts`:
```ts
import { cards } from "@/data/cards";

/** 이 사용자가 가진 것. 클래식은 여기 안 넣는다(암묵 소유). */
export type Entitlements = { ownedDeckIds: string[]; adFree: boolean };

export const EMPTY_ENTITLEMENTS: Entitlements = {
  ownedDeckIds: [],
  adFree: false,
};

/** 78장 전체 슬러그. 소유 덱의 도감 완성도 기준. */
const ALL_SLUGS: ReadonlySet<string> = new Set(cards.map((c) => c.slug));

/** 클래식은 모두 소유. 프리미엄은 entitlements에 있을 때만. */
export function ownsDeck(deckId: string, ent: Entitlements): boolean {
  return deckId === "classic" || ent.ownedDeckIds.includes(deckId);
}

/** 도감 완성도 = 소유면 78, 아니면 0(부분 수집 없음). */
export function collectedCount(deckId: string, ent: Entitlements): number {
  return ownsDeck(deckId, ent) ? ALL_SLUGS.size : 0;
}

/** 소유 덱은 전체 슬러그, 미소유는 빈 집합. */
export function collectedSlugs(deckId: string, ent: Entitlements): Set<string> {
  return ownsDeck(deckId, ent) ? new Set(ALL_SLUGS) : new Set();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/entitlements.test.ts`
Expected: PASS (7 assertions).

- [ ] **Step 5: tsc + commit**

Run: `npx tsc --noEmit` → 에러 없음.
```bash
git add src/lib/entitlements.ts src/lib/entitlements.test.ts
git commit -m "Add the entitlement ownership model"
```

---

### Task 2: 함께한 날 지표

**Files:**
- Modify: `src/lib/store.ts` (함수 추가)
- Test: `src/lib/store.test.ts` (없으면 생성; 있으면 케이스 추가)

**Interfaces:**
- Consumes: `ArcanaStore`, `ReadingRecord` (기존 `store.ts` 타입).
- Produces: `togetherDays(store: ArcanaStore | null): number`

- [ ] **Step 1: Write the failing test**

`src/lib/store.test.ts`에 추가(없으면 파일 생성 후 아래만):
```ts
import { describe, expect, it } from "vitest";
import { togetherDays, type ArcanaStore } from "@/lib/store";

function storeWith(dates: string[]): ArcanaStore {
  return {
    version: 2,
    collection: {},
    readings: dates.map((d, i) => ({
      id: `r${i}`,
      at: `${d}T09:00:00.000Z`,
      localDate: d,
      isoWeek: "2026-W30",
      spread: "one" as const,
      typeId: "ONE_CARD" as const,
      category: "day",
      deckId: "classic",
      cards: ["the-fool"],
      orientations: ["upright" as const],
    })),
  };
}

describe("togetherDays", () => {
  it("서로 다른 localDate 수를 센다(중복 제거)", () => {
    expect(togetherDays(storeWith(["2026-07-24", "2026-07-24", "2026-07-23"]))).toBe(2);
  });
  it("빈 스토어/null은 0", () => {
    expect(togetherDays(storeWith([]))).toBe(0);
    expect(togetherDays(null)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/store.test.ts`
Expected: FAIL — `togetherDays` export 없음.

- [ ] **Step 3: Write minimal implementation**

`src/lib/store.ts` 아무 export 함수 근처에 추가:
```ts
/** 함께한 날 = 카드를 뽑은 서로 다른 날 수. 티어·이벤트의 서버 지표이기도 하다
 *  (readings가 이미 서버 동기화되므로 별도 저장이 필요 없다). */
export function togetherDays(store: ArcanaStore | null): number {
  if (!store) return 0;
  return new Set(store.readings.map((r) => r.localDate)).size;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/store.test.ts`
Expected: PASS.

- [ ] **Step 5: tsc + commit**

Run: `npx tsc --noEmit` → 에러 없음.
```bash
git add src/lib/store.ts src/lib/store.test.ts
git commit -m "Count the days we drew a card"
```

---

### Task 3: recomputeCollection → recomputeEncounters 개명

**의도:** 이 맵은 이제 완성도가 아니라 "만남의 기록"(처음 뽑은 날)이다. 역할이 바뀌었음을 이름으로 드러낸다. 로직·시그니처·정합성은 동일.

**Files:**
- Modify: `src/lib/sync/merge.ts` (함수명 + 내부 호출)
- Modify: `src/lib/sync/remote.ts` (호출부)
- Modify: `src/lib/sync/merge.test.ts` (있으면 이름 갱신)

**Interfaces:**
- Produces: `recomputeEncounters(readings: ReadingRecord[]): ArcanaStore["collection"]` (기존 `recomputeCollection`과 동일 시그니처, 이름만 변경).

- [ ] **Step 1: 개명**

`src/lib/sync/merge.ts`에서 `export function recomputeCollection` → `export function recomputeEncounters`로 바꾸고, 같은 파일 `mergeStores` 안의 `recomputeCollection(readings)` 호출도 `recomputeEncounters(readings)`로 바꾼다. 주석의 "도감"을 "만남 기록"으로 다듬는다.

- [ ] **Step 2: 호출부 갱신**

`src/lib/sync/remote.ts`에서 `recomputeCollection` import·호출 2곳(`pullRemoteStore`의 `data`, 있으면 그 외)을 `recomputeEncounters`로 바꾼다. `grep -n "recomputeCollection" src/`로 잔존 0 확인.

- [ ] **Step 3: 테스트 이름 갱신**

`src/lib/sync/merge.test.ts`가 `recomputeCollection`을 import하면 `recomputeEncounters`로 바꾼다(케이스는 그대로).

- [ ] **Step 4: 검증**

Run: `grep -rn "recomputeCollection" src/` → 출력 없음.
Run: `npx tsc --noEmit && npx vitest run src/lib/sync/merge.test.ts`
Expected: tsc 클린, 테스트 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/sync/merge.ts src/lib/sync/remote.ts src/lib/sync/merge.test.ts
git commit -m "Rename the draw-derived map to encounters"
```

---

### Task 4: 로컬 엔타이틀먼트 캐시 + 훅

**의도:** 엔타이틀먼트는 서버 권위지만, 로컬 우선 원칙대로 캐시를 둔다. store/journal과 같은 패턴(localStorage + `local-events` + 훅).

**Files:**
- Modify: `src/lib/local-events.ts` (채널 추가)
- Modify: `src/lib/entitlements.ts` (로컬 I/O + 훅)
- Test: `src/lib/entitlements.test.ts` (로컬 파싱 케이스 추가 — 순수 부분만)

**Interfaces:**
- Consumes: `notifyLocal`, `subscribeLocal` from `@/lib/local-events`.
- Produces:
  - `parseEntitlements(raw: unknown): Entitlements` (순수, 방어적 파싱)
  - `loadEntitlements(): Entitlements` / `setLocalEntitlements(e: Entitlements): void` / `clearLocalEntitlements(): void`
  - `useEntitlements(): Entitlements` (client 훅)

- [ ] **Step 1: local-events에 채널 추가**

`src/lib/local-events.ts`:
- `export type LocalChannel = "store" | "journal";` → `"store" | "journal" | "entitlements";`
- `subscribers` 객체에 `entitlements: new Set(),` 추가.

- [ ] **Step 2: Write the failing test (순수 파싱)**

`src/lib/entitlements.test.ts`에 추가:
```ts
import { parseEntitlements, EMPTY_ENTITLEMENTS } from "@/lib/entitlements";

describe("parseEntitlements", () => {
  it("정상 객체를 그대로 정규화", () => {
    expect(parseEntitlements({ ownedDeckIds: ["wolha-biwon"], adFree: true }))
      .toEqual({ ownedDeckIds: ["wolha-biwon"], adFree: true });
  });
  it("깨진 값은 EMPTY로", () => {
    expect(parseEntitlements(null)).toEqual(EMPTY_ENTITLEMENTS);
    expect(parseEntitlements({ ownedDeckIds: "x" })).toEqual(EMPTY_ENTITLEMENTS);
    expect(parseEntitlements({})).toEqual(EMPTY_ENTITLEMENTS);
  });
  it("ownedDeckIds의 비문자열 원소는 걸러낸다", () => {
    expect(parseEntitlements({ ownedDeckIds: ["a", 1, null], adFree: 0 }))
      .toEqual({ ownedDeckIds: ["a"], adFree: false });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/entitlements.test.ts`
Expected: FAIL — `parseEntitlements` 없음.

- [ ] **Step 4: 구현**

`src/lib/entitlements.ts` 하단에 추가(`"use client"`를 파일 맨 위에 붙인다 — 훅이 있으므로):
```ts
// 파일 맨 위 첫 줄에 추가:
// "use client";

import { useCallback, useEffect, useState } from "react";
import { notifyLocal, subscribeLocal } from "@/lib/local-events";

const KEY = "arcana.entitlements.v1";

/** 임의 값을 안전한 Entitlements로 정규화한다(순수). */
export function parseEntitlements(raw: unknown): Entitlements {
  if (!raw || typeof raw !== "object") return EMPTY_ENTITLEMENTS;
  const r = raw as Record<string, unknown>;
  const owned = Array.isArray(r.ownedDeckIds)
    ? r.ownedDeckIds.filter((x): x is string => typeof x === "string")
    : null;
  if (!owned) return EMPTY_ENTITLEMENTS;
  return { ownedDeckIds: owned, adFree: r.adFree === true };
}

export function loadEntitlements(): Entitlements {
  if (typeof window === "undefined") return EMPTY_ENTITLEMENTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? parseEntitlements(JSON.parse(raw)) : EMPTY_ENTITLEMENTS;
  } catch {
    return EMPTY_ENTITLEMENTS;
  }
}

export function setLocalEntitlements(e: Entitlements): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(e));
    } catch {
      // storage full/unavailable; 인메모리 의도는 아래 알림으로 전파.
    }
  }
  notifyLocal("entitlements");
}

/** 로그아웃 시 로컬 캐시를 비운다(다음 계정에 안 섞이게). */
export function clearLocalEntitlements(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // 위와 같다.
    }
  }
  notifyLocal("entitlements");
}

/** Client 훅: 마운트 전에는 EMPTY(SSR 안전), 이후 로컬 캐시를 따른다. */
export function useEntitlements(): Entitlements {
  const [ent, setEnt] = useState<Entitlements>(EMPTY_ENTITLEMENTS);
  const refresh = useCallback(() => setEnt(loadEntitlements()), []);
  useEffect(() => {
    refresh();
    return subscribeLocal("entitlements", refresh);
  }, [refresh]);
  return ent;
}
```

주의: 파일 첫 줄 `"use client";`가 붙으면 순수 테스트도 그대로 돈다(node 환경에서 `"use client"`는 무시됨). `cards` import는 유지.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/entitlements.test.ts`
Expected: PASS (전체).

- [ ] **Step 6: tsc + commit**

Run: `npx tsc --noEmit` → 에러 없음.
```bash
git add src/lib/entitlements.ts src/lib/entitlements.test.ts src/lib/local-events.ts
git commit -m "Cache entitlements locally, local-first"
```

---

### Task 5: 도감을 소유 기반으로 — UI 일괄 전환

**의도:** `collectedCount`의 의미가 "뽑은 수"에서 "소유"로 바뀌므로, 옛 `store.collectedCount`를 제거하고 모든 호출부를 엔타이틀먼트 버전으로 옮긴다. MY의 "수집"은 "함께한 날"로, draw의 "컬렉션에 추가되었습니다" 배너는 은퇴시킨다(소유 모델에선 뽑아도 완성도가 안 바뀐다). **커밋 한 번에 초록으로 끝나야 하는 통합 작업이다.**

**Files:**
- Modify: `src/lib/store.ts` (옛 `collectedCount` 제거)
- Modify: `src/app/my/page.tsx` (수집 → 함께한 날)
- Modify: `src/app/collection/page.tsx` (덱 목록 count)
- Modify: `src/app/collection/[deckId]/page.tsx` (도감 count + 카드별 collected → 덱 소유)
- Modify: `src/components/CollectedCardNav.tsx` (이전/다음 순회 집합 → 소유)
- Modify: `src/app/reading/draw/page.tsx` (collectionCount 배너 제거)
- Modify: `src/app/reading/ReadingResult.tsx` (collectionCount prop·배너 블록 제거)

**Interfaces:**
- Consumes: `collectedCount`, `ownsDeck`, `useEntitlements` from `@/lib/entitlements`; `togetherDays` from `@/lib/store`.

- [ ] **Step 1: 옛 collectedCount 제거**

`src/lib/store.ts`의 `export function collectedCount(store: ArcanaStore, deckId: string)` 블록을 삭제한다. (이 시점엔 빌드가 깨진다 — 이어지는 스텝에서 호출부를 모두 옮긴 뒤 초록이 된다.)

- [ ] **Step 2: MY 통계 교체**

`src/app/my/page.tsx`:
- import에서 `collectedCount`·`useSelectedDeck` 중 이 통계에만 쓰이던 것 정리, `togetherDays`는 `@/lib/store`에서, 나머지는 그대로.
- 통계 계산부를 아래로:
```tsx
  const readings = store?.readings.length ?? 0;
  const together = togetherDays(store);
  const days = journal ? Object.keys(journal).length : 0;

  const stats = [
    { label: "함께한 날", value: together, unit: "" },
    { label: "리딩", value: readings, unit: "회" },
    { label: "기록", value: days, unit: "일" },
  ];
```
- `useSelectedDeck`·`collectedCount`가 이 파일에서 더 쓰이지 않으면 import 제거.

- [ ] **Step 3: 컬렉션 덱 목록 count**

`src/app/collection/page.tsx`:
- `import { collectedCount } from "@/lib/store"` → `import { collectedCount } from "@/lib/entitlements"`, `import { useEntitlements } from "@/lib/entitlements"` 추가.
- 컴포넌트 안에 `const ent = useEntitlements();`
- `const collected = store ? collectedCount(store, deck.id) : 0;` → `const collected = collectedCount(deck.id, ent);`

- [ ] **Step 4: 덱 도감 — count + 카드별 잠금**

`src/app/collection/[deckId]/page.tsx`:
- import를 엔타이틀먼트 버전으로(`collectedCount`, `ownsDeck`, `useEntitlements`).
- `const ent = useEntitlements();`
- `const total = store ? collectedCount(store, deck.id) : 0;` → `const total = collectedCount(deck.id, ent);`
- `const owned = ownsDeck(deck.id, ent);` 추가.
- 그리드 안 `const collected = !!store?.collection[deck.id]?.[card.slug];` → `const collected = owned;` (소유면 전 카드 아트, 미소유면 전 카드 뒷면 — §10의 "전부 잠금" 기본값. 세부 UX는 하위 프로젝트 3).

- [ ] **Step 4b: 카드 상세 이전/다음 순회를 소유 기반으로**

`src/components/CollectedCardNav.tsx`:
- `import { useEntitlements, collectedSlugs } from "@/lib/entitlements";` 추가.
- `const ent = useEntitlements();` 추가(기존 `useArcanaStore` 훅 근처).
- `const collected = new Set(Object.keys(store.collection[deckId] ?? {}));` → `const collected = collectedSlugs(deckId, ent);`
- `store === null` 게이트가 있으면 그대로 둔다(마운트 전 자리표시자). 소유면 78장 사이를 순회, 미소유면 빈 집합이라 이전/다음이 없다(미소유 덱 상세는 잠금 그리드에서 도달 불가하므로 실사용상 무해).
- 주의: `CollectHistory`("이 카드 처음 뽑은 날")는 **만남 기록**이므로 `store.collection`을 계속 읽는다 — 건드리지 않는다.

- [ ] **Step 5: draw 배너 제거**

`src/app/reading/draw/page.tsx`:
- `collectedCount` import 제거.
- `const [count, setCount] = useState<number | null>(null);` 및 `setCount(...)` 호출 제거.
- `OneCardResult`·`ThreeCardResult`에 넘기던 `collectionCount={count}` 두 줄 제거.
- `setup()`의 `setCount(null);`도 제거.

- [ ] **Step 6: ReadingResult에서 배너 제거**

`src/app/reading/ReadingResult.tsx`:
- `OneCardResult`·`ThreeCardResult`의 props에서 `collectionCount?: number | null;` 제거.
- 두 컴포넌트 본문의 `{collectionCount !== undefined ? ( ...컬렉션에 추가되었습니다... ) : null}` 블록 통째 제거.
- `/reading/[id]/page.tsx`는 원래 `collectionCount`를 넘기지 않으므로 무변경(확인만).

- [ ] **Step 7: 검증**

Run: `grep -rn "collectedCount\|collectionCount" src/ | grep -v "entitlements"` → draw/result/my/collection에 잔존 없어야(엔타이틀먼트 import 라인만 남음).
Run: `grep -rn "store.collection\[" src/ | grep -v "test"` → `CollectHistory.tsx`(만남 기록)만 남아야 한다. `CollectedCardNav`·도감 그리드는 소유로 이전됐다.
Run: `npx tsc --noEmit && npm test`
Expected: tsc 클린, 테스트 전부 PASS.

- [ ] **Step 8: 브라우저 확인**

`preview_start`(arcana-lan). 다음을 확인:
- MY 통계가 `[함께한 날 · 리딩 · 기록]`이고 함께한 날에 단위가 안 붙는다.
- 컬렉션 덱 목록에서 클래식이 `78 / 78`, 프리미엄이 `0 / 78`.
- 클래식 도감은 전 카드 아트, 프리미엄 도감은 전 카드 뒷면.
- 새로 뽑아도 "컬렉션에 추가되었습니다" 배너가 없다.

- [ ] **Step 9: Commit**

```bash
git add src/lib/store.ts src/app/my/page.tsx src/app/collection/page.tsx "src/app/collection/[deckId]/page.tsx" src/components/CollectedCardNav.tsx src/app/reading/draw/page.tsx src/app/reading/ReadingResult.tsx
git commit -m "Read the collection from ownership, not draws"
```

---

### Task 6: 개발용 덱 지급 토글 (로컬 시연)

**의도:** Supabase 없이도 소유 모델 전체를 눈으로 검증할 수 있게, 개발 빌드에서만 프리미엄 덱을 로컬로 지급/회수하는 토글을 둔다(dev-reset 버튼과 같은 성격). 실제 구매 UI는 하위 프로젝트 3.

**Files:**
- Modify: `src/lib/entitlements.ts` (`grantDeckLocal`, `revokeDeckLocal`)
- Modify: `src/app/collection/page.tsx` (dev 토글 노출)
- Test: `src/lib/entitlements.test.ts` (순수 그랜트/회수 케이스)

**Interfaces:**
- Produces: `grantedWith(ent, deckId): Entitlements` (순수), `grantDeckLocal(deckId): void`, `revokeDeckLocal(deckId): void`.

- [ ] **Step 1: Write the failing test (순수)**

`src/lib/entitlements.test.ts`에 추가:
```ts
import { grantedWith, EMPTY_ENTITLEMENTS } from "@/lib/entitlements";

describe("grantedWith", () => {
  it("덱을 추가한다(중복 없이)", () => {
    const a = grantedWith(EMPTY_ENTITLEMENTS, "wolha-biwon");
    expect(a.ownedDeckIds).toEqual(["wolha-biwon"]);
    const b = grantedWith(a, "wolha-biwon");
    expect(b.ownedDeckIds).toEqual(["wolha-biwon"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/entitlements.test.ts`
Expected: FAIL — `grantedWith` 없음.

- [ ] **Step 3: 구현**

`src/lib/entitlements.ts`:
```ts
/** 덱을 더한 새 엔타이틀먼트(순수, 멱등). */
export function grantedWith(ent: Entitlements, deckId: string): Entitlements {
  if (ent.ownedDeckIds.includes(deckId)) return ent;
  return { ...ent, ownedDeckIds: [...ent.ownedDeckIds, deckId] };
}

/** 개발용: 로컬 캐시에 덱을 지급/회수한다(서버 없이 소유 모델 검증). */
export function grantDeckLocal(deckId: string): void {
  setLocalEntitlements(grantedWith(loadEntitlements(), deckId));
}
export function revokeDeckLocal(deckId: string): void {
  const cur = loadEntitlements();
  setLocalEntitlements({
    ...cur,
    ownedDeckIds: cur.ownedDeckIds.filter((id) => id !== deckId),
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/entitlements.test.ts`
Expected: PASS.

- [ ] **Step 5: dev 토글 노출**

`src/app/collection/page.tsx` 하단(덱 목록 아래)에 개발 빌드 전용 토글을 추가한다. `isDevTools`는 `@/lib/dev-reset`에서 가져온다:
```tsx
// import 추가: import { isDevTools } from "@/lib/dev-reset";
//             import { grantDeckLocal, revokeDeckLocal, ownsDeck } from "@/lib/entitlements";
// 목록 렌더 뒤:
{isDevTools ? (
  <div className="mt-6 flex flex-wrap gap-2">
    {["wolha-biwon", "k-pop-museverse"].map((id) => (
      <button
        key={id}
        type="button"
        onClick={() => (ownsDeck(id, ent) ? revokeDeckLocal(id) : grantDeckLocal(id))}
        className="text-[12px] text-muted underline underline-offset-4 hover:text-cream"
      >
        [개발] {id} {ownsDeck(id, ent) ? "회수" : "지급"}
      </button>
    ))}
  </div>
) : null}
```

- [ ] **Step 6: 검증 + 브라우저**

Run: `npx tsc --noEmit && npm test` → 클린/PASS.
브라우저: 컬렉션에서 `[개발] wolha-biwon 지급` 클릭 → 그 덱이 즉시 `78 / 78`이 되고 도감이 전 카드 아트로 바뀐다. 다시 클릭(회수) → `0 / 78`·뒷면으로 복귀. (소유 모델 E2E 시연.)

- [ ] **Step 7: Commit**

```bash
git add src/lib/entitlements.ts src/lib/entitlements.test.ts src/app/collection/page.tsx
git commit -m "Add a dev toggle to grant premium decks locally"
```

---

### Task 7: 스키마 — entitlements 테이블 + profiles.ad_free

**의도:** `0001` 마이그레이션은 아직 적용 전이므로 여기에 덧붙인다(마이그레이션 하나 유지). 라이브 전에 확정해야 하는 스키마.

**Files:**
- Modify: `supabase/migrations/0001_p1_foundation.sql`

- [ ] **Step 1: profiles에 ad_free**

`profiles` 테이블 정의의 `selected_deck_id` 줄 아래에 컬럼을 추가한다:
```sql
  selected_deck_id text not null default 'classic',
  ad_free boolean not null default false
```
(끝 컬럼의 콤마 정리 주의 — `ad_free`가 마지막이면 콤마 없이.)

- [ ] **Step 2: entitlements 테이블 + RLS**

`journal_entries` 테이블 정의 뒤(RLS 블록 앞)에 추가:
```sql
create table if not exists public.entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id text not null, -- 소유한 프리미엄 덱. 클래식은 행 없이 암묵 소유.
  granted_at timestamptz not null default now(),
  source text not null default 'grant', -- 지급 출처. 실결제 붙으면 'purchase'|<pg>.
  primary key (user_id, deck_id)
);
```

- [ ] **Step 3: RLS 정책**

RLS 활성화·정책 블록에 두 줄 추가:
```sql
alter table public.entitlements enable row level security;
```
```sql
create policy "own entitlements" on public.entitlements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

- [ ] **Step 4: 검증**

Run: `grep -n "entitlements\|ad_free" supabase/migrations/0001_p1_foundation.sql` → 테이블·RLS·정책·컬럼이 모두 있는지 눈으로 확인. SQL 문법은 실행 없이 육안 점검(Supabase 미설정).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0001_p1_foundation.sql
git commit -m "Add the entitlements table and ad_free column"
```

---

### Task 8: 서버 브리지 (pull + 지급) — 검증은 Supabase 설정 후

**의도:** 로그인 시 서버 엔타이틀먼트를 로컬로 pull하고, 지급을 서버에 쓰는 얇은 계층. **Supabase 미설정이라 서버 왕복은 지금 검증 불가** — P1.1과 같이 코드만 넣고 수동 검증 체크리스트로 미룬다. 엔타이틀먼트는 **서버 권위**라 클라가 밀어 올리지 않는다(pull 전용 + 지급 쓰기만).

**Files:**
- Create: `src/lib/sync/entitlements-remote.ts`
- Modify: `src/components/SyncBridge.tsx` (로그인 시 pull 호출)
- Modify: `src/lib/auth/session.ts` (로그아웃 시 `clearLocalEntitlements`)

**Interfaces:**
- Consumes: `getBrowserSupabase` from `@/lib/supabase/client`; `setLocalEntitlements`, `loadEntitlements`, `grantedWith` from `@/lib/entitlements`.
- Produces: `pullRemoteEntitlements(): Promise<void>`, `grantDeck(deckId: string): Promise<void>`.

- [ ] **Step 1: 서버 계층 구현**

`src/lib/sync/entitlements-remote.ts`:
```ts
import { getBrowserSupabase } from "@/lib/supabase/client";
import {
  loadEntitlements,
  setLocalEntitlements,
  grantedWith,
} from "@/lib/entitlements";

/** 서버의 엔타이틀먼트 + profiles.ad_free를 로컬 캐시에 반영한다.
 *  미설정·비로그인·실패면 로컬을 그대로 둔다(서버가 권위지만 오프라인 표시 유지). */
export async function pullRemoteEntitlements(): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase) return;
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;

  const [ent, prof] = await Promise.all([
    supabase.from("entitlements").select("deck_id").eq("user_id", uid),
    supabase.from("profiles").select("ad_free").eq("id", uid).single(),
  ]);
  if (ent.error) return; // 실패 시 로컬 유지
  const ownedDeckIds = (ent.data ?? []).map((r) => r.deck_id as string);
  const adFree = prof.data?.ad_free === true;
  setLocalEntitlements({ ownedDeckIds, adFree });
}

/** 덱 지급을 서버에 쓰고 로컬을 낙관적으로 갱신한다. 나중에 결제 웹훅이 같은
 *  upsert를 호출한다(스키마 불변). 미설정이면 no-op. */
export async function grantDeck(deckId: string): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase) return;
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;
  const { error } = await supabase
    .from("entitlements")
    .upsert({ user_id: uid, deck_id: deckId }, { onConflict: "user_id,deck_id" });
  if (!error) setLocalEntitlements(grantedWith(loadEntitlements(), deckId));
}
```

- [ ] **Step 2: 로그인 시 pull 배선**

`src/components/SyncBridge.tsx`에서 기존 로그인/세션 진입 시 collection·journal을 pull하는 자리 근처에 `pullRemoteEntitlements()`도 호출한다(같은 effect·같은 조건). import 추가. (기존 pull 호출 패턴을 그대로 따른다.)

- [ ] **Step 3: 로그아웃 시 캐시 정리**

`src/lib/auth/session.ts`의 `signOutAndClear`에서 `clearLocalStore(); clearLocalJournal();` 옆에 `clearLocalEntitlements();`를 추가하고, `@/lib/entitlements`에서 import한다.

- [ ] **Step 4: 검증(코드 레벨)**

Run: `npx tsc --noEmit && npm test`
Expected: tsc 클린, 테스트 PASS. (서버 왕복은 실행하지 않는다 — Supabase 미설정.)

- [ ] **Step 5: 수동 검증 체크리스트 기록**

이 플랜 맨 끝 "## Supabase 설정 후 수동 검증"에 항목이 있다(아래). Supabase 설정(하위 프로젝트 4) 완료 시 돌린다.

- [ ] **Step 6: Commit**

```bash
git add src/lib/sync/entitlements-remote.ts src/components/SyncBridge.tsx src/lib/auth/session.ts
git commit -m "Bridge entitlements to the server, pull-only"
```

---

## Supabase 설정 후 수동 검증 (하위 프로젝트 4에서 실행)

- [ ] 로그인하면 서버의 소유 덱이 로컬에 반영돼 도감이 78/78로 열린다.
- [ ] `grantDeck("wolha-biwon")` 후 서버 `entitlements`에 행이 생기고 도감이 78/78이 된다.
- [ ] 로그아웃하면 로컬 엔타이틀먼트 캐시가 비워져 프리미엄이 다시 잠긴다.
- [ ] 두 계정으로 각각 로그인해도 엔타이틀먼트가 섞이지 않는다(RLS).
- [ ] `profiles.ad_free`가 로컬 `adFree`로 정확히 반영된다.

## 자체 리뷰 메모 (작성자)

- 스펙 §3(스키마)=Task 7, §4(소유 로직)=Task 1·5, §4.1(만남 개명)=Task 3, §5(함께한 날)=Task 2·5, §6(지급)=Task 6·8, §7(동기화)=Task 8, §8(테스트)=Task 1·2·4·6. 커버 완료.
- 타입 일관성: `collectedCount(deckId, ent)`가 Task 1·5에서 동일 시그니처. `recomputeEncounters`가 Task 3 이후 전역 통일.
- 커밋 초록: 옛 `collectedCount` 제거(Task 5 Step 1)와 호출부 이전(Step 2-6)이 한 커밋 안에 묶여, 커밋 경계에서만 초록을 보장.
