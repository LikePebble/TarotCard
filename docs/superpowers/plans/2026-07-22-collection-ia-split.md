# 컬렉션 IA 분리 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 컬렉션 탭을 덱 목록 → 덱 도감 → 카드 상세 3단으로 쪼개고, 하나였던 덱 상태를 "기본 덱(리딩용)"과 "보는 덱(URL)"으로 분리한다.

**Architecture:** 덱은 URL 경로(`[deckId]`)로 전달하고, `useSelectedDeck`은 의미를 기본 덱으로 좁혀 리딩 플로우와 카드 뒷면만 쓴다. 덱 카드 표시는 `DeckCard` 하나로 모으고 이동/선택은 부모가 감싼다.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind v4, Vitest 2 (`environment: "node"`).

**설계 근거:** [`docs/superpowers/specs/2026-07-22-collection-ia-design.md`](../specs/2026-07-22-collection-ia-design.md). 결정 번호(C1~C8)는 그 문서를 가리킨다.

## Global Constraints

- **`/collection/[slug]`와 `/collection/[deckId]`는 공존할 수 없다.** Next에서 같은 레벨의 동적 세그먼트는 이름이 하나여야 한다. 그래서 Task 3은 신설과 삭제를 한 번에 한다 — 쪼개면 중간 상태가 빌드되지 않는다.
- **덱은 경로에서만 읽는다(C7).** `?deck=` 쿼리를 새로 만들지 않는다.
- **알 수 없는 덱 id는 `notFound()`(C5).** `deckById`의 클래식 폴백에 기대지 않는다.
- **기본 덱은 명시적으로만 바뀐다(C2).** 도감을 열거나 카드를 보는 것으로 바뀌지 않는다.
- 테스트 환경은 `node`다. `window`·DOM이 없다. 새 테스트는 순수 함수만 대상으로 한다.
- 한국어 주석, 짧게, 왜 그런지 위주. 2-space, 큰따옴표, Tailwind v4.
- **`npm run build`를 돌리지 않는다** — dev 서버가 떠 있으면 `.next`가 깨진다. `npx tsc --noEmit`과 `npm test`로 확인한다.
- 기존 테스트 62개는 계속 통과해야 한다.
- DRY, YAGNI, TDD, 잦은 커밋.

## File Structure

| 파일 | 책임 |
|---|---|
| `src/data/decks.ts` (수정) | `decksByDefaultFirst()` 추가 |
| `src/data/decks.test.ts` (수정) | 위 테스트 |
| `src/components/DeckCard.tsx` (신규) | 덱 한 장의 **표시만**. 링크/버튼 래핑은 부모가 한다 |
| `src/app/collection/[deckId]/page.tsx` (신규) | 덱 도감 — 진행바·수트 필터·78장 그리드 |
| `src/app/collection/[deckId]/[slug]/page.tsx` (신규) | 카드 상세 |
| `src/app/collection/[slug]/page.tsx` (삭제) | 위와 자리 충돌 |
| `src/app/collection/page.tsx` (재작성) | 덱 목록 |
| `src/components/CollectHistory.tsx` (수정) | `deckId`를 prop으로 받는다 |
| `src/app/my/decks/page.tsx` (신규) | 덱 관리 — 기본 덱 선택만 |
| `src/app/my/page.tsx` (수정) | `/my/decks` 진입 행 |
| `src/app/not-found.tsx` (신규) | 404 자리표시자 |
| `src/app/reading/[id]/page.tsx` (수정) | 링크를 경로 방식으로 |
| `src/app/reading/draw/page.tsx` (수정) | 링크를 경로 방식으로 |

---

### Task 1: `decksByDefaultFirst`

**Files:**
- Modify: `src/data/decks.ts`
- Test: `src/data/decks.test.ts`

**Interfaces:**
- Produces: `decksByDefaultFirst(defaultDeckId: string): Deck[]` — 활성 덱만, 기본 덱을 맨 앞에. 나머지는 원래 순서 유지.

- [ ] **Step 1: 실패하는 테스트 작성**

`src/data/decks.test.ts` 상단 import를 다음으로 교체한다:

```ts
import { describe, expect, it } from "vitest";
import { decks, deckById, decksByDefaultFirst } from "@/data/decks";
```

파일 맨 아래에 추가한다:

```ts
describe("decksByDefaultFirst", () => {
  it("기본 덱을 맨 앞에 놓는다", () => {
    const sorted = decksByDefaultFirst("k-pop-museverse");
    expect(sorted[0].id).toBe("k-pop-museverse");
  });

  it("나머지는 원래 순서를 유지한다", () => {
    const original = decks.filter((d) => d.active).map((d) => d.id);
    const sorted = decksByDefaultFirst("k-pop-museverse").map((d) => d.id);
    expect(sorted.slice(1)).toEqual(
      original.filter((id) => id !== "k-pop-museverse"),
    );
  });

  it("모르는 id면 원래 순서를 그대로 돌려준다", () => {
    const original = decks.filter((d) => d.active).map((d) => d.id);
    expect(decksByDefaultFirst("없는-덱").map((d) => d.id)).toEqual(original);
  });

  it("활성 덱만 담는다", () => {
    expect(decksByDefaultFirst("classic").every((d) => d.active)).toBe(true);
  });
});
```

- [ ] **Step 2: 실패를 확인**

Run: `npm test -- src/data/decks.test.ts`
Expected: FAIL — `decksByDefaultFirst is not a function`

- [ ] **Step 3: 구현**

`src/data/decks.ts`의 `deckById` 아래에 추가한다:

```ts
/**
 * 덱 목록을 기본 덱이 맨 앞에 오도록 정렬한다.
 * 평소 쓰는 덱을 매번 찾아 내려가지 않게 하려는 것이므로, 나머지는
 * 원래 순서를 흐트러뜨리지 않는다.
 */
export function decksByDefaultFirst(defaultDeckId: string): Deck[] {
  const active = decks.filter((deck) => deck.active);
  return [
    ...active.filter((deck) => deck.id === defaultDeckId),
    ...active.filter((deck) => deck.id !== defaultDeckId),
  ];
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm test`
Expected: PASS — 66 tests (기존 62 + 신규 4)

- [ ] **Step 5: 커밋**

```bash
git add src/data/decks.ts src/data/decks.test.ts
git commit -m "Sort decks with the default one first"
```

---

### Task 2: `DeckCard` 표시 컴포넌트

**Files:**
- Create: `src/components/DeckCard.tsx`

**Interfaces:**
- Consumes: `Deck` from `@/data/decks`.
- Produces: `<DeckCard deck={deck} collected={n} isDefault={bool} />` — 시각 표현만 렌더한다. **링크도 버튼도 아니다.**

**왜 표시만 맡는가:** 컬렉션에서는 카드 본체가 도감으로 가는 링크이고, MY에서는 기본 덱을 고르는 버튼이다. 컴포넌트가 둘 다 품으면 링크 안에 버튼이 중첩되는 형태가 나오는데, 이는 접근성 위반이고 클릭 대상도 모호해진다. 래핑은 부모가 한다.

- [ ] **Step 1: 구현**

Create `src/components/DeckCard.tsx`:

```tsx
import Image from "next/image";
import type { Deck } from "@/data/decks";

/**
 * 덱 한 장의 표시. 링크도 버튼도 아니다 — 이동이냐 선택이냐는 쓰는 쪽이
 * 감싸서 정한다(컬렉션은 이동, MY는 선택).
 *
 * 루트부터 전부 span인 이유는 <button> 안에 들어가기 때문이다. button의
 * 내용 모델은 phrasing content라 div를 넣으면 유효하지 않은 마크업이 된다.
 */
export function DeckCard({
  deck,
  collected,
  isDefault,
}: {
  deck: Deck;
  collected: number;
  isDefault: boolean;
}) {
  const percent = (collected / 78) * 100;

  return (
    <span className="flex items-center gap-4">
      <span className="relative block aspect-[2/3.4] w-[64px] flex-none overflow-hidden rounded-lg bg-ink-2 lg:w-[76px]">
        {deck.cardBack ? (
          <Image
            src={deck.cardBack}
            alt=""
            aria-hidden
            fill
            sizes="76px"
            className="object-cover"
          />
        ) : (
          <span aria-hidden className="cardback absolute inset-0" />
        )}
      </span>
      <span className="block min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-display text-[17px] font-semibold lg:text-[19px]">
            {deck.nameKo}
          </span>
          {isDefault ? (
            <span className="flex-none rounded-full border border-line-gold px-2 py-0.5 text-[11px] text-gold-soft">
              기본
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-[13px] text-muted lg:text-[14px]">
          {collected} <span className="text-[12px]">/ 78</span>
        </span>
        <span className="mt-2 block h-0.5 bg-line">
          <span
            className="block h-full bg-gold transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </span>
      </span>
    </span>
  );
}
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit`
Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/components/DeckCard.tsx
git commit -m "Add a presentational deck card"
```

---

### Task 3: 라우트 재편 — 덱 도감 · 카드 상세 신설, 옛 카드 상세 삭제

**Files:**
- Create: `src/app/collection/[deckId]/page.tsx`
- Create: `src/app/collection/[deckId]/[slug]/page.tsx`
- Delete: `src/app/collection/[slug]/page.tsx`
- Modify: `src/components/CollectHistory.tsx`
- Modify: `src/app/reading/[id]/page.tsx:88`
- Modify: `src/app/reading/draw/page.tsx:528`

**Interfaces:**
- Consumes: `decksByDefaultFirst` (Task 1 — 여기서는 안 쓰지만 같은 파일을 만진다), `deckById`, `decks` from `@/data/decks`.
- Produces:
  - 라우트 `/collection/[deckId]`와 `/collection/[deckId]/[slug]`
  - `<CollectHistory slug={string} deckId={string} />` — `deckId`가 **필수 prop**이 된다.

**이 태스크가 큰 이유:** `[deckId]`와 `[slug]`는 `/collection` 바로 아래 같은 자리를 두고 다툰다. 둘이 동시에 존재하면 Next가 빌드를 거부하므로, 신설과 삭제와 링크 수정이 한 커밋에 들어가야 앱이 계속 돌아간다.

- [ ] **Step 1: `CollectHistory`가 덱을 prop으로 받게 한다**

지금은 `useSelectedDeck()`을 읽는데, 덱 상태가 갈라지면 **보고 있는 덱이 아니라 기본 덱의 이력**을 보여주는 버그가 된다. 파일 전체를 다음으로 교체한다:

```tsx
"use client";

import { useArcanaStore } from "@/lib/store";

function formatKoDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

/** 이 카드를 이 덱에서 언제 처음 만났고 몇 번 뽑았는지.
 *  덱은 반드시 보고 있는 덱을 받아야 한다 — 기본 덱을 읽으면 남의 이력이 뜬다. */
export function CollectHistory({
  slug,
  deckId,
}: {
  slug: string;
  deckId: string;
}) {
  const { store } = useArcanaStore();
  const entry = store?.collection[deckId]?.[slug];

  return (
    <div className="mt-7 border-t border-line pt-5 lg:mt-10 lg:pt-7">
      {store === null ? (
        <p className="text-[12.5px] text-muted" aria-hidden>
          {" "}
        </p>
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

- [ ] **Step 2: 덱 도감 페이지 생성**

Create `src/app/collection/[deckId]/page.tsx`:

```tsx
"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeft } from "@phosphor-icons/react";
import { CardArt } from "@/components/CardArt";
import { CardBack } from "@/components/CardBack";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { TabBar } from "@/components/TabBar";
import { cards } from "@/data/cards";
import { decks } from "@/data/decks";
import { koCards } from "@/data/ko";
import { collectedCount, useArcanaStore, useSelectedDeck } from "@/lib/store";

const FILTERS = [
  { id: "major", label: "메이저" },
  { id: "cups", label: "컵" },
  { id: "wands", label: "완드" },
  { id: "swords", label: "소드" },
  { id: "pentacles", label: "펜타클" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export default function DeckCatalogPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = use(params);
  const { store } = useArcanaStore();
  const { deckId: defaultDeckId, select } = useSelectedDeck();
  const [filter, setFilter] = useState<FilterId>("major");

  const deck = decks.find((d) => d.id === deckId && d.active);
  // 모르는 덱은 클래식으로 둔갑시키지 않는다 — 옛 카드 상세 URL이 조용히
  // 엉뚱한 도감으로 보이는 것을 막는다.
  // 훅을 모두 부른 뒤에 던진다(조건부 훅 호출 금지).
  if (!deck) notFound();

  const isDefault = defaultDeckId === deck.id;
  const total = store ? collectedCount(store, deck.id) : 0;
  const visible = cards.filter((card) =>
    filter === "major" ? card.arcana === "major" : card.suit === filter,
  );

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden lg:h-auto lg:min-h-[100dvh] lg:overflow-visible">
      <DesktopNav active="collection" />
      <MobileTopBar />
      <main className="mx-auto w-full min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-2 lg:max-w-[1280px] lg:overflow-visible lg:px-12 lg:pb-[88px] lg:pt-[72px]">
        <Link
          href="/collection"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
        >
          <CaretLeft size={16} aria-hidden />
          컬렉션
        </Link>

        <div className="lg:flex lg:items-end lg:justify-between">
          <div>
            <div className="flex items-end justify-between lg:block">
              <h1 className="font-display text-[27px] font-semibold lg:text-[40px]">
                {deck.nameKo}
              </h1>
              <p className="font-display text-2xl font-semibold text-gold-soft lg:hidden">
                {total}{" "}
                <span className="text-sm font-normal text-muted">/ 78</span>
              </p>
            </div>
            {isDefault ? (
              <p className="mt-2 text-[13px] text-gold-soft">
                기본 덱 · 리딩에서 이 덱으로 뽑습니다
              </p>
            ) : (
              <button
                type="button"
                onClick={() => select(deck.id)}
                className="mt-2 min-h-11 text-[13px] text-muted underline underline-offset-4 hover:text-cream"
              >
                기본 덱으로 설정
              </button>
            )}
          </div>
          <div className="hidden lg:block lg:text-right">
            <p className="font-display text-[40px] font-semibold text-gold-soft">
              {total}{" "}
              <span className="text-xl font-normal text-muted">/ 78</span>
            </p>
            <div className="mt-2.5 h-0.5 w-[220px] bg-line">
              <div
                className="h-full bg-gold transition-[width] duration-500"
                style={{ width: `${(total / 78) * 100}%` }}
              />
            </div>
          </div>
        </div>
        <div className="mt-3 h-0.5 bg-line lg:hidden">
          <div
            className="h-full bg-gold transition-[width] duration-500"
            style={{ width: `${(total / 78) * 100}%` }}
          />
        </div>

        {store && total === 0 ? (
          <div className="mt-5 rounded-2xl border border-line bg-ink-1 p-6 lg:mt-10 lg:flex lg:items-center lg:justify-between lg:p-8">
            <div>
              <p className="font-display text-lg font-semibold lg:text-[21px]">
                아직 수집한 카드가 없습니다
              </p>
              <p className="mt-1 text-[13.5px] text-muted lg:text-[15px]">
                첫 리딩에서 뽑은 카드가 이곳에 모입니다.
              </p>
            </div>
            <Link
              href="/reading"
              className="btn btn-gold mt-4 w-full lg:mt-0 lg:w-auto"
            >
              리딩 시작하기
            </Link>
          </div>
        ) : null}

        <div
          className="-mx-5 mt-[18px] flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:mt-8 lg:flex-wrap lg:overflow-visible lg:px-0"
          role="tablist"
          aria-label="아르카나 필터"
        >
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`min-h-11 flex-none whitespace-nowrap rounded-full border px-4 text-[13px] lg:px-5 lg:text-[14px] ${
                filter === item.id
                  ? "border-gold text-gold-soft"
                  : "border-line text-muted hover:text-cream"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-y-3.5 gap-x-3 lg:mt-8 lg:grid-cols-6 lg:gap-[22px]">
          {visible.map((card) => {
            const collected = !!store?.collection[deck.id]?.[card.slug];
            const nameKo = koCards[card.slug]?.nameKo ?? card.nameEn;
            const label = (
              <p
                className={`mt-[7px] text-center text-[11px] leading-[1.4] lg:mt-2.5 lg:text-[13px] ${
                  collected ? "" : "text-muted"
                }`}
              >
                {nameKo}
                <br />
                <span className={collected ? "text-muted" : ""}>
                  {card.nameEn}
                </span>
              </p>
            );
            return collected ? (
              <Link
                key={card.slug}
                href={`/collection/${deck.id}/${card.slug}`}
                className="group block"
              >
                <div className="relative aspect-[2/3.4] overflow-hidden rounded-xl bg-ink-2 transition-transform duration-300 group-hover:scale-[1.03]">
                  <CardArt
                    card={card}
                    deckId={deck.id}
                    sizes="(min-width: 1024px) 190px, 33vw"
                  />
                </div>
                {label}
              </Link>
            ) : (
              <div key={card.slug}>
                <CardBack
                  deckId={deck.id}
                  sizes="(min-width: 1024px) 190px, 33vw"
                  className="aspect-[2/3.4] w-full"
                />
                {label}
              </div>
            );
          })}
        </div>
      </main>
      <TabBar />
    </div>
  );
}
```

- [ ] **Step 3: 카드 상세 페이지를 한 단계 아래로 옮긴다**

Create `src/app/collection/[deckId]/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { CardArtViewer } from "@/components/CardArtViewer";
import { CollectHistory } from "@/components/CollectHistory";
import { DesktopNav } from "@/components/SiteNav";
import { cardBySlug, cards, romanNumeral } from "@/data/cards";
import { decks } from "@/data/decks";
import { koCards } from "@/data/ko";

const SUIT_KO = {
  cups: "컵",
  wands: "완드",
  swords: "소드",
  pentacles: "펜타클",
} as const;

/** 덱 × 카드 = 3 × 78 = 234장. 전부 빌드 타임 산출이라 런타임 비용은 없다. */
export function generateStaticParams() {
  return decks
    .filter((deck) => deck.active)
    .flatMap((deck) =>
      cards.map((card) => ({ deckId: deck.id, slug: card.slug })),
    );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ deckId: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = cardBySlug.get(slug);
  if (!card) return { title: "아르카나" };
  const nameKo = koCards[card.slug]?.nameKo ?? card.nameEn;
  return {
    title: `${nameKo} ${card.nameEn} | 아르카나`,
    description: `${nameKo} 카드의 해석과 수집 이력을 확인하세요.`,
  };
}

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ deckId: string; slug: string }>;
}) {
  const { deckId, slug } = await params;
  const deck = decks.find((d) => d.id === deckId && d.active);
  const card = cardBySlug.get(slug);
  if (!deck || !card) notFound();

  const ko = koCards[card.slug];
  const nameKo = ko?.nameKo ?? card.nameEn;
  const description =
    ko?.description && ko.description.length > 0
      ? ko.description
      : card.en.description;
  const paragraphs = description.split("\n\n");
  const enParagraphs = card.en.description.split("\n\n");

  const index = cards.indexOf(card);
  const prev = cards[(index + cards.length - 1) % cards.length];
  const next = cards[(index + 1) % cards.length];
  const prevNameKo = koCards[prev.slug]?.nameKo ?? prev.nameEn;
  const nextNameKo = koCards[next.slug]?.nameKo ?? next.nameEn;

  const arcanaLabel =
    card.arcana === "major"
      ? `메이저 아르카나 ${romanNumeral(card.number)}`
      : `마이너 아르카나 · ${SUIT_KO[card.suit as keyof typeof SUIT_KO]}`;

  const backHref = `/collection/${deck.id}`;

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <DesktopNav active="collection" />
      <nav className="flex h-14 flex-none items-center px-5 lg:hidden">
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
        >
          <CaretLeft size={16} aria-hidden />
          {deck.nameKo}
        </Link>
      </nav>
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-6 pb-10 pt-1 lg:px-[72px] lg:pb-[88px] lg:pt-14">
        <Link
          href={backHref}
          className="hidden items-center gap-1.5 text-sm text-muted hover:text-cream lg:inline-flex"
        >
          <CaretLeft size={16} aria-hidden />
          {deck.nameKo}
        </Link>
        <div className="lg:mt-10 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-[72px]">
          <div className="flex justify-center lg:block">
            <CardArtViewer card={card} deckOverride={deck.id} />
          </div>
          <div>
            <p className="mt-6 text-center text-[13px] text-muted lg:mt-0 lg:text-left lg:text-[14px]">
              {arcanaLabel}
            </p>
            <h1 className="mt-0.5 mb-[18px] text-center font-display text-[30px] font-semibold lg:mb-6 lg:text-left lg:text-[46px]">
              {nameKo}
              <span className="mt-1 block text-base font-normal text-muted lg:text-[22px]">
                {card.nameEn}
              </span>
            </h1>
            <div className="space-y-3 font-serif text-[15px] text-body lg:max-w-[560px] lg:text-base">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <details className="mt-3.5 lg:mt-5">
              <summary className="inline-block min-h-11 cursor-pointer pt-2.5 text-[13.5px] text-muted underline underline-offset-4 hover:text-cream">
                영어 원문 보기
              </summary>
              <div className="mt-2 space-y-3 font-serif text-[14px] text-body lg:max-w-[560px]">
                {enParagraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </details>
            <CollectHistory slug={card.slug} deckId={deck.id} />
            <div className="mt-7 flex justify-between border-t border-line pt-5 lg:mt-14 lg:pt-7">
              <Link
                href={`/collection/${deck.id}/${prev.slug}`}
                className="inline-flex min-h-11 items-center gap-1.5 text-[13.5px] text-muted hover:text-gold-soft lg:text-[15px]"
              >
                <CaretLeft size={14} aria-hidden />
                {prevNameKo} {prev.nameEn}
              </Link>
              <Link
                href={`/collection/${deck.id}/${next.slug}`}
                className="inline-flex min-h-11 items-center gap-1.5 text-[13.5px] text-muted hover:text-gold-soft lg:text-[15px]"
              >
                {nextNameKo} {next.nameEn}
                <CaretRight size={14} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: 옛 카드 상세를 지운다**

```bash
git rm -r "src/app/collection/[slug]"
```

이 삭제 없이는 `[deckId]`와 `[slug]`가 같은 자리를 다퉈 Next가 빌드를 거부한다.

- [ ] **Step 5: 리딩 쪽 링크 2곳을 경로 방식으로**

`src/app/reading/[id]/page.tsx`의 88번 줄 근처, `href={\`/collection/${cards[0].slug}?deck=${reading.deckId}\`}`를 다음으로 바꾼다:

```tsx
                href={`/collection/${reading.deckId}/${cards[0].slug}`}
```

`src/app/reading/draw/page.tsx`의 528번 줄 근처, `href={\`/collection/${deck[0].slug}?deck=${deckId}\`}`를 다음으로 바꾼다:

```tsx
                  href={`/collection/${deckId}/${deck[0].slug}`}
```

- [ ] **Step 6: 남은 참조가 없는지 확인**

Run: `grep -rn "?deck=" src/`
Expected: 결과 없음

Run: `grep -rn "/collection/" src/ --include="*.tsx"`
Expected: 나오는 링크가 다음 셋 중 하나여야 한다 — `/collection`(목록), `/collection/${...deckId...}`(도감), `/collection/${...deckId...}/${...slug...}`(카드 상세). **덱 없이 slug만 붙은 링크가 하나도 없어야 한다.** 눈으로 한 줄씩 확인한다.

- [ ] **Step 7: 타입체크·테스트**

Run: `npx tsc --noEmit`
Expected: 오류 없음

Run: `npm test`
Expected: PASS — 66 tests

- [ ] **Step 8: 커밋**

```bash
git add -A src/app/collection src/components/CollectHistory.tsx "src/app/reading/[id]/page.tsx" src/app/reading/draw/page.tsx
git commit -m "Move the card catalog and card detail under the deck path"
```

---

### Task 4: `/collection`을 덱 목록으로 재작성

**Files:**
- Modify: `src/app/collection/page.tsx` (전체 교체)

**Interfaces:**
- Consumes: `decksByDefaultFirst` (Task 1), `<DeckCard>` (Task 2), `collectedCount`·`useArcanaStore`·`useSelectedDeck` from `@/lib/store`.

카드 본체는 도감으로 가는 링크이고, "기본으로" 버튼은 그 **형제**다. 링크 안에 버튼을 넣지 않는다.

- [ ] **Step 1: 전체 교체**

`src/app/collection/page.tsx`를 다음으로 교체한다:

```tsx
"use client";

import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import { DeckCard } from "@/components/DeckCard";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { TabBar } from "@/components/TabBar";
import { decksByDefaultFirst } from "@/data/decks";
import { collectedCount, useArcanaStore, useSelectedDeck } from "@/lib/store";

export default function CollectionPage() {
  const { store } = useArcanaStore();
  const { deckId: defaultDeckId, select } = useSelectedDeck();
  const list = decksByDefaultFirst(defaultDeckId);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden lg:h-auto lg:min-h-[100dvh] lg:overflow-visible">
      <DesktopNav active="collection" />
      <MobileTopBar />
      <main className="mx-auto w-full min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-2 lg:max-w-[1060px] lg:overflow-visible lg:px-12 lg:pb-[88px] lg:pt-[72px]">
        <h1 className="font-display text-[27px] font-semibold lg:text-[40px]">
          컬렉션
        </h1>
        <p className="mt-1 text-[13px] text-muted lg:text-[14px]">
          덱마다 78장을 따로 모읍니다.
        </p>

        <div className="mt-5 flex flex-col gap-2.5 lg:mt-8">
          {list.map((deck) => {
            const collected = store ? collectedCount(store, deck.id) : 0;
            const isDefault = deck.id === defaultDeckId;
            return (
              <div
                key={deck.id}
                className="rounded-2xl border border-line bg-ink-1 p-4 lg:rounded-[14px] lg:p-5"
              >
                <Link
                  href={`/collection/${deck.id}`}
                  className="flex items-center gap-3 transition-opacity hover:opacity-90"
                >
                  <span className="min-w-0 flex-1">
                    <DeckCard
                      deck={deck}
                      collected={collected}
                      isDefault={isDefault}
                    />
                  </span>
                  <CaretRight size={18} className="text-muted" aria-hidden />
                </Link>
                {isDefault ? null : (
                  <button
                    type="button"
                    onClick={() => select(deck.id)}
                    className="mt-3 min-h-11 text-[13px] text-muted underline underline-offset-4 hover:text-cream"
                  >
                    기본 덱으로 설정
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <TabBar />
    </div>
  );
}
```

- [ ] **Step 2: 타입체크·테스트**

Run: `npx tsc --noEmit`
Expected: 오류 없음

Run: `npm test`
Expected: PASS — 66 tests

- [ ] **Step 3: 커밋**

```bash
git add src/app/collection/page.tsx
git commit -m "Turn /collection into a deck list"
```

---

### Task 5: `/my/decks` 덱 관리 + MY 진입 행

**Files:**
- Create: `src/app/my/decks/page.tsx`
- Modify: `src/app/my/page.tsx`

**Interfaces:**
- Consumes: `decksByDefaultFirst` (Task 1), `<DeckCard>` (Task 2).

여기서는 카드가 **버튼**이다. 도감으로 넘어가지 않는다 — 여기는 쓸 덱을 고르는 곳이고 구경은 컬렉션 탭의 일이다.

- [ ] **Step 1: 덱 관리 화면 생성**

Create `src/app/my/decks/page.tsx`:

```tsx
"use client";

import Link from "next/link";
import { CaretLeft, Check } from "@phosphor-icons/react";
import { DeckCard } from "@/components/DeckCard";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { TabBar } from "@/components/TabBar";
import { decksByDefaultFirst } from "@/data/decks";
import { collectedCount, useArcanaStore, useSelectedDeck } from "@/lib/store";

export default function MyDecksPage() {
  const { store } = useArcanaStore();
  const { deckId: defaultDeckId, select } = useSelectedDeck();
  const list = decksByDefaultFirst(defaultDeckId);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden lg:h-auto lg:min-h-[100dvh] lg:overflow-visible">
      <DesktopNav active="my" />
      <MobileTopBar />
      <main className="mx-auto w-full min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-2 lg:max-w-[1060px] lg:overflow-visible lg:px-12 lg:pb-[88px] lg:pt-[72px]">
        <Link
          href="/my"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
        >
          <CaretLeft size={16} aria-hidden />
          MY
        </Link>
        <h1 className="font-display text-[27px] font-semibold lg:text-[40px]">
          덱 관리
        </h1>
        <p className="mt-1 text-[13px] text-muted lg:text-[14px]">
          리딩에서 뽑을 덱을 고릅니다.
        </p>

        <div className="mt-5 flex flex-col gap-2.5 lg:mt-8">
          {list.map((deck) => {
            const collected = store ? collectedCount(store, deck.id) : 0;
            const isDefault = deck.id === defaultDeckId;
            return (
              <button
                key={deck.id}
                type="button"
                onClick={() => select(deck.id)}
                aria-pressed={isDefault}
                className={`flex items-center gap-3 rounded-2xl border bg-ink-1 p-4 text-left transition-colors lg:rounded-[14px] lg:p-5 ${
                  isDefault
                    ? "border-line-gold"
                    : "border-line hover:border-line-gold"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <DeckCard
                    deck={deck}
                    collected={collected}
                    isDefault={isDefault}
                  />
                </span>
                {isDefault ? (
                  <Check size={18} className="text-gold-soft" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>
      </main>
      <TabBar />
    </div>
  );
}
```

- [ ] **Step 2: MY 허브에 진입 행 추가**

`src/app/my/page.tsx:5`의 아이콘 import를 다음으로 교체한다(`Cards` 추가):

```tsx
import { CaretRight, Cards, Notebook, Sparkle } from "@phosphor-icons/react";
```

`일별 기록` Link 블록이 끝나는 `</Link>` 바로 다음에 아래를 삽입한다(사주 프로필 카드보다 위):

```tsx
          <Link
            href="/my/decks"
            className="flex items-center justify-between rounded-2xl border border-line bg-ink-1 p-5 transition-colors hover:border-line-gold active:scale-[0.99] lg:rounded-[14px] lg:p-6"
          >
            <span className="flex items-center gap-3.5">
              <Cards size={22} className="text-gold-soft" aria-hidden />
              <span>
                <span className="block font-display text-[17px] font-semibold lg:text-[19px]">
                  덱 관리
                </span>
                <span className="text-[13px] text-muted lg:text-[14px]">
                  리딩에서 뽑을 덱을 고릅니다
                </span>
              </span>
            </span>
            <CaretRight size={18} className="text-muted" aria-hidden />
          </Link>
```

- [ ] **Step 3: 타입체크·테스트**

Run: `npx tsc --noEmit`
Expected: 오류 없음

Run: `npm test`
Expected: PASS — 66 tests

- [ ] **Step 4: 커밋**

```bash
git add src/app/my
git commit -m "Add deck management under MY"
```

---

### Task 6: 404 자리표시자

**Files:**
- Create: `src/app/not-found.tsx`

디자인된 오류 화면은 사용자가 별도 제작한다(C8). 여기서는 Next 기본 화면 대신 앱 톤만 맞춘 최소 화면을 둔다. 탭바는 붙이지 않는다 — 404는 탭 어디에도 속하지 않는다.

- [ ] **Step 1: 생성**

Create `src/app/not-found.tsx`:

```tsx
import Link from "next/link";

/**
 * 404 자리표시자. 디자인된 오류 화면은 별도 제작 예정이라 여기서는
 * 앱 배경·서체만 따르고 빠져나갈 길만 둔다.
 * 세그먼트별 문구가 필요해지면 그 세그먼트에 not-found.tsx를 추가한다.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-[44px] font-semibold text-gold-soft lg:text-[64px]">
        404
      </p>
      <h1 className="mt-2 font-display text-[19px] font-semibold lg:text-[24px]">
        찾으시는 페이지가 없습니다
      </h1>
      <p className="mt-2 text-[13.5px] text-muted lg:text-[15px]">
        주소가 바뀌었거나 삭제된 화면일 수 있습니다.
      </p>
      <div className="mt-7 flex gap-2.5">
        <Link href="/" className="btn btn-gold">
          홈으로
        </Link>
        <Link href="/collection" className="btn btn-ghost">
          컬렉션
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit`
Expected: 오류 없음

- [ ] **Step 3: 커밋**

```bash
git add src/app/not-found.tsx
git commit -m "Add a placeholder 404 screen"
```

---

## 브라우저 검증 체크리스트

구현이 끝나면 dev 서버에서 확인한다. **`npm run build`를 돌리지 않는다** — dev 서버의 `.next`가 깨진다.

- [ ] `/collection` — 덱 3개가 카드로 보이고 **기본 덱이 맨 위**에 `기본` 배지와 함께 있다.
- [ ] 덱 카드를 누르면 `/collection/<deckId>`로 가고, 그 덱의 진행도·그리드가 나온다.
- [ ] 도감에서 카드를 누르면 `/collection/<deckId>/<slug>`로 가고, **그 덱의 아트**가 보인다.
- [ ] 카드 상세의 "첫 수집 / 뽑은 횟수"가 **보고 있는 덱 기준**이다. 기본 덱을 다른 덱으로 바꿔 두고 확인한다 — 이전에는 기본 덱 이력이 새어 나왔다.
- [ ] 이전/다음 카드 순환이 같은 덱 안에서 돈다.
- [ ] 덱 도감을 여러 개 돌아다녀도 **기본 덱이 안 바뀐다**(`/reading`에서 뒷면 아트로 확인).
- [ ] 도감의 "기본 덱으로 설정"을 누르면 배지가 바뀌고, `/reading`의 카드 뒷면도 그 덱으로 바뀐다.
- [ ] `/my/decks`에서 덱을 고르면 `/collection`의 순서와 배지에 반영된다.
- [ ] `/collection/없는덱`과 옛 주소 `/collection/the-fool`이 **404 화면**으로 떨어진다(클래식 도감이 아니라).
- [ ] 리딩 결과 화면의 "컬렉션에서 보기" 링크가 그 리딩의 덱으로 간다.
