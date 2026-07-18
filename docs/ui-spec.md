# UI 구성·규격 명세 (리디자인 가이드)

화면 레이아웃은 추후 별도 시안으로 리디자인될 예정이다. 이 문서는 **디자인을 갈아끼울 때 무엇을 바꿔도 되고(자유 영역), 무엇을 지켜야 하는지(계약 영역)** 를 정의한다.

## 1. 파일 구조와 역할 분리

```
public/
├── styles/
│   ├── tokens.css      ← 디자인 토큰. 리디자인 시 1차 교체 대상
│   └── reading.css     ← 컴포넌트 스타일. 토큰만 참조. 자유롭게 재작성 가능
├── js/
│   ├── reading.js      ← 리딩 플로우 로직. 디자인과 무관, 훅 계약만 지키면 됨
│   └── calendar.js     ← 캘린더 로직. 상동
├── reading.html        ← 마크업. 훅(id)만 유지하면 구조 변경 가능
└── calendar.html
```

**원칙**: JS는 `id` / `data-*` 속성만 참조한다. **클래스명과 DOM 구조는 디자인 소유물**이므로 시안에 맞춰 자유롭게 변경한다. 스타일 값(색·간격·서체)은 반드시 `tokens.css` 변수를 거친다.

## 2. 디자인 토큰 (`tokens.css`)

리디자인 시 이 파일의 값만 바꾸면 전체 룩이 바뀐다. 토큰 카테고리:

| 카테고리 | 토큰 | 용도 |
|---|---|---|
| Surface | `--surface-0/1/2`, `--surface-veil` | 배경 위계 |
| Brand | `--brand`, `--brand-soft`, `--brand-2` | 주·보조 강조색 |
| Text | `--text`, `--text-muted`, `--text-on-brand` | 텍스트 위계 |
| Semantic | `--positive`(정방향), `--caution`(역방향) | 상태색. **브랜드색과 분리 유지** |
| Typography | `--font-body`, `--fs-*` | 서체·타입 스케일 |
| Spacing | `--sp-1`~`--sp-6` | 4px 기반 간격 스케일 |
| Radius | `--radius-card/panel/pill/btn` | 모서리 |
| Card | `--card-ratio`, `--card-w-*`, `--fan-overlap` | 카드 지오메트리 |
| Motion | `--ease-fast/med` | 트랜지션 |

## 3. 카드 아트 규격 (신규 캐릭터 디자인용)

| 항목 | 규격 |
|---|---|
| **비율** | **4:7** (CSS `--card-ratio`로 강제, `object-fit: cover`) |
| 권장 원본 | 800 × 1400 px 이상, JPEG/WebP |
| 현재 플레이스홀더 | RWS 원본 (약 300×535 ~ 746×1302, 비율 유사 — cover로 흡수) |
| 세이프존 | 역방향 시 180° 회전 표시되므로 상하 비대칭 정보(텍스트 등)는 중앙 60%에 배치 권장 |
| 카드 뒷면 | 현재 CSS 그라디언트. 아트 교체 시 `.tarot-card-back`/`.f-card` 배경만 교체 |
| 미디어 확장 | 카드 데이터의 `media[]` 배열: `{ type: "image"\|"video"\|"audio", url }`. 영상·사운드 재생은 이 배열을 소비하도록 프론트 확장 |

**교체 방법**: `images/` 파일 교체 + `data/cards/*.json`의 `image`·`media[]` 경로 갱신. 코드 수정 불필요.

## 4. 화면 구성 (리딩 플로우)

5단계 스텝 진행형. 스텝 상태는 `.active`(진행 중) / `.done`(완료) 클래스로 표현 — **이 두 상태 클래스는 JS가 제어하므로 유지 필수**, 시각 표현은 자유.

| 스텝 | 구성 요소 | 상태/인터랙션 |
|---|---|---|
| 1. 테마 선택 | 칩 그룹 (7종: 종합·연애·금전·직장/사업·학업·건강·대인관계) | 단일 선택 → `.selected` |
| 2. 뽑기 방식 | 칩 그룹 (한 장 / 과거·현재·미래) | 단일 선택 |
| 3. 카드 섞기 | 덱 비주얼(탭 가능) + 탭 카운터 + 완료 버튼 | 탭 횟수·리듬 = 킥 파라미터 |
| 4. 카드 뽑기 | 스프레드 슬롯(1 or 3) + 뒷면 78장 부채꼴(가로 스크롤) | 카드 클릭 → 슬롯 채움. 다음 슬롯 `.next`, 채워진 슬롯 `.filled`, 뽑힌 카드 `.taken` |
| 5. 결과 | 결과 카드(포지션·정/역 배지·키워드·테마 해석·종합 해석 접기) + 메모 저장 패널 + 프리미엄 질문 패널 | 역방향 이미지는 `.reversed`(180° 회전) |

캘린더 화면: 월 네비게이션 + 7열 그리드(기록 있는 날 표시) + 날짜 선택 시 상세 패널(카드 썸네일·메모 편집·삭제).

## 5. JS 훅 계약 (변경 금지 목록)

reading.html: `stepTheme` `stepSpread` `stepShuffle` `stepPick` `stepResult` `themeChips` `spreadChips` `shuffleDeck` `kickCount` `shuffleDone` `slots` `fan` `pickHint` `results` `afterPanels` `journalPanel` `memoInput` `saveJournal` `saveStatus` `premiumPanel` `premiumQuestion` `premiumAsk` `premiumStatus` `premiumResult` `restart`

calendar.html: `monthTitle` `prevMonth` `nextMonth` `calGrid` `entryPanel` `entryDate` `entryMeta` `entryCards` `entryMemo` `entrySave` `entryDelete` `entryStatus`

JS가 생성하는 동적 요소의 계약 클래스: `.chip.selected`, `.slot(.next/.filled)`, `.f-card(.taken)`, `.result-card`, `.reversed`, `.cal-day(.has-entry/.today/.selected)` — 이름 변경 시 JS도 함께 수정.

## 6. 반응형 기준

- 컨테이너 최대폭 900px (캘린더·리딩 공통)
- 브레이크포인트: 560px 이하에서 결과 카드·슬롯 축소
- 부채꼴 덱은 자체 가로 스크롤(`overflow-x`) — 페이지 가로 스크롤 금지
- `prefers-reduced-motion` 대응 필수 (현재 전체 애니메이션 비활성 처리)

## 7. API 연동 요약 (프론트가 소비하는 계약)

| 호출 | 용도 |
|---|---|
| `GET /readings/meta` | 테마·스프레드 목록 (칩 구성) |
| `POST /readings` `{theme, spread, kick}` | 셔플 세션 생성. kick = `{tapCount, rhythm[], finishedAt}` (정의 확정 전 임시 스펙) |
| `POST /readings/:id/draw` `{deckIndex}` | 위치 뽑기 → 카드+해석 |
| `POST /readings/:id/premium` `{question}` (X-User-Id) | LLM 맞춤 해석 |
| `POST /users` → `GET/PUT/DELETE /journal/*` (X-User-Id) | 익명 계정·캘린더 기록 |

모든 서버 호출은 `reading.js`의 `api` 객체 한 곳을 경유한다 — 자체 완결형(Artifact) 빌드는 `window.__mockApi`로 이 객체를 교체한다.
