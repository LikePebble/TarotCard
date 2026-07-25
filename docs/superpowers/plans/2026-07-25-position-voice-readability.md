# 3카드 포지션 시점 정합 + 가독성 교정 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 3카드 결과의 주연 텍스트를 시점 어법의 포지션 문단(468건 증축)으로 세우고, 정본 156건 중 읽기 어려운 항목을 선별 교정한다.

**Architecture:** 이중 트랙 — Task 1에서 Codex 잡 4개(포지션 증축 2 + 가독성 교정안 2)를 발사하고, 도는 동안 Task 2(UI 위계 재편)를 진행한다. Task 3~4에서 산출을 조립·적용하고 Task 5에서 Opus 5가 검수한다.

**Tech Stack:** Next.js, TypeScript, vitest, Codex 백그라운드 잡(companion 1.0.4), Opus 5 검수.

**스펙:** `docs/superpowers/specs/2026-07-25-position-voice-readability-design.md`

## Global Constraints

- 테스트·타입체크: `./node_modules/.bin/vitest run` / `./node_modules/.bin/tsc --noEmit`. dev 서버 중 `npm run build` 금지.
- 저작·교정=Codex, 검수=Opus 5(사용자 지정). Codex 잡 지시문에 커밋·테스트 단계 금지(샌드박스).
- 가독성 규칙(신규 저작·교정 공통): 문장 40자 내외, 한 문장 한 생각, 은유는 문단당 하나까지, 관념어 연쇄·이중 부정 금지, 일상어 우선. 성찰적 존댓말·겁주지 않는 톤 유지, 예언 단정("~할 것입니다") 금지.
- 데이터 구조·export·slug 키 불변(텍스트만 교체). `ReadingResult.tsx` 소비 인터페이스(`koPositions`, `reversedPositions`) 불변.
- 원카드(오늘의 카드) 화면 불변.

---

### Task 1 (컨트롤러 직접 수행): Codex 잡 4개 발사

**Files:** Create `.scratch/position-voice/`(산출 디렉터리), `.scratch/position-voice/jobs.md`(task-id 기록)

- [ ] **Step 1**: `mkdir -p .scratch/position-voice`

- [ ] **Step 2: 잡 A — 정방향 포지션 증축**. companion `task --background --write`로 발사:

```
한국어 타로 앱의 3카드 포지션 문장(정방향)을 78카드×3시점 각 1문장에서 2~3문장 문단으로 증축한다. 작업 디렉터리: 저장소 루트.

읽을 것:
1. src/data/ko-positions.ts — 현행 1문장. 이 문장의 의미를 씨앗으로 확장하되 그대로 복사·나열하지 말고 자연스러운 문단으로 다시 써라.
2. src/data/ko.ts — 각 카드의 정방향 의미 축(의미 참고용 — 구절 복사 금지).

산출: .scratch/position-voice/upright.json — {"the-fool": {"past": "...", "present": "...", "future": "..."}, ...} 78개 slug 전부(키는 ko-positions.ts와 동일).

저작 규칙:
- 각 시점 2~3문장. 시점 어법을 문단 전체가 유지: 과거=회고(무엇이 지나갔고 지금의 뿌리가 되었나), 현재=진단(지금 작동하는 힘과 대하는 법), 미래=전망(다가오는 흐름과 준비). 한 카드의 세 문단이 같은 구를 돌려쓰지 않는다.
- 가독성: 문장 40자 내외, 한 문장 한 생각, 은유는 문단당 하나까지, 관념어 연쇄·이중 부정 금지, 일상어 우선.
- 존댓말, 겁주지 않는 성찰적 톤. 예언 단정("~할 것입니다") 금지 — 미래도 "~흐름입니다/~수 있습니다/~두세요"로.
- 78건 전부, 세 키 전부, 빈 문자열 금지.

하지 말 것: .scratch/position-voice/upright.json 외 파일 생성·수정 금지. git 커밋 금지. npx/npm 금지.
```

- [ ] **Step 3: 잡 B — 역방향 포지션 증축**. 동일 방식:

```
한국어 타로 앱의 3카드 포지션 문장(역방향)을 78카드×3시점 각 1문장에서 2~3문장 문단으로 증축한다. 작업 디렉터리: 저장소 루트.

읽을 것:
1. src/data/reversed-positions.ts — 현행 1문장(최근 재저작본, 근거 검수 통과). 이 문장의 의미를 씨앗으로 확장하되 그대로 복사·나열하지 말고 자연스러운 문단으로 다시 써라.
2. docs/reversed-variants-basis-2026-07-23/positions.json — 카드별 Waite·Mathers 근거 키워드.
3. src/data/reversed.ts — 역방향 정본(의미 참고용 — 구절 복사 금지).

산출: .scratch/position-voice/reversed.json — {"the-fool": {"past": "...", "present": "...", "future": "..."}, ...} 78개 slug 전부.

저작 규칙: (잡 A와 동일 — 시점 어법·가독성·톤·전수. 추가로) 역방향은 결핍이 아니라 지연·내향·과잉으로 서술하고 위협적 표현 금지.

하지 말 것: .scratch/position-voice/reversed.json 외 파일 생성·수정 금지. git 커밋 금지. npx/npm 금지.
```

- [ ] **Step 4: 잡 C — 정방향 정본 가독성 교정안**:

```
한국어 타로 앱 정방향 해석 78건의 가독성을 감사하고, 읽기 어려운 항목만 교정안을 만든다. 작업 디렉터리: 저장소 루트.

읽을 것: src/data/ko.ts — koCards의 description(카드당 2문단, \n\n 구분).

선별 기준(하나라도 해당하면 후보): ① 60자 이상 문장 ② 은유가 2겹 이상 겹쳐 뜻이 흐려짐 ③ 추상 명사 연쇄로 관념적임 ④ 이중 부정. 기준에 안 걸리는 카드는 건드리지 않는다.

산출: .scratch/position-voice/readability-ko.json — 선별된 카드만: {"<slug>": {"reason": "선별 사유 1줄", "revised": "교정된 description 전문(2문단, \n\n 유지)"}, ...}

교정 원칙:
- 의미·톤 보존. 문장 분할과 쉬운 어휘 치환 위주. 전면 재작성 금지(이 텍스트들은 원전 감사를 통과한 정본이다).
- 가독성 규칙: 문장 40자 내외, 한 문장 한 생각, 은유 문단당 하나, 일상어 우선.
- 존댓말·성찰적 톤 유지. 문단 수 2 유지.

하지 말 것: .scratch/position-voice/readability-ko.json 외 파일 생성·수정 금지. git 커밋 금지. npx/npm 금지.
```

- [ ] **Step 5: 잡 D — 역방향 정본 가독성 교정안**: 잡 C와 동일 구조로, 대상만 `src/data/reversed.ts`의 `reversedCards`의 **ko 필드만**(en은 범위 외), 산출 `.scratch/position-voice/readability-reversed.json` — `{"<slug>": {"reason": "...", "revisedKo": "교정된 ko 전문(2문단 유지)"}}`. 나머지 지시 동일.

- [ ] **Step 6**: 4개 task-id를 `.scratch/position-voice/jobs.md`에 기록(`upright:`/`reversed:`/`readability-ko:`/`readability-reversed:`). 커밋 없음.

---

### Task 2: 3카드 위계 재편 (`ReadingResult.tsx`)

**Files:**
- Modify: `src/app/reading/ReadingResult.tsx` (3카드 분기만 — `uprightContent` 정의부와 역방향 렌더부)

**Interfaces:**
- Consumes: 기존 `positionSentence`/`reversedPositionSentence`/`themeParagraph`/`reversedTheme`/`descriptionOf`/`reversedParagraphs`/`focusLabelOf`/`UprightDetails` — 전부 파일 내 기존 심볼
- Produces: 없음(말단 UI). 데이터 증축 전에도 동작(현행 1문장이 주연 자리에 그대로 섬).

- [ ] **Step 1: uprightContent 재구성** — 현재 정의(포지션 문장 → 정본 2문단 → 테마)를 아래로 교체. 위의 낡은 주석("포지션 문장도 정방향 어조라 … 함께 접는다")은 새 구성 설명으로 갱신:

```tsx
// 3카드 위계: 포지션 문단(시점 어법)이 주연, 테마는 "지금 건네는 말"로 프레임,
// 무시점 정본은 접힘으로 내린다. 근거: docs/research/2026-07-25-position-based-interpretation.md
const uprightContent = (
  <>
    {positionSentence ? (
      <p className="text-[15px] leading-[1.7] text-cream lg:text-[17px]">
        {positionSentence}
      </p>
    ) : null}
    {themeParagraph ? (
      <div className="mt-3.5 border-t border-line pt-3">
        <p className="text-[12.5px] text-gold lg:text-[13.5px]">
          이 카드가 지금 {focusLabelOf(focus)}에 건네는 말
        </p>
        <p className="mt-1 font-serif text-[14px] leading-[1.7] text-body lg:text-[15px]">
          {themeParagraph}
        </p>
      </div>
    ) : null}
    <details className="mt-2.5">
      <summary className="inline-block min-h-11 cursor-pointer pt-1.5 text-[13.5px] text-muted underline underline-offset-4 hover:text-cream">
        카드 자체의 의미 보기
      </summary>
      <div className="mt-1 space-y-2.5 font-serif text-[14.5px] leading-[1.7] text-body lg:text-[15.5px]">
        {descriptionOf(selected).map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
    </details>
  </>
);
```

- [ ] **Step 2: 역방향 렌더부 재구성** — 역방향 분기(포지션 문장 → 역방향 정본 2문단 → 역방향 테마 → UprightDetails)를 같은 위계로 교체:

```tsx
{reversed ? (
  <>
    {reversedPositionSentence ? (
      <p className="text-[15px] leading-[1.7] text-cream lg:text-[17px]">
        {reversedPositionSentence}
      </p>
    ) : null}
    {reversedTheme ? (
      <div className="mt-3.5 border-t border-line pt-3">
        <p className="text-[12.5px] text-gold lg:text-[13.5px]">
          이 카드가 지금 {focusLabelOf(focus)}에 건네는 말
        </p>
        <p className="mt-1 font-serif text-[14px] leading-[1.7] text-body lg:text-[15px]">
          {reversedTheme}
        </p>
      </div>
    ) : null}
    <details className="mt-2.5">
      <summary className="inline-block min-h-11 cursor-pointer pt-1.5 text-[13.5px] text-muted underline underline-offset-4 hover:text-cream">
        카드 자체의 의미 보기
      </summary>
      <div className="mt-1 space-y-2.5 font-serif text-[14.5px] leading-[1.7] text-body lg:text-[15.5px]">
        {reversedParagraphs(selected).map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
    </details>
    <UprightDetails>{uprightContent}</UprightDetails>
  </>
) : (
  uprightContent
)}
```

- [ ] **Step 3: 정적 검증** — Run: `./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/vitest run` / Expected: PASS.

- [ ] **Step 4: 브라우저 검증(컨트롤러)** — 3카드 리딩에서 ① 각 탭: 포지션 문장이 주연, 테마 라벨 "이 카드가 지금 사랑에 건네는 말", "카드 자체의 의미 보기" 접힘 동작 ② 역방향 카드: 동일 위계 + 정방향 해석 접힘 유지 ③ 오늘 하루(day) 테마: 테마 블록 없음 ④ 원카드 결과 회귀 없음.

- [ ] **Step 5: 커밋**

```bash
git add src/app/reading/ReadingResult.tsx
git commit -m "Lead three-card readings with the position voice"
```

---

### Task 3 (컨트롤러): 포지션 증축 수합·조립·형식 테스트

**Files:**
- Modify: `src/data/ko-positions.ts`, `src/data/reversed-positions.ts` (텍스트 전량 교체)
- Create: `src/data/positions.test.ts`

- [ ] **Step 1**: 잡 A·B 완료 폴링 → JSON 2개 검증(78키 × past/present/future, 빈 값 없음). 미달 잡만 재발사.

- [ ] **Step 2: 형식 테스트 작성** — `src/data/positions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cards } from "./cards";
import { koPositions } from "./ko-positions";
import { reversedPositions } from "./reversed-positions";

const SLUGS = cards.map((c) => c.slug);
const KEYS = ["past", "present", "future"] as const;

function sentenceCount(text: string): number {
  return (text.match(/[.!?](\s|$)/g) ?? []).length;
}

describe.each([
  ["정방향", koPositions],
  ["역방향", reversedPositions],
] as const)("%s 포지션 문단", (_label, table) => {
  it("78×3 전수, 각 2~4문장", () => {
    for (const slug of SLUGS) {
      const entry = table[slug];
      expect(entry, slug).toBeDefined();
      for (const key of KEYS) {
        const text = entry[key];
        expect(text?.trim(), `${slug}/${key}`).toBeTruthy();
        const n = sentenceCount(text);
        expect(n, `${slug}/${key} 문장 수 ${n}`).toBeGreaterThanOrEqual(2);
        expect(n, `${slug}/${key} 문장 수 ${n}`).toBeLessThanOrEqual(4);
      }
    }
  });
});
```

Run: `./node_modules/.bin/vitest run src/data/positions.test.ts` / Expected: **FAIL** — 현행은 1문장(RED 실증).

- [ ] **Step 3: 조립** — python 스크립트(`.scratch/position-voice/assemble.py`)로 두 TS 파일 재생성. cards.ts 정의 순서로 slug 정렬, 헤더 주석 갱신(증축·가독성 기준 명시, 기존 출처 각주 유지), 이스케이프는 앞 배치의 `esc()` 재사용. `reversedPositions`의 export 시그니처(`Record<string, { past; present; future }>`)와 `koPositions` 시그니처 불변.

- [ ] **Step 4: 검증·커밋**

```bash
./node_modules/.bin/vitest run && ./node_modules/.bin/tsc --noEmit
git add src/data/ko-positions.ts src/data/reversed-positions.ts src/data/positions.test.ts
git commit -m "Expand the position lines into voiced paragraphs"
```

---

### Task 4 (컨트롤러): 정본 가독성 교정 적용

**Files:**
- Modify: `src/data/ko.ts`, `src/data/reversed.ts` (선별 항목의 텍스트만)

- [ ] **Step 1**: 잡 C·D 완료 폴링 → 교정안 JSON 2개 확인. 컨트롤러가 **전 항목을 직접 정독**: 선별 사유 타당성, 의미 보존, 문단 수 2 유지. 타당하지 않은 항목은 기각 목록에 기록.
- [ ] **Step 2: 적용** — 채택 항목만 python으로 해당 slug의 description(ko.ts)/ko(reversed.ts)를 교체. en·nameKo·구조 불변.
- [ ] **Step 3: 검증·커밋**

```bash
./node_modules/.bin/vitest run && ./node_modules/.bin/tsc --noEmit
git add src/data/ko.ts src/data/reversed.ts
git commit -m "Ease the hardest-reading canonical passages"
```

---

### Task 5: Opus 5 검수 → 반영

- [ ] **Step 1: Opus 5 디스패치**(`model: "opus"` — 사용자 지정). 대상·기준:
  - `ko-positions.ts`·`reversed-positions.ts` 전량(468건): ① 시점 어법 성립(과거=회고/현재=진단/미래=전망, 한 카드 세 문단 구 돌려쓰기 없음) ② 의미 보존(정방향=ko.ts 축, 역방향=basis 키워드) ③ 가독성 규칙(문장 40자 내외·은유 밀도·일상어) ④ 톤(존댓말·겁주지 않음·예언 단정 금지 — 특히 역방향 death/devil/tower/소드 3·9·10)
  - `ko.ts`·`reversed.ts` 교정 diff(git diff로 교정 전후 대조): 의미 훼손·톤 이탈·과교정 여부
  - 산출: 파일:slug(/시점)별 지적 목록(심각도). 수정 금지 — 보고만.
- [ ] **Step 2: 반영** — 소량은 컨트롤러 직접, 대량은 Codex 픽스 잡. Opus 재검수(같은 에이전트 SendMessage)로 승인까지.
- [ ] **Step 3: 최종 검증·커밋**

```bash
./node_modules/.bin/vitest run && ./node_modules/.bin/tsc --noEmit
git add src/data/
git commit -m "Apply the position voice review fixes"
```

---

### Task 6 (컨트롤러): 최종 whole-branch 리뷰

- [ ] review-package(이 플랜 BASE..HEAD) 생성 → 최종 리뷰어(opus) 디스패치(코드·구조·통합·테스트 초점, 콘텐츠 정독 재수행 금지) → Critical/Important 있으면 픽스 1회 디스패치 → 레저 마감.

---

## 실행 메모

- 순서: Task 1(잡 발사) → Task 2(UI — 잡과 파일 안 겹침) → Task 3·4(잡 완료 후) → Task 5 → Task 6.
- Task 2는 데이터 증축 전에도 완결 동작(현행 1문장이 주연 자리에 그대로 섬) — 독립 검증 가능.
- 잡 실패·형식 오류 시 해당 잡만 재발사, 3회 실패 시 그 블록만 Claude 워커 폴백 + 사용자 보고.
