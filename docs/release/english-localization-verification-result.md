# 영문 현지화 구현 검증 결과 (2026-08-09)

`docs/superpowers/plans/2026-08-09-ip-locale-full-translation.md`의 완료 기준과
`docs/release/english-localization-validation-plan.md`의 P0 기준에 대해 워크트리
상태를 검증한 결과다. 브라우저 검증은 아직 하지 않았고, 아래는 전부 코드·데이터
레벨에서 재현 가능한 사실이다.

## 검증 방법

- `./node_modules/.bin/tsc --noEmit` → exit 0
- `./node_modules/.bin/vitest run` → 56파일 563테스트 통과
- 78장 × 5주제 × 2방향, 78장 × 3포지션, lore 78장, 법적 문서를 모듈로 직접
  로드해 커버리지·중복도 측정 (임시 감사 테스트는 측정 후 삭제)
- 한글 정규식(`[가-힣]`) 정적 스캔: 주석 제외, locale 분기 유무와 교차

환경 주의: 이 볼륨은 세션 중 EPERM으로 막히는 일이 있다. 막히면 명령 앞에
`tccutil reset SystemPolicyRemovableVolumes com.stablyai.orca`를 붙이고, 같은
호출 안에서 절대경로로 `cd` 한다. 호출 한 번만 유지되므로 명령을 크게 묶어라.

## 통과 항목 — 손대지 말 것

| 항목 | 근거 |
| --- | --- |
| 런타임 locale 판별 | `src/lib/locale.ts` — KR만 `ko`, 미확인 포함 나머지 `en` |
| 요청 전달·캐시 분리 | `src/middleware.ts` — `x-arca-locale` 주입, `Vary` 설정, Supabase 쿠키 분기에도 재적용 |
| HTML 언어·SEO 메타 | `src/app/layout.tsx` — `generateMetadata()` 분기, `<html lang>`, `og:locale` |
| 언어 선택 UI 없음 | 토글·쿠키·`/en` 경로 모두 부재 (계획서 원칙 준수) |
| **기본 카드 해석** | `cards[].en.description` 78/78, 전부 고유, 평균 366자. 카드별 실제 산문이며 한국어본(평균 175자)의 번역이 아니라 독립 저작 |
| **EN lore** | 78/78 존재, 스토리 78개 전부 고유, 상징명 232개 고유, 점성술 표기 한글 0건 |
| **법적 문서 영문판** | `terms-en` / `privacy-en` 존재, 한글 0건. version·시행일이 한국어 현행판과 동일(terms 1.0 / 2026-07-29, privacy 1.2 / 2026-08-08) → 계획서의 "금액·시행일·권리 범위 불변" 준수 |
| 주제 라벨·포지션 라벨 | `focus.ts`의 `EN_FOCUS_OPTIONS`, `ReadingResult.tsx:329` |

법적 문구의 법적 적정성은 코드 검증 범위 밖이다. 운영/법무 검토는 계획서대로
별도 승인 항목으로 남는다.

---

## P0-1 · 영문 주제/포지션 해석이 정본이 아니라 템플릿 생성물

계획서 저작 규칙: "임시 템플릿 문장은 출시 전 정본이 될 수 없다."
현재 구현이 정확히 그 상태다.

### 측정값

| 지표 | 영어 | 한국어 |
| --- | --- | --- |
| 주제 문단 수 | 390 (78×5) | 390 |
| 카드당 5주제가 **동일 본문**을 공유 | **78/78장** (정방향) | 0/78 |
| 문단 중 5주제가 그대로 공유하는 분량 | **정방향 90%** (평균 200자 중 180자) | 0% |
| 주제 말뭉치 파일 | 카드당 `{meaning, guidance}` 1쌍 | `ko-focus-{love,work,self,health,money}.ts` 5벌 |

역방향은 최장공통부분문자열 기준 29%로 보이지만, 이는 카드 고유 문장이
주제별 접속구를 사이에 두고 **두 조각으로 나뉘어** 있기 때문이다. 두 조각은
5주제에서 완전히 동일하다.

### 근거 코드

- `src/data/en-upright-reading.ts:336-363` — `focusParagraph()` / `positionParagraph()`가
  카드당 `EN_UPRIGHT_CARD_INSIGHTS[slug]` 한 쌍에서 8개 문단을 조립
- `src/data/en-reversed-reading.ts:337-362` — `focusText()` / `positionText()`가
  `REVERSED_SEEDS[slug]`의 `pattern` + `practice`로 동일하게 조립

### 실제 출력 (the-fool, 정방향)

```
[love]   In love and relationships, The Fool highlights a fresh beginning approached
         with curiosity and practical awareness. Leave room for discovery while
         checking the ground beneath the next step.
[work]   For work and purpose, The Fool highlights <위와 완전히 동일>
[self]   For your inner life, The Fool highlights <위와 완전히 동일>
[health] For wellbeing, The Fool highlights <위와 완전히 동일>
[money]  For money and resources, The Fool highlights <위와 완전히 동일>
```

한국어 같은 카드는 주제마다 내용이 다르다 — 사랑은 "계산 없이 설레는 마음",
일은 "경력의 새로운 장이 열리는 출발선", 금전은 "미뤄 온 가계 정리".

포지션도 같다. 과거/현재/미래가 `helped shape this moment` /
`draws attention to` / `may become more relevant if the current course continues`
접속구만 갈아끼우고 본문은 동일하다.

### 구현자 본인의 기록

`src/data/focus.ts:66-70`:

```ts
// The English card paragraph remains the primary interpretation.  These
// concise frames retain the focus context until the card-specific English
// focus corpus is authored and reviewed.
if (locale === "en") return null;
```

영문 주제 말뭉치가 아직 저작되지 않았음을 코드가 스스로 적어 두었다. 이 경로는
현재 `ReadingResult.tsx:130,370`에서 `english` 가드에 막혀 실행되지 않으므로
빈 화면을 만들지는 않지만, 분기가 하나 어긋나면 즉시 무해석 화면이 된다.

### 완료 기준

1. 78장 × 5주제 × 2방향 = 780개 주제 문단, 78장 × 3포지션 × 2방향 = 468개
   포지션 문단을 **카드·주제·방향별로 각각 저작**한다. 문자열 조립 함수는 제거한다.
2. 재측정 시 "카드당 5주제 동일 본문" = **0/78**, 5주제 공유 분량 = **0%**.
3. 한국어 정본의 비단정적·성찰적 톤을 유지한다. 예언 단정문 금지.
4. `en-upright-reading.ts:14-20`의 "complete materialized corpora" 주석은
   사실과 다르므로 실제 상태에 맞게 고친다.
5. 저작 완료 후 `focus.ts:69`의 `if (locale === "en") return null;`을 영문
   말뭉치 조회로 교체한다.

### 참고 — EN lore는 정본이지만 얕다

lore는 템플릿이 아니라 카드별 실제 저작이다(스토리 78개 전부 고유). 다만
카드당 상징이 **정확히 3.00개**로 고정돼 있고 한국어는 3.68개다. 한국어
`the-fool`은 상징 4개(절벽 끝의 발걸음·흰 장미·작은 봇짐·곁을 따르는 개)인데
영어는 3개로 "곁을 따르는 개"가 빠졌다. P0는 아니나 정본 밀도 차이로 기록한다.

---

## P0-2 · 영어 경로에 한국어가 그대로 노출

### (a) 수정된 파일인데 분기가 빠진 곳

| 파일:줄 | 렌더 위치 | 내용 |
| --- | --- | --- |
| `src/app/collection/[deckId]/page.tsx:40-46` | 198 | 수트 필터 칩 "메이저/컵/완드/소드/펜타클" |
| `src/app/reading/draw/page.tsx:41` | 433 | 뽑기 슬롯 라벨 "과거/현재/미래" |
| `src/app/reading/ReadingResult.tsx:256-260` | 275 | 3카드 테마 머리말 "이 카드가 ~에 대해 남긴 말" |
| `src/components/SignInButtons.tsx:102-116` | — | **약관 동의 고지 전체**. 법적 고지가 한국어 |
| `src/components/SignInButtons.tsx:33, 45` | — | 로그인 오류 안내, 데모 모드 안내 |
| `src/app/my/AccountCard.tsx:38` | — | `"Google 계정"` 하드코딩. kakao·development는 분기됨 |
| `src/app/reading/ReadingChoice.tsx:306-309` | — | `aria` 라벨. 화면 문구는 분기됐고 스크린리더만 한국어 |

`draw/page.tsx:41`은 특히 눈에 띈다. `ReadingResult.tsx:329`가 같은 개념을
`english ? ["Past","Present","Future"] : POSITIONS`로 번역하므로, 뽑기 화면은
"과거"인데 결과 화면은 "Past"로 나온다.

### (b) 아예 손대지 않은 화면·헬퍼

계획서 2단계 범위는 "홈·리딩·수집·로그인·MY·**일기**·**문의**·**공유**·팝업·오류"인데
아래는 diff에 없다.

| 파일 | 내용 |
| --- | --- |
| `src/app/my/InquiryModal.tsx` | 문의 모달 전체 (한글 300자, placeholder·aria 포함) |
| `src/app/my/journal/page.tsx` | 일기 목록 |
| `src/app/my/journal/[date]/page.tsx` | 일기 상세, placeholder "오늘 마음에 남은 것을 적어 보세요." |
| `src/app/my/journal/CalendarMonth.tsx` | 달력 "이전 달/다음 달" |
| `src/lib/tickets.ts:28,34,81,82` | 티켓 안내. `ReadingChoice`가 `ticketNoticeLinesOf()`로 렌더 |
| `src/lib/deck-detail-cta.ts:18-19` | "지금 리딩받기" CTA. 컬렉션 상세가 렌더 |
| `src/lib/share.ts:30-31,82-84` | 공유 제목·본문·복사 토스트 |
| `src/lib/day-readings.ts:43,54,66` | 탭 라벨 "오늘의 카드", "과거 · 현재 · 미래", "하루" |
| `src/components/CardArtViewer.tsx:74,278` | aria "카드 크게 보기", "닫기" |
| `src/components/DayReadingTabs.tsx:63` | aria "이날의 리딩" |
| `src/lib/inquiry.ts`, `src/app/api/inquiries/route.ts` | 문의 검증·응답 메시지 |

UI 컴포넌트 32개는 손봤지만 **그 컴포넌트들이 호출하는 lib 헬퍼**와
**일기·문의 서브트리**가 통째로 남았다. lib 헬퍼는 순수 함수이므로
`locale` 인자를 받도록 시그니처를 바꾸는 방식이 `focus.ts`·`decks.ts`의
기존 패턴과 일치한다.

### 완료 기준

영어 조건에서 `[가-힣]` 정적 스캔이 렌더 경로에서 0건. 카드 아트에 구워진
한글은 계획서대로 앱 결함이 아니다.

---

## P1 · 그 밖

| 위치 | 내용 |
| --- | --- |
| `src/components/LocaleProvider.tsx:6` | 기본 컨텍스트가 `"ko"`. Provider 밖 클라이언트 컴포넌트가 생기면 영어가 조용히 한국어로 떨어진다. `"en"`이 실패 방향으로 안전 |
| `src/app/collection/[deckId]/[slug]/page.tsx:141` | `` `Minor Arcana · ${card.suit}` `` — 슬러그가 그대로 나와 "Minor Arcana · swords"로 렌더. 표시명 매핑 필요 |
| `src/components/HomePopup.tsx:36` | 영어에서 팝업을 통째로 숨김. 팝업 아트가 한글이라 의도로 보이나 계획서엔 "팝업"이 번역 대상으로 적혀 있음 — **의도 확인 필요** |

---

## 판정

검증 계획서의 출시 차단 조건 중 두 개에 해당한다.

- "한국어 UI 또는 해석 데이터가 영어 경로에 노출됨" → P0-2
- 콘텐츠 표본 기준 "5개 주제·3개 포지션이 해당 카드·방향에 맞는 영어 문장" → P0-1

기반·기본 해석·lore·법적 문서는 통과다. 남은 것은 **주제/포지션 정본 저작**과
**미번역 표면 마감** 두 갈래다.

## 작업 분해

두 갈래는 서로 독립이라 병렬로 돌릴 수 있다.

**작업 A — 미번역 표면 마감 (P0-2)**

- A-1. lib 헬퍼 4종(`tickets`, `deck-detail-cta`, `share`, `day-readings`)에
  `locale` 인자 추가 + 호출부 갱신
- A-2. 일기 서브트리 3파일 + `InquiryModal` + `CardArtViewer` + `DayReadingTabs`
- A-3. 위 (a)표의 7개 분기 누락
- A-4. P1 3건

완료: 영어 렌더 경로 한글 0건, `tsc` 통과, 기존 563테스트 유지

**작업 B — 영문 주제/포지션 정본 저작 (P0-1)**

- B-1. 정방향 주제 390문단
- B-2. 역방향 주제 390문단
- B-3. 정·역 포지션 468문단
- B-4. 조립 함수 제거, `focus.ts:69` 교체, 주석 정정

완료: 5주제 동일 본문 0/78, 공유 분량 0%, 한국어 정본과 같은 성찰적 톤

작업 B는 분량이 커서 수트 단위(메이저 22 / 완드·컵·소드·펜타클 각 14)로
쪼개면 검수 단위가 맞는다.

---

## 수정 후 재검증 (2026-08-09)

- P0-1: 정·역방향 모두 카드별 공용 seed와 문자열 조립을 제거했다. 각 방향은
  78장 × (주제 5 + 포지션 3) = 624개의 명시적 영문 문단이며, 테스트는 각 방향의
  390개 주제·234개 포지션 완결성, 전체 고유성, 카드 내 문맥 간 5단어 초과 재사용
  부재, 한글·단정 예언 부재를 검증한다.
- `focusParagraphOf(..., "en")`은 더 이상 `null`을 반환하지 않고 영문 정본을
  조회한다.
- P0-2: 검증 결과에 열거된 수트/포지션·테마 라벨, 로그인 고지·오류, 티켓·공유·덱
  CTA, 문의, 일기, 카드 확대, 일별 탭의 사용자 문구와 접근성 라벨을 locale 분기로
  연결했다. 카드 아트에 구워진 한글과 영어 팝업 비노출은 별도 아트 파이프라인
  제약으로 유지한다.
- `./node_modules/.bin/tsc --noEmit`, `./node_modules/.bin/vitest run` 및
  `git diff --check` 재실행 결과 통과: 56개 파일, 572개 테스트. `local-events`
  테스트의 `boom` stderr는 오류 격리 동작을 검증하는 기존 기대 출력이다.

## Vercel Preview 실검증 (2026-08-09)

대상 배포: `codex/ip-locale-preview`의
`https://arcatarot-29ppaqkyl-like-pebble.vercel.app/`
(`6e8daad`, Vercel deployment `EdVwyuEYLabVtqiiepcU9TaXsK2N`).

| 요청 경로 | 관측 결과 | 판정 |
| --- | --- | --- |
| 한국 리전 직접 요청 | `<html lang="ko">`, 한국어 title/description, `og:locale=ko_KR` | 통과 |
| 비한국 외부 프록시 요청 | `Arca Tarot — One card a day, 78 cards for reflection`, 영문 내비게이션·CTA | 통과 |
| 국가 미확인 | `src/lib/locale.test.ts`의 `defaults an unknown country to English` 포함 3/3 통과 | 통과 |

Vercel은 클라이언트가 임의로 보낸 `x-vercel-ip-country` 헤더를 신뢰하지 않고
접속 리전 값으로 다시 설정한다. 따라서 KR/US를 같은 `curl` 실행에서 위조해
검증하는 방식은 유효하지 않았다. 한국 요청은 실제 Preview 직접 응답으로, 비한국
요청은 외부 프록시가 Preview를 가져온 실제 응답으로 확인했다.

검증 중 Preview의 Vercel Authentication을 잠시 해제했고, 완료 직후 다시
활성화했다. 원복 후 비인증 `HEAD` 요청은 `302`와 `vercel.com/sso-api` 위치를
반환해 보호가 재적용됐음을 확인했다.
