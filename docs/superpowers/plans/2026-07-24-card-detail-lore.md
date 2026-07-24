# 카드 상세 로어(상징·이야기·대응) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 카드 상세 화면에 상징 해부·역사 이야기·전통 대응 3개 접힘 섹션을 78장 전부에 추가한다.

**Architecture:** `src/data/lore/`에 slug 키 레코드 5파일(메이저+수트4) + 규칙 매핑(원소·수비학)을 합치는 `cardLore(slug)` 헬퍼. UI는 서버 컴포넌트 `LoreSections` 하나를 상세 페이지에 끼운다. 콘텐츠는 RWS 기준 공통 1벌, 3개 덱 동일 노출.

**Tech Stack:** Next.js(App Router, 서버 컴포넌트), TypeScript, vitest.

**스펙:** `docs/superpowers/specs/2026-07-24-card-detail-lore-design.md`

## Global Constraints

- 테스트·타입체크는 `./node_modules/.bin/vitest run` / `./node_modules/.bin/tsc --noEmit`. dev 서버가 떠 있는 동안 `npm run build` 금지.
- 톤: 겁주지 않는 성찰적 존댓말(해석 감사 기준 `docs/tarot-interpretation-audit-2026-07-23.json`과 동일한 목소리). 죽음·악마·탑 등 무서운 카드도 위협이 아니라 통과 의례로 서술.
- 소싱: 상징은 Waite, *The Pictorial Key to the Tarot*(1911, PD) 뜻만 가져와 새로 씀(문장 이식 금지). 역사에서 확인 안 되는 속설은 "~라는 이야기가 전해집니다"로 구분. 점성술은 황금새벽회 표준(각 태스크의 표를 웹서치로 교차검증 후 사용).
- 상징 서술은 아트 중립("그림 속 절벽" ✗ → "절벽 끝의 발걸음" ✓). RWS 공통 1벌이 프리미엄 덱 상세에도 그대로 노출된다.
- 각 lore 데이터 파일 상단에 `reversed.ts` 스타일의 근거 주석(출처·재작성 원칙)을 단다.
- symbols 3~5개(각 meaning 1~2문장), story 1~2문단(`\n\n` 구분).
- **톤·정확성 검수는 Opus 4.8 서브에이전트가 한다(Task 8). 메인 세션(Fable)은 검수하지 않는다 — 사용자 지정.**
- slug 키는 `src/data/cards.ts`와 동일(전수 목록은 cards.ts가 원본).

---

### Task 1: lore 스캐폴드 — 타입·규칙 매핑·헬퍼·형식 테스트

**Files:**
- Create: `src/data/lore/types.ts`
- Create: `src/data/lore/major.ts`, `src/data/lore/wands.ts`, `src/data/lore/cups.ts`, `src/data/lore/swords.ts`, `src/data/lore/pentacles.ts` (빈 레코드)
- Create: `src/data/lore/index.ts`
- Test: `src/data/lore/lore.test.ts`

**Interfaces:**
- Consumes: `cards`, `cardBySlug` (`src/data/cards.ts`)
- Produces: `CardLore`, `LoreSymbol` 타입 / `loreMajor·loreWands·loreCups·loreSwords·lorePentacles: Record<string, CardLore>` / `loreBySlug` / `cardLore(slug: string): CardLoreView | null` / `CardLoreView = { symbols: LoreSymbol[]; story: string; correspondence: { label: string; value: string }[] }`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// src/data/lore/lore.test.ts
import { describe, expect, it } from "vitest";
import { cards } from "../cards";
import { cardLore, loreBySlug } from "./index";

describe("cardLore", () => {
  it("lore가 없는 slug에 null을 돌려준다", () => {
    expect(cardLore("the-fool")).toBeNull(); // Task 2가 데이터를 채우면 이 단언을 교체한다(Task 2 Step 1 참조)
    expect(cardLore("no-such-card")).toBeNull();
  });
});
// 규칙 매핑(원소·수비학·데칸 행 조립)의 실질 검증은 데이터가 생기는
// Task 2(메이저: 점성술 행만)와 Task 3(마이너: 3행 전부)의 테스트가 맡는다.

describe("lore 형식", () => {
  it("등록된 모든 lore가 형식을 지킨다", () => {
    for (const [slug, lore] of Object.entries(loreBySlug)) {
      expect(lore.symbols.length, `${slug} symbols 수`).toBeGreaterThanOrEqual(3);
      expect(lore.symbols.length, `${slug} symbols 수`).toBeLessThanOrEqual(5);
      for (const s of lore.symbols) {
        expect(s.name.trim(), `${slug} symbol name`).not.toBe("");
        expect(s.meaning.trim(), `${slug} symbol meaning`).not.toBe("");
      }
      const paragraphs = lore.story.split("\n\n");
      expect(paragraphs.length, `${slug} story 문단 수`).toBeGreaterThanOrEqual(1);
      expect(paragraphs.length, `${slug} story 문단 수`).toBeLessThanOrEqual(2);
      expect(lore.story.trim(), `${slug} story`).not.toBe("");
      if (lore.astrology !== undefined) {
        expect(lore.astrology.trim(), `${slug} astrology`).not.toBe("");
      }
      expect(cards.some((c) => c.slug === slug), `${slug}는 실제 카드`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `./node_modules/.bin/vitest run src/data/lore/lore.test.ts`
Expected: FAIL — `./index` 모듈 없음.

- [ ] **Step 3: 최소 구현**

```ts
// src/data/lore/types.ts
/** 카드 한 장의 로어. RWS(라이더-웨이트) 도상 기준 공통 1벌 — 세 덱이 공유한다. */
export type LoreSymbol = { name: string; meaning: string };

export type CardLore = {
  /** 카드 그림 속 상징 3~5개. 서술은 아트 중립(특정 덱 그림을 지시하지 않는다). */
  symbols: LoreSymbol[];
  /** 1~2문단(\n\n). 메이저=카드 개별 이야기, 마이너=수트·숫자 흐름 속 이 카드의 자리. */
  story: string;
  /** 카드 고유 점성술 대응(황금새벽회). 메이저=행성·별자리, 마이너 2~10=데칸. 에이스·코트는 없음. */
  astrology?: string;
};
```

```ts
// src/data/lore/major.ts  (wands/cups/swords/pentacles.ts도 같은 골격의 빈 레코드로 생성)
import type { CardLore } from "./types";

// 근거: A.E. Waite, The Pictorial Key to the Tarot(1911, 퍼블릭 도메인)의 도상 서술과
// 황금새벽회 대응 체계. 문장을 그대로 옮기지 않고 뜻만 가져와 이 앱의 결로 새로 썼다.
// 확인되지 않는 역사 속설은 "~라는 이야기가 전해집니다"로 구분한다.
export const loreMajor: Record<string, CardLore> = {};
```

```ts
// src/data/lore/index.ts
import { cardBySlug } from "../cards";
import { loreCups } from "./cups";
import { loreMajor } from "./major";
import { lorePentacles } from "./pentacles";
import { loreSwords } from "./swords";
import { loreWands } from "./wands";
import type { CardLore, LoreSymbol } from "./types";

export type { CardLore, LoreSymbol } from "./types";

export const loreBySlug: Record<string, CardLore> = {
  ...loreMajor,
  ...loreWands,
  ...loreCups,
  ...loreSwords,
  ...lorePentacles,
};

const SUIT_ELEMENT = {
  wands: "불",
  cups: "물",
  swords: "공기",
  pentacles: "흙",
} as const;

/** 마이너 1~10의 수비학. 코트(11~14)와 메이저에는 표시하지 않는다. */
const NUMBER_MEANING: Record<number, string> = {
  1: "시작",
  2: "균형 · 선택",
  3: "확장 · 어울림",
  4: "안정 · 구조",
  5: "갈등 · 변화",
  6: "조화 · 회복",
  7: "성찰 · 시험",
  8: "숙련 · 움직임",
  9: "결실 · 성숙",
  10: "완성 · 전환",
};

export type CardLoreView = {
  symbols: LoreSymbol[];
  story: string;
  correspondence: { label: string; value: string }[];
};

/** 상세 화면이 쓰는 단일 진입점. lore 데이터 + 규칙 산출값(원소·수비학)을 합친다. */
export function cardLore(slug: string): CardLoreView | null {
  const lore = loreBySlug[slug];
  const card = cardBySlug.get(slug);
  if (!lore || !card) return null;

  const correspondence: { label: string; value: string }[] = [];
  if (card.suit) {
    correspondence.push({ label: "원소", value: SUIT_ELEMENT[card.suit] });
    const numerology = NUMBER_MEANING[card.number];
    if (numerology) correspondence.push({ label: "수비학", value: numerology });
  }
  if (lore.astrology) {
    correspondence.push({ label: "점성술", value: lore.astrology });
  }

  return { symbols: lore.symbols, story: lore.story, correspondence };
}
```

- [ ] **Step 4: 통과 확인**

Run: `./node_modules/.bin/vitest run src/data/lore/lore.test.ts && ./node_modules/.bin/tsc --noEmit`
Expected: PASS (형식 테스트는 빈 레코드라 공허 통과 — 콘텐츠 태스크가 채우면 실질 검증이 된다).

- [ ] **Step 5: 커밋**

```bash
git add src/data/lore/
git commit -m "Scaffold the card lore data model"
```

---

### Task 2: 메이저 아르카나 22장 콘텐츠 (`major.ts`)

**Files:**
- Modify: `src/data/lore/major.ts`
- Test: `src/data/lore/lore.test.ts` (전수 테스트 추가)

**Interfaces:**
- Consumes: `CardLore` (`./types`), Task 1의 파일 골격·근거 주석
- Produces: `loreMajor`에 메이저 22 slug 전부

**콘텐츠 지침(이 태스크의 요구사항):**
- story는 **카드 개별 이야기** — 기원(비스콘티-스포르차·마르세유), RWS에서 달라진 점, 이름·도상에 얽힌 일화 중 그 카드에서 가장 흥미로운 것 1~2가지. 웹서치로 리서치하고, 확인 안 되는 속설은 "~라는 이야기가 전해집니다"로.
- astrology는 아래 표를 웹서치로 교차검증 후 그대로 기입(황금새벽회 기준, 현대 행성은 병기):

| slug | astrology | slug | astrology |
|---|---|---|---|
| the-fool | 천왕성 · 공기 | justice | 천칭자리 |
| the-magician | 수성 | the-hanged-man | 해왕성 · 물 |
| the-high-priestess | 달 | death | 전갈자리 |
| the-empress | 금성 | temperance | 사수자리 |
| the-emperor | 양자리 | the-devil | 염소자리 |
| the-hierophant | 황소자리 | the-tower | 화성 |
| the-lovers | 쌍둥이자리 | the-star | 물병자리 |
| the-chariot | 게자리 | the-moon | 물고기자리 |
| strength | 사자자리 | the-sun | 태양 |
| the-hermit | 처녀자리 | judgement | 명왕성 · 불 |
| wheel-of-fortune | 목성 | the-world | 토성 · 흙 |

**작성 예시(the-fool — 이 완성도·분량이 22장 전부의 기준):**

```ts
"the-fool": {
  symbols: [
    { name: "절벽 끝의 발걸음", meaning: "결과를 다 알지 못한 채 내딛는 믿음의 도약을 뜻합니다. 무모함이 아니라, 아직 오지 않은 길을 향한 열린 마음입니다." },
    { name: "흰 장미", meaning: "조건 없는 순수와 때 묻지 않은 의도를 상징합니다. 계산보다 마음이 앞서는 시작의 빛깔입니다." },
    { name: "작은 봇짐", meaning: "지난 경험에서 꼭 필요한 것만 담은 가벼운 짐입니다. 과거를 버리는 게 아니라 간추려 지니고 떠난다는 뜻입니다." },
    { name: "곁을 따르는 개", meaning: "본능과 직감의 목소리입니다. 위험을 알리는 경고이자, 여정에 동행하는 충실한 벗이기도 합니다." },
  ],
  story:
    "바보는 번호가 0입니다. 순서의 처음도 끝도 아닌 이 숫자 때문에, 바보를 여정의 출발점으로 볼지 여정 전체를 걷는 주인공으로 볼지를 두고 오랜 해석이 갈려 왔습니다. 메이저 아르카나 21장을 바보가 통과하는 성장담으로 읽는 '바보의 여정'은 지금도 타로를 배우는 가장 사랑받는 틀입니다.\n\n오늘날 게임 카드의 조커가 이 카드의 후손이라는 이야기가 전해집니다. 어느 자리에도 속하지 않지만 어디에나 끼어들 수 있는 자유로움이, 수백 년을 건너 두 카드를 잇고 있는 셈입니다.",
  astrology: "천왕성 · 공기",
},
```

- [ ] **Step 1: 실패하는 전수 테스트 추가**

```ts
// src/data/lore/lore.test.ts 에 추가.
// 그리고 Task 1의 `expect(cardLore("the-fool")).toBeNull()` 단언은 삭제한다(아래가 대체).
import { loreMajor } from "./major";

describe("메이저 아르카나 lore", () => {
  it("22장 전수 존재", () => {
    const majorSlugs = cards.filter((c) => c.arcana === "major").map((c) => c.slug);
    for (const slug of majorSlugs) {
      expect(loreMajor[slug], `${slug} 누락`).toBeDefined();
    }
    expect(Object.keys(loreMajor)).toHaveLength(22);
  });
  it("메이저는 전 카드 astrology를 가진다", () => {
    for (const [slug, lore] of Object.entries(loreMajor)) {
      expect(lore.astrology, `${slug} astrology 누락`).toBeDefined();
    }
  });
  it("메이저 대응은 점성술 행만 갖는다(원소·수비학 행 없음)", () => {
    const view = cardLore("the-fool");
    expect(view).not.toBeNull();
    expect(view!.correspondence).toEqual([
      { label: "점성술", value: "천왕성 · 공기" },
    ]);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `./node_modules/.bin/vitest run src/data/lore/lore.test.ts`
Expected: FAIL — "the-fool 누락".

- [ ] **Step 3: 22장 리서치·작성** — 위 지침·예시 완성도로 `loreMajor`를 채운다. Task 1의 근거 주석은 유지.

- [ ] **Step 4: 통과 확인**

Run: `./node_modules/.bin/vitest run src/data/lore/lore.test.ts && ./node_modules/.bin/tsc --noEmit`
Expected: PASS (형식 테스트가 22장에 실질 적용됨).

- [ ] **Step 5: 커밋**

```bash
git add src/data/lore/major.ts src/data/lore/lore.test.ts
git commit -m "Add lore for the 22 major arcana"
```

---

### Task 3: 완드 14장 콘텐츠 (`wands.ts`)

**Files:**
- Modify: `src/data/lore/wands.ts`
- Test: `src/data/lore/lore.test.ts` (전수 테스트 추가)

**Interfaces:**
- Consumes: `CardLore` (`./types`)
- Produces: `loreWands`에 완드 14 slug 전부 (`ace-of-wands` ~ `king-of-wands`)

**콘텐츠 지침:**
- story는 **수트·숫자의 흐름 속 이 카드의 자리 + 고유 포인트** — 1문단은 "불의 수트가 걷는 여정에서 이 숫자가 놓인 자리", 1문단은 이 카드만의 도상 포인트나 RWS 일화. 메이저처럼 개별 역사로 쓰지 않는다(결 구분).
- 데칸 대응(2~10만, 웹서치 교차검증 후 기입): 2=화성 · 양자리, 3=태양 · 양자리, 4=금성 · 양자리, 5=토성 · 사자자리, 6=목성 · 사자자리, 7=화성 · 사자자리, 8=수성 · 사수자리, 9=달 · 사수자리, 10=토성 · 사수자리. 에이스·코트는 astrology 생략.

**작성 예시(two-of-wands — 이 완성도가 마이너 결의 기준):**

```ts
"two-of-wands": {
  symbols: [
    { name: "손안의 지구본", meaning: "이미 손에 쥔 세계와 아직 가 보지 않은 세계 사이의 저울질입니다. 성취 다음에 오는 더 큰 물음을 상징합니다." },
    { name: "성벽 위의 조망", meaning: "안전한 자리에서 먼 곳을 내다보는 시선입니다. 지금의 안정이 다음 모험의 발판이 된다는 뜻입니다." },
    { name: "두 개의 지팡이", meaning: "머무름과 떠남, 두 갈래 가능성이 나란히 서 있는 상태입니다. 선택은 아직 열려 있습니다." },
  ],
  story:
    "완드는 불의 수트 — 의지와 열망이 자라나는 여정입니다. 에이스에서 붙은 첫 불씨가 2에서 처음으로 방향을 묻습니다. 이 불을 어디로 가져갈 것인가, 완드의 이야기는 여기서 본격적으로 시작됩니다.\n\n웨이트는 이 카드에 '성취한 자의 슬픔'이라는 뜻밖의 주석을 달았습니다. 원하는 것을 손에 넣고도 창밖을 내다보는 사람 — 성공 다음날의 허전함을 이만큼 정확히 그린 카드는 드물다는 평이 전해집니다.",
  astrology: "화성 · 양자리",
},
```

- [ ] **Step 1: 실패하는 전수 테스트 추가**

```ts
// src/data/lore/lore.test.ts 에 추가
import { loreWands } from "./wands";

describe("완드 lore", () => {
  it("14장 전수 존재", () => {
    const wandSlugs = cards.filter((c) => c.suit === "wands").map((c) => c.slug);
    for (const slug of wandSlugs) {
      expect(loreWands[slug], `${slug} 누락`).toBeDefined();
    }
    expect(Object.keys(loreWands)).toHaveLength(14);
  });
  it("마이너 숫자 카드 대응은 원소·수비학·점성술 3행", () => {
    const view = cardLore("two-of-wands");
    expect(view).not.toBeNull();
    expect(view!.correspondence).toEqual([
      { label: "원소", value: "불" },
      { label: "수비학", value: "균형 · 선택" },
      { label: "점성술", value: "화성 · 양자리" },
    ]);
  });
  it("에이스는 점성술 행이 없다", () => {
    const view = cardLore("ace-of-wands");
    expect(view).not.toBeNull();
    expect(view!.correspondence).toEqual([
      { label: "원소", value: "불" },
      { label: "수비학", value: "시작" },
    ]);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `./node_modules/.bin/vitest run src/data/lore/lore.test.ts`
Expected: FAIL — "ace-of-wands 누락".

- [ ] **Step 3: 14장 리서치·작성** — 지침·예시 완성도로 `loreWands`를 채운다.

- [ ] **Step 4: 통과 확인**

Run: `./node_modules/.bin/vitest run src/data/lore/lore.test.ts && ./node_modules/.bin/tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/data/lore/wands.ts src/data/lore/lore.test.ts
git commit -m "Add lore for the wands suit"
```

---

### Task 4: 컵 14장 콘텐츠 (`cups.ts`)

**Files:** Modify `src/data/lore/cups.ts` / Test `src/data/lore/lore.test.ts`

**Interfaces:** Produces `loreCups`에 컵 14 slug (`ace-of-cups` ~ `king-of-cups`)

**콘텐츠 지침:**
- 컵은 물의 수트 — 감정과 관계의 여정. story 1문단은 그 흐름 속 자리, 1문단은 카드 고유 포인트(예: 컵 3의 축제 도상, 컵 8의 떠남). symbols·story·톤·분량 완성도는 Task 3의 two-of-wands 예시를 기준으로 한다.
- 데칸(2~10, 교차검증 후): 2=금성 · 게자리, 3=수성 · 게자리, 4=달 · 게자리, 5=화성 · 전갈자리, 6=태양 · 전갈자리, 7=금성 · 전갈자리, 8=토성 · 물고기자리, 9=목성 · 물고기자리, 10=화성 · 물고기자리. 에이스·코트는 astrology 생략.

- [ ] **Step 1: 실패하는 전수 테스트 추가**

```ts
// src/data/lore/lore.test.ts 에 추가
import { loreCups } from "./cups";

describe("컵 lore", () => {
  it("14장 전수 존재", () => {
    const cupSlugs = cards.filter((c) => c.suit === "cups").map((c) => c.slug);
    for (const slug of cupSlugs) {
      expect(loreCups[slug], `${slug} 누락`).toBeDefined();
    }
    expect(Object.keys(loreCups)).toHaveLength(14);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `./node_modules/.bin/vitest run src/data/lore/lore.test.ts`
Expected: FAIL — "ace-of-cups 누락".

- [ ] **Step 3: 14장 리서치·작성** — 지침대로 `loreCups`를 채운다.

- [ ] **Step 4: 통과 확인**

Run: `./node_modules/.bin/vitest run src/data/lore/lore.test.ts && ./node_modules/.bin/tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/data/lore/cups.ts src/data/lore/lore.test.ts
git commit -m "Add lore for the cups suit"
```

---

### Task 5: 소드 14장 콘텐츠 (`swords.ts`)

**Files:** Modify `src/data/lore/swords.ts` / Test `src/data/lore/lore.test.ts`

**Interfaces:** Produces `loreSwords`에 소드 14 slug (`ace-of-swords` ~ `king-of-swords`)

**콘텐츠 지침:**
- 소드는 공기의 수트 — 생각과 진실의 여정. 소드에는 어두운 도상이 많으니(3·9·10) 톤 규칙(위협 아님, 통과 의례)을 특히 지킨다. symbols·story·톤·분량 완성도는 Task 3의 two-of-wands 예시를 기준으로 한다.
- 데칸(2~10, 교차검증 후): 2=달 · 천칭자리, 3=토성 · 천칭자리, 4=목성 · 천칭자리, 5=금성 · 물병자리, 6=수성 · 물병자리, 7=달 · 물병자리, 8=목성 · 쌍둥이자리, 9=화성 · 쌍둥이자리, 10=태양 · 쌍둥이자리. 에이스·코트는 astrology 생략.

- [ ] **Step 1: 실패하는 전수 테스트 추가**

```ts
// src/data/lore/lore.test.ts 에 추가
import { loreSwords } from "./swords";

describe("소드 lore", () => {
  it("14장 전수 존재", () => {
    const swordSlugs = cards.filter((c) => c.suit === "swords").map((c) => c.slug);
    for (const slug of swordSlugs) {
      expect(loreSwords[slug], `${slug} 누락`).toBeDefined();
    }
    expect(Object.keys(loreSwords)).toHaveLength(14);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `./node_modules/.bin/vitest run src/data/lore/lore.test.ts`
Expected: FAIL — "ace-of-swords 누락".

- [ ] **Step 3: 14장 리서치·작성** — 지침대로 `loreSwords`를 채운다.

- [ ] **Step 4: 통과 확인**

Run: `./node_modules/.bin/vitest run src/data/lore/lore.test.ts && ./node_modules/.bin/tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/data/lore/swords.ts src/data/lore/lore.test.ts
git commit -m "Add lore for the swords suit"
```

---

### Task 6: 펜타클 14장 콘텐츠 (`pentacles.ts`)

**Files:** Modify `src/data/lore/pentacles.ts` / Test `src/data/lore/lore.test.ts`

**Interfaces:** Produces `lorePentacles`에 펜타클 14 slug (`ace-of-pentacles` ~ `king-of-pentacles`)

**콘텐츠 지침:**
- 펜타클은 흙의 수트 — 몸·일·물질의 여정. symbols·story·톤·분량 완성도는 Task 3의 two-of-wands 예시를 기준으로 한다.
- 데칸(2~10, 교차검증 후): 2=목성 · 염소자리, 3=화성 · 염소자리, 4=태양 · 염소자리, 5=수성 · 황소자리, 6=달 · 황소자리, 7=토성 · 황소자리, 8=태양 · 처녀자리, 9=금성 · 처녀자리, 10=수성 · 처녀자리. 에이스·코트는 astrology 생략.

- [ ] **Step 1: 실패하는 전수 테스트 추가** (78장 완성 단언 포함 — 이 태스크가 마지막 콘텐츠 태스크다)

```ts
// src/data/lore/lore.test.ts 에 추가
import { lorePentacles } from "./pentacles";

describe("펜타클 lore", () => {
  it("14장 전수 존재", () => {
    const pentacleSlugs = cards.filter((c) => c.suit === "pentacles").map((c) => c.slug);
    for (const slug of pentacleSlugs) {
      expect(lorePentacles[slug], `${slug} 누락`).toBeDefined();
    }
    expect(Object.keys(lorePentacles)).toHaveLength(14);
  });
  it("78장 전체가 채워졌다", () => {
    expect(Object.keys(loreBySlug)).toHaveLength(78);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `./node_modules/.bin/vitest run src/data/lore/lore.test.ts`
Expected: FAIL — "ace-of-pentacles 누락".

- [ ] **Step 3: 14장 리서치·작성** — 지침대로 `lorePentacles`를 채운다.

- [ ] **Step 4: 통과 확인**

Run: `./node_modules/.bin/vitest run src/data/lore/lore.test.ts && ./node_modules/.bin/tsc --noEmit`
Expected: PASS — 78장 완성 단언 포함.

- [ ] **Step 5: 커밋**

```bash
git add src/data/lore/pentacles.ts src/data/lore/lore.test.ts
git commit -m "Add lore for the pentacles suit"
```

---

### Task 7: `LoreSections` UI + 상세 페이지 통합

**Files:**
- Create: `src/components/LoreSections.tsx`
- Modify: `src/app/collection/[deckId]/[slug]/page.tsx` (119행 `<CollectHistory …/>` 위에 삽입)

**Interfaces:**
- Consumes: `cardLore(slug)` (`@/data/lore`), 페이지의 `card.slug`·`deck.id`
- Produces: `<LoreSections slug={string} deckId={string} />` 서버 컴포넌트

- [ ] **Step 1: 컴포넌트 작성** (데이터 정적 → 서버 컴포넌트, 클라이언트 상태 불필요)

```tsx
// src/components/LoreSections.tsx
import { cardLore } from "@/data/lore";

const SECTION_SUMMARY =
  "flex min-h-11 cursor-pointer list-none items-center justify-between py-3 font-display text-[15px] text-cream marker:content-none [&::-webkit-details-marker]:hidden";

/** 카드 상세의 접힘 3섹션(상징·이야기·대응). RWS 기준 공통이라 덱 분기는 안내 캡션뿐이다. */
export function LoreSections({ slug, deckId }: { slug: string; deckId: string }) {
  const lore = cardLore(slug);
  if (!lore) return null;

  return (
    <section className="mt-7 lg:max-w-[560px]">
      {deckId !== "classic" && (
        <p className="mb-2 text-[12.5px] leading-relaxed text-muted">
          아래 이야기는 클래식 덱(라이더-웨이트)의 그림을 기준으로 합니다. 프리미엄
          덱은 같은 카드를 저마다의 시선으로 새로 그린 것이라, 그림 속 표현은 다를
          수 있습니다.
        </p>
      )}
      <details className="border-t border-line">
        <summary className={SECTION_SUMMARY}>
          카드 속 상징들 <span aria-hidden className="text-muted">＋</span>
        </summary>
        <ul className="space-y-3 pb-5">
          {lore.symbols.map((symbol) => (
            <li key={symbol.name} className="font-serif text-[14.5px] text-body">
              <span className="text-cream">{symbol.name}</span> — {symbol.meaning}
            </li>
          ))}
        </ul>
      </details>
      <details className="border-t border-line">
        <summary className={SECTION_SUMMARY}>
          카드 이야기 <span aria-hidden className="text-muted">＋</span>
        </summary>
        <div className="space-y-3 pb-5 font-serif text-[14.5px] text-body">
          {lore.story.split("\n\n").map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </details>
      <details className="border-y border-line">
        <summary className={SECTION_SUMMARY}>
          전통 대응 <span aria-hidden className="text-muted">＋</span>
        </summary>
        <dl className="space-y-1.5 pb-5">
          {lore.correspondence.map((row) => (
            <div key={row.label} className="flex gap-3 text-[14px]">
              <dt className="w-14 flex-none text-muted">{row.label}</dt>
              <dd className="text-body">{row.value}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
```

- [ ] **Step 2: 페이지 통합** — `src/app/collection/[deckId]/[slug]/page.tsx`의 `</details>`(영어 원문)와 `<CollectHistory …/>` 사이에:

```tsx
<LoreSections slug={card.slug} deckId={deck.id} />
```

상단 import에 `import { LoreSections } from "@/components/LoreSections";` 추가.

- [ ] **Step 3: 정적 검증**

Run: `./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/vitest run`
Expected: 모두 PASS.

- [ ] **Step 4: 브라우저 검증(어드바이저)** — dev 서버에서 ① 클래식 the-fool 상세: 캡션 없음, 3섹션 접힘/펼침, 대응에 점성술만(메이저) ② 월하비원 two-of-wands 상세: 캡션 노출, 대응에 원소·수비학·점성술 3줄 ③ 에이스·코트 카드: 점성술 줄 생략 확인. 콘솔 에러 없음.

- [ ] **Step 5: 커밋**

```bash
git add src/components/LoreSections.tsx "src/app/collection/[deckId]/[slug]/page.tsx"
git commit -m "Fold the lore sections into the card detail page"
```

---

### Task 8: Opus 4.8 톤·정확성 검수 → 반영

**Files:**
- Modify: `src/data/lore/*.ts` (검수 반영)

**Interfaces:**
- Consumes: Task 2~6의 콘텐츠 전량, `docs/tarot-interpretation-audit-2026-07-23.json`
- Produces: 검수 반영된 최종 콘텐츠

- [ ] **Step 1: Opus 4.8 서브에이전트 디스패치** — **반드시 `model: "opus"`로 지정(사용자 지정 — Fable·다른 모델 검수 금지).** 프롬프트에 포함할 것:
  - 대상: `src/data/lore/{major,wands,cups,swords,pentacles}.ts` 전체 정독
  - 기준 ① 톤: `docs/tarot-interpretation-audit-2026-07-23.json`의 겁주지 않는 성찰적 존댓말과 일관 — 특히 death·the-devil·the-tower·소드 3/9/10
  - 기준 ② 정확성: 상징 서술이 RWS 도상과 부합하는지(Pictorial Key 대조), astrology 값이 각 태스크의 황금새벽회 표와 일치하는지 전수 대조
  - 기준 ③ 일관성: 78장 간 분량·구성 균질, 아트 중립 서술 위반("그림 속 ~" 류) 탐지, 미확인 속설의 "~라는 이야기가 전해집니다" 표기 누락 탐지
  - 산출: 파일:slug별 지적 목록(심각도 구분). 코드 수정은 하지 않는다 — 보고만.

- [ ] **Step 2: 지적 반영** — 어드바이저가 지적 목록을 검토하고 타당한 항목을 데이터 파일에 수정 반영(경미하면 직접, 분량이 크면 워커 재디스패치).

- [ ] **Step 3: 최종 검증**

Run: `./node_modules/.bin/vitest run && ./node_modules/.bin/tsc --noEmit`
Expected: 전체 PASS.

- [ ] **Step 4: 커밋**

```bash
git add src/data/lore/
git commit -m "Apply the lore review fixes"
```

---

## 실행 메모

- Task 2~6은 상호 독립 — 병렬 디스패치 가능(파일이 겹치지 않게 `lore.test.ts` 추가분은 각 태스크가 자기 describe 블록만 추가). 단, 동시 커밋 충돌을 피하려면 어드바이저가 순차 커밋하는 편이 안전하다.
- 워커가 Codex면 웹서치가 필요하므로 부적합 — **콘텐츠 태스크는 웹서치 가능한 Claude 워커로** 디스패치한다. Task 1·7(코드)은 Codex 가능(테스트 실행·커밋은 어드바이저).
- Task 8 검수는 Opus 4.8 고정.
