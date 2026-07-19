# P0-a 데이터 레이어 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 아르카나의 클라이언트 데이터 레이어를 IA v1에 맞춰 재구성한다 — 덱별 도감, 데이터 기반 리딩 유형, 케이던스/슬롯 상태. 서버 없이 순수 유닛테스트로 검증한다.

**Architecture:** 순수 함수 중심. localStorage 부작용 래퍼(`loadStore`/`saveStore`/`recordReading`)와, 그 안에서 쓰이는 순수 로직(마이그레이션·기록 빌더·케이던스 판정)을 분리한다. 순수 함수만 Vitest로 테스트하고, 부작용 래퍼는 순수 코어를 조립만 한다. 날짜/주기 계산과 리딩 유형 테이블은 독립 모듈로 뺀다.

**Tech Stack:** TypeScript, Vitest(신규 도입), Next.js 15 / React 19(기존).

## Global Constraints

- 스펙: `docs/superpowers/specs/2026-07-19-arcana-ia-design.md` (본 계획은 그 P0의 데이터 레이어 부분).
- 용어(D8): **덱**(상품 단위) / **도감**(덱별 수집 진행). 도감은 **덱별로 분리**(D9) — `collection`은 `deckId → slug → entry` 2단 구조.
- 케이던스(D11·D14): 오늘의 타로 = **질문 카테고리당 1회/일**, 과거·현재·미래 = **1회/주(ISO 주차)**.
- 슬롯(D15): 오늘의 타로 하루 총 슬롯 = 무료 **1** / `ad_free` **3**. **P0-a는 엔타이틀먼트 미구현 → 기본 1**로 두되, `maxDailySlots` 파라미터로 확장 가능하게 설계.
- 리딩 유형 값(D)은 `ONE_CARD` / `THREE_CARD_PPF`. 기존 코드가 쓰는 `SpreadType`(`"one"|"three"`)은 유지하고, 유형 테이블의 키로 사용(대규모 리네임 회피).
- 기존 `SpreadType`을 import하는 소비자(`ReadingChoice.tsx`, `reading/focus/page.tsx` 등)는 계속 `@/lib/store`에서 가져올 수 있어야 한다(재export 유지).
- 앱 런타임 코드이므로 `new Date()`·`crypto.randomUUID()` 사용 가능(워크플로 스크립트 제약과 무관).
- DRY, YAGNI, TDD, 잦은 커밋. 테스트는 순수 함수에 고정 날짜를 주입해 결정론적으로.

## File Structure

- Create `vitest.config.ts` — Vitest 설정 + `@` 별칭.
- Create `src/lib/period.ts` — `localDateOf`, `isoWeekOf`. (+ `src/lib/period.test.ts`)
- Create `src/data/reading-types.ts` — `SpreadType`, `ReadingTypeId`, `ReadingType`, `READING_TYPES`, `readingTypeOf`. (+ test)
- Modify `src/lib/store.ts` — v2 타입 + `migrateStore` + 순수 기록 빌더 + 케이던스 판정 + `recordReading` v2 + `collectedCountForDeck`. `SpreadType`은 reading-types에서 재export. (+ `src/lib/store.test.ts`)
- Modify `package.json` — `vitest` devDependency + `test` 스크립트.

> `useArcanaStore`/`useSelectedDeck`/`recordReading`의 **호출부 UI 변경은 P0-b·P0-c 계획에서** 다룬다. 본 계획은 데이터 레이어 시그니처 확장까지만 하고, 기존 UI가 깨지지 않도록 **하위호환 재export와 기본 인자**를 유지한다.

---

### Task 1: Vitest 도입 + 날짜/주기 유틸

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/period.ts`
- Test: `src/lib/period.test.ts`
- Modify: `package.json` (devDependency + scripts)

**Interfaces:**
- Produces:
  - `localDateOf(d: Date): string` → 로컬 기준 `"YYYY-MM-DD"`.
  - `isoWeekOf(d: Date): string` → ISO 주차 `"YYYY-Www"` (주-연도 기준).

- [ ] **Step 1: Vitest 설치**

Run:
```bash
npm install -D vitest@^2
```
Expected: `vitest`가 devDependencies에 추가됨.

- [ ] **Step 2: Vitest 설정 파일 생성**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

- [ ] **Step 3: package.json 스크립트 추가**

Modify `package.json` `scripts`에 추가:
```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 4: 실패하는 테스트 작성**

Create `src/lib/period.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { isoWeekOf, localDateOf } from "@/lib/period";

describe("localDateOf", () => {
  it("로컬 연-월-일을 0패딩해서 YYYY-MM-DD로 만든다", () => {
    expect(localDateOf(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(localDateOf(new Date(2026, 6, 19))).toBe("2026-07-19");
  });
});

describe("isoWeekOf", () => {
  it("일요일도 그 주의 ISO 주차로 넣는다 (2026-07-19 → 2026-W29)", () => {
    expect(isoWeekOf(new Date(2026, 6, 19))).toBe("2026-W29");
  });

  it("연초 주차를 주-연도 기준으로 계산한다 (2026-01-01 → 2026-W01)", () => {
    expect(isoWeekOf(new Date(2026, 0, 1))).toBe("2026-W01");
  });
});
```

- [ ] **Step 5: 실패 확인**

Run: `npm run test -- src/lib/period.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/period"` (파일 없음).

- [ ] **Step 6: 구현**

Create `src/lib/period.ts`:
```ts
/** 로컬 타임존 기준 "YYYY-MM-DD". */
export function localDateOf(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** ISO-8601 주차 "YYYY-Www" (주-연도 기준, 로컬 타임존). */
export function isoWeekOf(d: Date): string {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayNum = (date.getDay() + 6) % 7; // 월=0 … 일=6
  date.setDate(date.getDate() - dayNum + 3); // 그 주의 목요일
  const isoYear = date.getFullYear();
  const firstThursday = new Date(isoYear, 0, 4);
  const firstDayNum = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNum + 3);
  const week =
    1 + Math.round((date.getTime() - firstThursday.getTime()) / 604800000);
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}
```

- [ ] **Step 7: 통과 확인**

Run: `npm run test -- src/lib/period.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 8: 커밋**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/period.ts src/lib/period.test.ts
git commit -m "Add Vitest and local date / ISO week helpers"
```

---

### Task 2: 리딩 유형 테이블

**Files:**
- Create: `src/data/reading-types.ts`
- Test: `src/data/reading-types.test.ts`

**Interfaces:**
- Consumes: 없음.
- Produces:
  - `type SpreadType = "one" | "three"` (이제 여기서 정의; store가 재export).
  - `type ReadingTypeId = "ONE_CARD" | "THREE_CARD_PPF"`.
  - `type ReadingType = { id: ReadingTypeId; spread: SpreadType; count: number; positions: string[]; cadenceUnit: "day" | "week" }`.
  - `READING_TYPES: Record<SpreadType, ReadingType>`.
  - `readingTypeOf(spread: SpreadType): ReadingType`.

- [ ] **Step 1: 실패하는 테스트 작성**

Create `src/data/reading-types.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { readingTypeOf } from "@/data/reading-types";

describe("readingTypeOf", () => {
  it("오늘의 타로: 1장, 일 케이던스", () => {
    const t = readingTypeOf("one");
    expect(t.id).toBe("ONE_CARD");
    expect(t.count).toBe(1);
    expect(t.cadenceUnit).toBe("day");
    expect(t.positions).toEqual(["today"]);
  });

  it("과거·현재·미래: 3장, 주 케이던스, 포지션 순서 고정", () => {
    const t = readingTypeOf("three");
    expect(t.id).toBe("THREE_CARD_PPF");
    expect(t.count).toBe(3);
    expect(t.cadenceUnit).toBe("week");
    expect(t.positions).toEqual(["past", "present", "future"]);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- src/data/reading-types.test.ts`
Expected: FAIL — `Failed to resolve import "@/data/reading-types"`.

- [ ] **Step 3: 구현**

Create `src/data/reading-types.ts`:
```ts
export type SpreadType = "one" | "three";

export type ReadingTypeId = "ONE_CARD" | "THREE_CARD_PPF";

export type ReadingType = {
  id: ReadingTypeId;
  spread: SpreadType;
  /** 뽑는 카드 수. */
  count: number;
  /** 포지션 의미(순서 고정). */
  positions: string[];
  /** 케이던스 단위: 일 1회 / 주 1회. */
  cadenceUnit: "day" | "week";
};

export const READING_TYPES: Record<SpreadType, ReadingType> = {
  one: {
    id: "ONE_CARD",
    spread: "one",
    count: 1,
    positions: ["today"],
    cadenceUnit: "day",
  },
  three: {
    id: "THREE_CARD_PPF",
    spread: "three",
    count: 3,
    positions: ["past", "present", "future"],
    cadenceUnit: "week",
  },
};

export function readingTypeOf(spread: SpreadType): ReadingType {
  return READING_TYPES[spread];
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test -- src/data/reading-types.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: 커밋**

```bash
git add src/data/reading-types.ts src/data/reading-types.test.ts
git commit -m "Add data-driven reading type table (ONE_CARD, THREE_CARD_PPF)"
```

---

### Task 3: store v2 타입 + 마이그레이션

**Files:**
- Modify: `src/lib/store.ts`
- Test: `src/lib/store.test.ts`

**Interfaces:**
- Consumes: `readingTypeOf`, `SpreadType` (Task 2); `localDateOf`, `isoWeekOf` (Task 1); `DEFAULT_DECK_ID` (`@/data/decks`).
- Produces:
  - `type Orientation = "upright" | "reversed"`.
  - `type CollectionEntry = { firstAt: string; count: number }` (유지).
  - `type ReadingRecord = { id: string; at: string; localDate: string; isoWeek: string; spread: SpreadType; typeId: ReadingTypeId; category: string; deckId: string; cards: string[]; orientations: Orientation[] }`.
  - `type ArcanaStore = { version: 2; collection: Record<string, Record<string, CollectionEntry>>; readings: ReadingRecord[] }`.
  - `emptyStore(): ArcanaStore`.
  - `migrateStore(raw: unknown): ArcanaStore` — v2 그대로, v1 승격, 그 외 empty.
  - 재export: `export type { SpreadType }`.

- [ ] **Step 1: 실패하는 테스트 작성**

Create `src/lib/store.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { migrateStore, type ArcanaStore } from "@/lib/store";

describe("migrateStore", () => {
  it("v1 평면 collection을 classic 덱 아래로 승격한다", () => {
    const v1 = {
      version: 1,
      collection: { thefool: { firstAt: "2026-01-01T00:00:00.000Z", count: 2 } },
      readings: [
        { at: "2026-07-19T05:00:00.000Z", spread: "one", focus: "love", cards: ["thefool"] },
      ],
    };
    const s = migrateStore(v1);
    expect(s.version).toBe(2);
    expect(s.collection.classic.thefool.count).toBe(2);
    expect(s.readings[0].deckId).toBe("classic");
    expect(s.readings[0].typeId).toBe("ONE_CARD");
    expect(s.readings[0].category).toBe("love");
    expect(s.readings[0].localDate).toBe("2026-07-19");
    expect(s.readings[0].orientations).toEqual([]);
    expect(typeof s.readings[0].id).toBe("string");
  });

  it("v2는 그대로 통과시킨다", () => {
    const v2: ArcanaStore = {
      version: 2,
      collection: { classic: {} },
      readings: [],
    };
    expect(migrateStore(v2)).toEqual(v2);
  });

  it("알 수 없는 값은 빈 스토어로 만든다", () => {
    expect(migrateStore(null)).toEqual({ version: 2, collection: {}, readings: [] });
    expect(migrateStore({ version: 9 })).toEqual({ version: 2, collection: {}, readings: [] });
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- src/lib/store.test.ts`
Expected: FAIL — `migrateStore`가 export되지 않음.

- [ ] **Step 3: store.ts 상단 타입/마이그레이션 교체**

`src/lib/store.ts`에서 기존 타입 블록(현재 5~28행, `SpreadType`~`emptyStore`)과 `loadStore`를 아래로 교체한다. 상단 import에 신규 의존을 추가:

```ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_DECK_ID } from "@/data/decks";
import { localDateOf, isoWeekOf } from "@/lib/period";
import {
  readingTypeOf,
  type ReadingTypeId,
  type SpreadType,
} from "@/data/reading-types";

export type { SpreadType };

export type Orientation = "upright" | "reversed";

export type CollectionEntry = { firstAt: string; count: number };

export type ReadingRecord = {
  id: string;
  at: string; // ISO
  localDate: string; // YYYY-MM-DD (로컬)
  isoWeek: string; // YYYY-Www
  spread: SpreadType;
  typeId: ReadingTypeId;
  category: string; // focus id
  deckId: string;
  cards: string[];
  orientations: Orientation[];
};

/** deckId -> slug -> entry (덱별 도감, D9). */
export type ArcanaStore = {
  version: 2;
  collection: Record<string, Record<string, CollectionEntry>>;
  readings: ReadingRecord[];
};

const STORE_KEY = "arcana.v1"; // 저장 키는 유지, 내부 version 필드로 마이그레이션 판별
const SPREAD_KEY = "arcana.reading.spread";
const FOCUS_KEY = "arcana.reading.focus";

export function emptyStore(): ArcanaStore {
  return { version: 2, collection: {}, readings: [] };
}

function migrateReading(rec: unknown, i: number): ReadingRecord {
  const r = (rec ?? {}) as Record<string, unknown>;
  const at = typeof r.at === "string" ? r.at : new Date(0).toISOString();
  const d = new Date(at);
  const spread: SpreadType = r.spread === "three" ? "three" : "one";
  return {
    id: `${at}-${i}`,
    at,
    localDate: localDateOf(d),
    isoWeek: isoWeekOf(d),
    spread,
    typeId: readingTypeOf(spread).id,
    category: typeof r.focus === "string" ? r.focus : "day",
    deckId: DEFAULT_DECK_ID,
    cards: Array.isArray(r.cards) ? (r.cards as string[]) : [],
    orientations: [],
  };
}

/** 저장된 임의 값을 현재(v2) 스토어로 정규화한다. */
export function migrateStore(raw: unknown): ArcanaStore {
  if (!raw || typeof raw !== "object") return emptyStore();
  const r = raw as Record<string, unknown>;
  const readings = Array.isArray(r.readings) ? r.readings : null;
  const collection =
    r.collection && typeof r.collection === "object" ? r.collection : null;

  if (r.version === 2 && collection && readings) {
    return raw as ArcanaStore;
  }
  if (r.version === 1 && collection && readings) {
    return {
      version: 2,
      collection: {
        [DEFAULT_DECK_ID]: collection as Record<string, CollectionEntry>,
      },
      readings: readings.map((rec, i) => migrateReading(rec, i)),
    };
  }
  return emptyStore();
}

export function loadStore(): ArcanaStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    return migrateStore(JSON.parse(raw));
  } catch {
    return emptyStore();
  }
}
```

> 이후 Task 4·5에서 나머지(`saveStore`, `recordReading`, `collectedCount`, 훅들, 세션 헬퍼)를 이어서 손본다. 이 단계 커밋 시점에는 `recordReading`/`collectedCount`가 아직 구(舊) 시그니처라 **타입 에러가 날 수 있으므로**, 아래 Step 4에서 그 두 함수의 본문을 임시로 v2에 맞춰 최소 수정한다.

- [ ] **Step 4: 하위 함수 최소 수정(컴파일 통과용)**

같은 파일에서 기존 `recordReading`과 `collectedCount`를 임시로 v2 형태에 맞춘다(정식 구현은 Task 5). 기존 `saveStore`는 유지:

```ts
export function collectedCount(store: ArcanaStore, deckId: string): number {
  return Object.keys(store.collection[deckId] ?? {}).length;
}
```
그리고 기존 `recordReading` 본문에서 `store.collection[slug]`를 참조하던 부분은 Task 5에서 교체하므로, **이 단계에서는 `recordReading` 함수 전체를 아래 스텁으로 임시 대체**한다:
```ts
export function recordReading(): ArcanaStore {
  // 정식 구현은 Task 5. 이 스텁은 컴파일만 통과시킨다.
  return loadStore();
}
```

- [ ] **Step 5: 통과 확인**

Run: `npm run test -- src/lib/store.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: 커밋**

```bash
git add src/lib/store.ts src/lib/store.test.ts
git commit -m "Migrate store to v2: per-deck collection and enriched reading records"
```

---

### Task 4: 케이던스 / 슬롯 상태

**Files:**
- Modify: `src/lib/store.ts`
- Test: `src/lib/store.test.ts` (케이스 추가)

**Interfaces:**
- Consumes: `readingTypeOf` (Task 2); `localDateOf`, `isoWeekOf` (Task 1); `ArcanaStore`, `ReadingRecord` (Task 3).
- Produces:
  - `type SlotState = { state: "available" | "completed" | "exhausted"; readingId?: string }`.
  - `findReadingFor(store, spread, category, d): ReadingRecord | undefined`.
  - `dailySlotsUsed(store, spread, d): number` — 그날 소비한 서로 다른 카테고리 수.
  - `slotState(store, spread, category, d, maxDailySlots?: number): SlotState` (기본 `maxDailySlots = 1`).

- [ ] **Step 1: 실패하는 테스트 작성 (store.test.ts에 append)**

`src/lib/store.test.ts`에 추가:
```ts
import {
  slotState,
  type ArcanaStore as Store,
} from "@/lib/store";

function reading(over: Partial<import("@/lib/store").ReadingRecord>): import("@/lib/store").ReadingRecord {
  return {
    id: "r1",
    at: "2026-07-19T05:00:00.000Z",
    localDate: "2026-07-19",
    isoWeek: "2026-W29",
    spread: "one",
    typeId: "ONE_CARD",
    category: "love",
    deckId: "classic",
    cards: ["thefool"],
    orientations: ["upright"],
    ...over,
  };
}

describe("slotState — 오늘의 타로 (카테고리별 일 1회, 기본 1슬롯)", () => {
  const day = new Date(2026, 6, 19);

  it("기록 없으면 available", () => {
    const s: Store = { version: 2, collection: {}, readings: [] };
    expect(slotState(s, "one", "love", day)).toEqual({ state: "available" });
  });

  it("같은 카테고리를 오늘 뽑았으면 completed + readingId", () => {
    const s: Store = { version: 2, collection: {}, readings: [reading({ id: "R1" })] };
    expect(slotState(s, "one", "love", day)).toEqual({
      state: "completed",
      readingId: "R1",
    });
  });

  it("다른 카테고리인데 슬롯(1) 소진이면 exhausted", () => {
    const s: Store = { version: 2, collection: {}, readings: [reading({ category: "love" })] };
    expect(slotState(s, "one", "work", day)).toEqual({ state: "exhausted" });
  });

  it("maxDailySlots=3이면 다른 카테고리는 아직 available", () => {
    const s: Store = { version: 2, collection: {}, readings: [reading({ category: "love" })] };
    expect(slotState(s, "one", "work", day, 3)).toEqual({ state: "available" });
  });
});

describe("slotState — 과거·현재·미래 (주 1회, 카테고리 무관)", () => {
  const day = new Date(2026, 6, 19); // 2026-W29

  it("이번 주 PPF 기록 있으면 카테고리와 무관하게 completed", () => {
    const ppf = reading({ id: "W1", spread: "three", typeId: "THREE_CARD_PPF", category: "self" });
    const s: Store = { version: 2, collection: {}, readings: [ppf] };
    expect(slotState(s, "three", "love", day)).toEqual({
      state: "completed",
      readingId: "W1",
    });
  });

  it("이번 주 PPF 기록 없으면 available", () => {
    const lastWeek = reading({ spread: "three", typeId: "THREE_CARD_PPF", isoWeek: "2026-W28" });
    const s: Store = { version: 2, collection: {}, readings: [lastWeek] };
    expect(slotState(s, "three", "love", day)).toEqual({ state: "available" });
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- src/lib/store.test.ts`
Expected: FAIL — `slotState`가 export되지 않음.

- [ ] **Step 3: 구현 (store.ts에 추가)**

`src/lib/store.ts`에 추가(마이그레이션 블록 다음, `recordReading` 근처):
```ts
export type SlotState = {
  state: "available" | "completed" | "exhausted";
  readingId?: string;
};

/** 현재 주기에서 (유형, 카테고리)에 해당하는 이미 완료된 리딩을 찾는다. */
export function findReadingFor(
  store: ArcanaStore,
  spread: SpreadType,
  category: string,
  d: Date,
): ReadingRecord | undefined {
  const type = readingTypeOf(spread);
  if (type.cadenceUnit === "week") {
    const wk = isoWeekOf(d);
    return store.readings.find((r) => r.typeId === type.id && r.isoWeek === wk);
  }
  const day = localDateOf(d);
  return store.readings.find(
    (r) => r.typeId === type.id && r.localDate === day && r.category === category,
  );
}

/** 오늘 이 유형으로 소비한 서로 다른 카테고리 수(=슬롯 소비). */
export function dailySlotsUsed(
  store: ArcanaStore,
  spread: SpreadType,
  d: Date,
): number {
  const type = readingTypeOf(spread);
  const day = localDateOf(d);
  const cats = new Set(
    store.readings
      .filter((r) => r.typeId === type.id && r.localDate === day)
      .map((r) => r.category),
  );
  return cats.size;
}

/**
 * (유형, 카테고리)의 현재 상태.
 * - completed: 이번 주기에 이미 뽑음 → readingId로 결과 이동
 * - exhausted: 오늘 슬롯 소진(일 케이던스 한정)
 * - available: 뽑기 가능
 * maxDailySlots 기본 1(무료). ad_free는 3(D15) — P0-a 이후 주입.
 */
export function slotState(
  store: ArcanaStore,
  spread: SpreadType,
  category: string,
  d: Date,
  maxDailySlots = 1,
): SlotState {
  const existing = findReadingFor(store, spread, category, d);
  if (existing) return { state: "completed", readingId: existing.id };
  const type = readingTypeOf(spread);
  if (type.cadenceUnit === "day" && dailySlotsUsed(store, spread, d) >= maxDailySlots) {
    return { state: "exhausted" };
  }
  return { state: "available" };
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test -- src/lib/store.test.ts`
Expected: PASS (기존 4 + 신규 6 = 10 tests).

- [ ] **Step 5: 커밋**

```bash
git add src/lib/store.ts src/lib/store.test.ts
git commit -m "Add cadence slot-state logic (per-category daily, weekly PPF)"
```

---

### Task 5: 리딩 기록 v2 (기록 빌더 + recordReading) + 덱별 수집 카운트

**Files:**
- Modify: `src/lib/store.ts`
- Test: `src/lib/store.test.ts` (케이스 추가)

**Interfaces:**
- Consumes: `ArcanaStore`, `ReadingRecord`, `Orientation`, `SpreadType`, `readingTypeOf`, `localDateOf`, `isoWeekOf` (앞 태스크들).
- Produces:
  - `newReadingRecord(input): ReadingRecord` — 순수 빌더. `input = { id: string; at: Date; spread: SpreadType; category: string; deckId: string; cards: string[]; orientations: Orientation[] }`.
  - `withReadingRecorded(store: ArcanaStore, record: ReadingRecord): ArcanaStore` — 순수. 해당 덱 도감 카운트 증가 + 리딩 append.
  - `recordReading(input): ArcanaStore` — 부작용 래퍼(load → build → save). id는 `crypto.randomUUID()`, at는 `new Date()`.
  - `collectedCount(store, deckId): number` (Task 3에서 임시 도입한 것을 정식 유지).

- [ ] **Step 1: 실패하는 테스트 작성 (store.test.ts에 append)**

```ts
import { newReadingRecord, withReadingRecorded, collectedCount } from "@/lib/store";

describe("newReadingRecord", () => {
  it("at·spread로 파생 필드를 채운다", () => {
    const rec = newReadingRecord({
      id: "R1",
      at: new Date(2026, 6, 19, 14, 0, 0),
      spread: "three",
      category: "love",
      deckId: "wolha-biwon",
      cards: ["thefool", "themoon", "thestar"],
      orientations: ["upright", "reversed", "upright"],
    });
    expect(rec.localDate).toBe("2026-07-19");
    expect(rec.isoWeek).toBe("2026-W29");
    expect(rec.typeId).toBe("THREE_CARD_PPF");
    expect(rec.deckId).toBe("wolha-biwon");
    expect(rec.cards).toHaveLength(3);
  });
});

describe("withReadingRecorded", () => {
  it("해당 덱의 도감만 채우고 리딩을 append한다", () => {
    const store = { version: 2 as const, collection: {}, readings: [] };
    const rec = newReadingRecord({
      id: "R1",
      at: new Date(2026, 6, 19),
      spread: "one",
      category: "day",
      deckId: "wolha-biwon",
      cards: ["thefool"],
      orientations: ["upright"],
    });
    const next = withReadingRecorded(store, rec);
    expect(collectedCount(next, "wolha-biwon")).toBe(1);
    expect(collectedCount(next, "classic")).toBe(0);
    expect(next.readings).toHaveLength(1);
    expect(next.collection["wolha-biwon"].thefool.count).toBe(1);
  });

  it("같은 카드를 다시 만나면 count만 증가하고 firstAt은 유지한다", () => {
    let store = { version: 2 as const, collection: {}, readings: [] };
    const base = {
      id: "R1",
      at: new Date(2026, 6, 19),
      spread: "one" as const,
      category: "day",
      deckId: "classic",
      cards: ["thefool"],
      orientations: ["upright" as const],
    };
    store = withReadingRecorded(store, newReadingRecord(base));
    const firstAt = store.collection.classic.thefool.firstAt;
    store = withReadingRecorded(store, newReadingRecord({ ...base, id: "R2" }));
    expect(store.collection.classic.thefool.count).toBe(2);
    expect(store.collection.classic.thefool.firstAt).toBe(firstAt);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- src/lib/store.test.ts`
Expected: FAIL — `newReadingRecord`/`withReadingRecorded` 미export.

- [ ] **Step 3: 구현 (store.ts의 임시 스텁을 정식 구현으로 교체)**

Task 3에서 넣은 `recordReading` 스텁을 아래 전체로 교체:
```ts
export type NewReadingInput = {
  id: string;
  at: Date;
  spread: SpreadType;
  category: string;
  deckId: string;
  cards: string[];
  orientations: Orientation[];
};

/** 파생 필드를 채운 리딩 레코드를 만든다(순수). */
export function newReadingRecord(input: NewReadingInput): ReadingRecord {
  return {
    id: input.id,
    at: input.at.toISOString(),
    localDate: localDateOf(input.at),
    isoWeek: isoWeekOf(input.at),
    spread: input.spread,
    typeId: readingTypeOf(input.spread).id,
    category: input.category,
    deckId: input.deckId,
    cards: input.cards,
    orientations: input.orientations,
  };
}

/** 덱별 도감 카운트를 올리고 리딩을 추가한 새 스토어를 반환(순수). */
export function withReadingRecorded(
  store: ArcanaStore,
  record: ReadingRecord,
): ArcanaStore {
  const deck = { ...(store.collection[record.deckId] ?? {}) };
  for (const slug of record.cards) {
    const entry = deck[slug];
    deck[slug] = entry
      ? { firstAt: entry.firstAt, count: entry.count + 1 }
      : { firstAt: record.at, count: 1 };
  }
  return {
    version: 2,
    collection: { ...store.collection, [record.deckId]: deck },
    readings: [...store.readings, record],
  };
}

/** 완료된 리딩을 저장한다(부작용 래퍼). */
export function recordReading(input: {
  spread: SpreadType;
  category: string;
  deckId: string;
  cards: string[];
  orientations: Orientation[];
}): ArcanaStore {
  const record = newReadingRecord({
    id: crypto.randomUUID(),
    at: new Date(),
    ...input,
  });
  const next = withReadingRecorded(loadStore(), record);
  saveStore(next);
  return next;
}
```

> `collectedCount(store, deckId)`는 Task 3에서 정식 형태로 이미 넣었으므로 그대로 둔다.

- [ ] **Step 4: 통과 확인**

Run: `npm run test -- src/lib/store.test.ts`
Expected: PASS (10 + 3 = 13 tests).

- [ ] **Step 5: 전체 테스트 + 타입체크**

Run:
```bash
npm run test
npx tsc --noEmit
```
Expected: 모든 테스트 PASS. `tsc`는 **본 계획 범위(store/period/reading-types) 관련 신규 에러 0**. (호출부 UI인 `collection/page.tsx`·`ReadingChoice.tsx`·`reading/**`는 P0-b·c에서 새 시그니처에 맞춰 갱신하므로, 그쪽 기존 에러는 다음 계획에서 해소.)

- [ ] **Step 6: 커밋**

```bash
git add src/lib/store.ts src/lib/store.test.ts
git commit -m "Implement v2 recordReading: pure builders + per-deck collection"
```

---

## Self-Review 메모

- **스펙 커버리지:** D8(용어)·D9(덱별 도감)=`collection` 2단 구조 + `collectedCount(store,deckId)`. D11/D14(케이던스)=`slotState`/`findReadingFor`/`dailySlotsUsed`. D15(슬롯 확장)=`maxDailySlots` 파라미터(기본 1). 리딩 유형 데이터화=`reading-types.ts`. 결과 독립화에 필요한 리딩 `id`·스냅샷 필드=`ReadingRecord` 확장. **결과 화면/유형 카드 UI(§4·§6·§7의 화면)는 본 계획 범위 밖 → P0-b·P0-c.**
- **하위호환:** `SpreadType`은 store에서 재export 유지 → 기존 import 경로 불변. 저장 키 `arcana.v1` 유지 + `version` 필드로 마이그레이션.
- **알려진 후속 의존:** `recordReading` 호출부(현재 draw 페이지)와 `collectedCount`/`useArcanaStore` 소비부(현재 `collection/page.tsx`)는 시그니처가 바뀌었으므로 **P0-b·P0-c에서 갱신 필수**. 그 전까지 앱 빌드가 깨질 수 있음 — 두 계획은 연속 실행 권장.
