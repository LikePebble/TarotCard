# 엔타이틀먼트 · 도감 소유 모델 설계 (출시 하위 프로젝트 1)

> 출시(계정·상품화) 작업의 **로드베어링 토대**. 게스트 경계 UI, 덱 구매/스토어 UI,
> 광고 슬롯, Supabase 실설정, 실결제는 각각 별도 하위 프로젝트로 뒤에 다룬다.
> 이 문서는 **데이터 모델과 순수 로직**만 확정한다 — Supabase가 라이브로 가기
> 전에 반드시 옳아야 하는 부분이기 때문이다.

## 1. 목표

- 덱 **소유(entitlement)** 개념을 도입한다.
- 도감을 "뽑아 모으는 그라인드"에서 **"소유 기반 갤러리"**로 바꾼다.
- MY의 "수집 n/78" 통계를 **"함께한 날"**(뽑은 날 수)로 교체한다.
- 위를 payment-agnostic한 데이터 모델로 확정해, 나중에 실결제가 붙어도 스키마가
  안 바뀌게 한다.

## 2. 비즈니스 규칙 (확정)

**과금 철학:** 리딩(운세)은 판매하지 않는다. 파는 것은 **덱 소유(도감 완성)**과
**광고 제거**다. 성찰적 브랜드 톤과 데일리 리추얼 습관 루프를 지키기 위한 결정.

**티어 행렬:**

| 티어 | 리딩 | 덱 | 일기 | 광고 |
|---|---|---|---|---|
| 게스트 | 원카드만 | 클래식만 | ✕ | 노출 |
| 로그인(무료) | 원카드+3장 | 전 덱 뽑기 가능(프리미엄은 아트만·도감 미적립) | ○ | 노출 |
| +프리미엄 소유 | — | 소유 덱 = 78장 전량 수집 | — | — |
| +ad_free | 오늘의 타로 3슬롯 | — | — | 제거 |

**덱 메커닉(B1):** 프리미엄 덱은 미소유 상태로 시작한다. 로그인 사용자는 프리미엄을
**뽑아서 아트를 볼 수 있으나 그 카드가 도감에 적립되지 않는다.** 구매 시 그 덱이
**즉시 78장 전량 수집**된다. 클래식은 모두에게 암묵 소유 → 항상 78장.

**게스트×프리미엄 해소:** 게스트는 클래식만이므로, "프리미엄 무료 뽑기"는 **로그인
사용자** 기능이다(요구 2와 5의 표면 충돌 해소).

## 3. 데이터 모델

### 3.1 entitlements (신규 테이블)

`supabase/migrations/0001_p1_foundation.sql`는 **아직 적용 전**이므로 여기에 덧붙인다
(마이그레이션 하나로 유지 → 설정 단계가 늘지 않는다).

```sql
create table if not exists public.entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id text not null,
  granted_at timestamptz not null default now(),
  -- 지급 출처. 지금은 'dev'/'grant', 실결제 붙으면 'purchase'|<pg>. 스키마 불변.
  source text not null default 'grant',
  primary key (user_id, deck_id)
);
alter table public.entitlements enable row level security;
create policy "own entitlements" on public.entitlements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

`ad_free`는 **덱이 아닌 별도 축**이므로 `profiles`에 컬럼으로 둔다:

```sql
alter table public.profiles add column if not exists ad_free boolean not null default false;
```

- 클래식은 **행을 만들지 않는다.** "모두 소유"는 코드 상수로 처리(불필요한 78×N 행 방지).
- 구매 = `entitlements`에 행 하나 upsert. 트리거는 지금 개발용 버튼/함수, 나중엔
  결제 성공 웹훅. **스키마·RLS 불변.**

### 3.2 로컬 표현 (로컬 우선 유지)

엔타이틀먼트는 서버에서 온다(구매는 서버 사건). 로컬은 **서버 값의 캐시**다:

```ts
// src/lib/entitlements.ts (신규)
export type Entitlements = { ownedDeckIds: string[]; adFree: boolean };
const EMPTY: Entitlements = { ownedDeckIds: [], adFree: false };
```

- 게스트/미설정: 항상 `EMPTY`(클래식은 암묵 소유라 목록에 안 넣는다).
- 로그인: 서버에서 pull → localStorage 캐시(오프라인 표시용), `local-events`로 화면 갱신.
- 기존 store/journal과 같은 로컬 우선 + 동기화 패턴을 그대로 따른다.

## 4. 도감 = 소유 (순수 로직)

핵심 규칙 한 줄: **소유한 덱은 전량 수집, 아니면 비었다.**

```ts
// 클래식은 상수로 항상 소유. 프리미엄은 entitlements에 있을 때만.
export function ownsDeck(deckId: string, ent: Entitlements): boolean {
  return deckId === "classic" || ent.ownedDeckIds.includes(deckId);
}

// 도감 완성도. 소유면 그 덱의 전체 슬러그, 아니면 빈 집합.
export function collectedSlugs(deckId: string, ent: Entitlements): Set<string> {
  return ownsDeck(deckId, ent) ? ALL_78_SLUGS : new Set();
}
export function collectedCount(deckId: string, ent: Entitlements): number {
  return ownsDeck(deckId, ent) ? 78 : 0;
}
```

**B1은 이 정의로 자동 충족된다.** 완성도가 소유에서 나오므로, 미소유 프리미엄을
아무리 뽑아도(뽑기 기록은 남아도) 그 덱은 0/78이다. 구매로 소유가 켜지면 78/78.

이 `collectedCount`는 기존 `collectedCount(store, deckId)`(도감 항목 수 세기)를
**대체**한다 — 시그니처가 `(deckId, ent)`로 바뀌므로 호출부(컬렉션 덱 목록·덱 도감)는
엔타이틀먼트를 받도록 함께 고친다. MY의 옛 "수집" 호출부는 §5로 대체돼 사라진다.

### 4.1 뽑기 기록(만남)은 도감과 분리해 유지

지금 `recomputeCollection(readings)`가 만드는 덱×카드별 `{firstAt, count}` 맵은 이제
**완성도가 아니라 "만남의 기록"**이다 — `CollectHistory`("이 카드 처음 뽑은 날")가
쓴다. 함수는 유지하되 역할이 바뀌므로 **`recomputeEncounters`로 개명**한다. 완성도
계산에는 더 이상 관여하지 않는다.

- `store.collection`(현재 필드)은 이 만남 기록을 담는다(구조 그대로).
- 도감 완성도·"수집" 상태·덱 갤러리 잠금은 §4의 **소유**를 읽는다.
- `mergeStores`/`pullRemoteStore`의 `recomputeCollection(readings)` 호출은
  `recomputeEncounters(readings)`로 바뀔 뿐, 시그니처·정합성은 동일.

## 5. "함께한 날" 지표

MY의 "수집 n/78"을 **함께한 날**로 교체한다.

- **정의:** `readings`의 서로 다른 `localDate` 개수 = 카드를 뽑은 날 수.
- **서버 기록:** `readings`가 이미 서버 동기화되므로 **새 스키마 0.** 티어·이벤트는
  서버에서 `count(distinct local_date)`로 계산.
- **게스트:** 로컬 리딩으로 세다가 로그인 시 병합되며 서버 기록으로 승격.
- **표시:** 값은 **숫자만**, 라벨이 "날"을 담는다("함께한 날 · 127"). 모바일 타일
  가용폭 79px·글자 16.1px 기준 **4자리(9,999일 ≈ 27년)**까지 안전(측정치). 단위 "일"을
  붙이면 3자리(999일)에서 넘치므로 붙이지 않는다.

```ts
// src/lib/store.ts
export function togetherDays(store: ArcanaStore | null): number {
  if (!store) return 0;
  return new Set(store.readings.map((r) => r.localDate)).size;
}
```

MY 통계: **[함께한 날 · 리딩(회) · 기록(일)]**. 도감 페이지 자체는 갤러리로 남는다.

## 6. 구매 = 엔타이틀먼트 지급 (결제 스텁)

```ts
// 지금: 개발/수동 지급. 나중: 결제 성공 웹훅이 같은 upsert를 호출.
export async function grantDeck(deckId: string): Promise<void>;  // entitlements upsert + 로컬 갱신
```

- 이 하위 프로젝트에서는 **지급 로직과 그 효과(도감 78장 전환)**까지만 만든다.
- 스토어 화면·"구매하기" 버튼·가격·실결제는 하위 프로젝트 3.

## 7. 동기화

엔타이틀먼트를 기존 sync에 얹는다(collection/journal과 같은 골격):

- **pull(로그인·복귀):** `entitlements` + `profiles.ad_free` → 로컬 캐시. 실패 시 캐시 유지.
- **push:** 엔타이틀먼트는 **서버가 권위**(구매가 서버 사건)이므로 클라가 밀어 올리지
  않는다. pull 전용. 지급(`grantDeck`)만 서버에 쓴다.
- 로그아웃: 로컬 엔타이틀먼트 캐시도 비운다(기존 clear 경로에 추가).

## 8. 순수 로직 · 테스트 (node 환경)

새 순수 함수는 전부 유닛테스트(주입 가능, DOM 무관):

- `ownsDeck` / `collectedSlugs` / `collectedCount` — 클래식 암묵 소유, 프리미엄 소유/미소유.
- `togetherDays` — 중복 날짜 제거, 빈 스토어.
- `recomputeEncounters` — 기존 `recomputeCollection` 테스트 이관(역할만 개명).

## 9. 이 하위 프로젝트의 범위 밖 (뒤 프로젝트)

- **게스트 경계 UI**(원카드/클래식/일기 잠금·유도) — 하위 프로젝트 2
- **/login 독립 페이지** — 하위 프로젝트 2
- **덱 스토어·구매 버튼·프리미엄 소개** — 하위 프로젝트 3
- **광고 배너/전면 슬롯** — 하위 프로젝트 3
- **Supabase 실설정**(프로젝트·OAuth·마이그레이션·`.env.local`) — 하위 프로젝트 4(사용자)
- **실결제(PG/인앱)** — payment-agnostic로 설계됨, 별도

## 10. 미해결/가정

- 미소유 프리미엄 덱의 도감 **그리드 표시**(전부 뒷면 잠금 vs 만난 카드만 공개)는
  하위 프로젝트 3에서 확정. 이 문서의 완성도 정의(소유 이진)는 "전부 잠금"을 함의하나,
  최종 UI는 그때 판단.
- `ad_free`의 "오늘의 타로 3슬롯"은 `blockingReading(maxDailySlots)` 인자가 이미
  받으므로 배선만 남음 — 하위 프로젝트 3에서 연결.
