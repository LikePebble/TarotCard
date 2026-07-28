# 아르카 (Arca)

한국어 타로 웹앱. 78장을 뽑아 정방향·역방향과 주제별 해석을 읽고, 만난 카드를
도감에 모으고, 그날의 기록을 일기로 남긴다. 운영: https://arca.realm.ai.kr

Next.js 15 App Router · React 19 · Tailwind 4 · TypeScript · Vitest ·
Supabase(인증·동기화) · Vercel(호스팅)

> `legacy/`의 Express 앱은 이 서비스의 전신이다. 지금 돌아가는 코드가 아니다.

## 먼저 읽을 것

이 리포에는 **결정 로그와 용어집이 스펙 문서 안에** 있다. 작업 전에 관련된 것을
찾아 읽는다. 읽지 않으면 이미 닫힌 결정을 결함으로 다시 집어들게 된다.

| 문서 | 무엇이 있나 |
|---|---|
| `docs/superpowers/specs/2026-07-19-arcana-ia-design.md` | **사실상의 ADR이자 용어집.** 결정 로그 D1~D15, Ubiquitous Language, §10 카피 가이드(금지/권장) |
| `docs/superpowers/specs/` | 기능별 설계. 파일명이 `YYYY-MM-DD-주제-design.md` |
| `docs/superpowers/plans/` | 그 설계의 실행 계획. 태스크 단위와 검증 방법 |
| `docs/release/pre-deployment-checklist.md` | **머지 전 통과해야 하는 출시 게이트.** 자동 테스트만 통과해서는 배포하지 않는다 |
| `docs/release/deployment-runbook.md` | 배포 절차와 롤백 |
| `docs/handoff-*.md` | 세션 간 인수인계. 가장 최근 것이 현재 상태에 가장 가깝다 |
| `docs/marketing-audit-2026-07-28.md` | 마케팅 감사와 그 정정. 감사 결론 중 철회된 것이 있으니 §0.5를 먼저 볼 것 |

**문서가 코드와 어긋나면 코드가 정본이다.** 다만 어긋난 사실을 발견하면 문서를
고쳐 두어라. 이 리포는 그 어긋남 때문에 이미 여러 번 같은 실수를 반복했다.

### 도메인 문서 스킬 안내

`docs/agents/domain.md`는 루트 `CONTEXT.md`와 `docs/adr/`을 읽으라고 하지만
**이 리포에는 둘 다 없다.** 그 자리를 위 표의 `specs/`가 대신한다.

## 손대기 전에 알아야 할 규약

### 빌드·테스트

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/vitest run
```

- **개발 서버가 떠 있는 동안 `npm run build`를 돌리지 말 것.** dev와 build가 같은
  `.next`를 쓰는데 내용이 호환되지 않아 CSS가 통째로 비는 등, 코드 버그처럼 보이는
  증상이 생긴다. 빌드했다면 dev 서버를 띄우기 전에 `.next`를 지운다.
- `npx`는 이 환경에서 죽는다. 위처럼 직접 경로를 쓴다.
- React 컴포넌트는 유닛테스트하지 않는다. `tsc` + 순수 로직 테스트 + 브라우저 확인.
- 순수 로직은 `src/lib/*.ts`에 두고 같은 이름의 `*.test.ts`를 붙인다.
- 정적 HTML만으로 클라이언트 상태 UI를 판정하지 않는다. `curl`은 HTTP·메타데이터·
  자산 확인용이고, 권한·로그인·모달은 브라우저에서 상호작용해 확인한다.

### 해석문 저작

`src/data/`의 한국어 해석문은 **원전 감사를 통과한 정본이다. 전면 재작성 금지.**

- 톤: 겁주지 않는 성찰적 존댓말. 예언 단정("~할 것입니다") 금지.
- 금지 카피가 `arcana-ia-design.md` §10에 있다. "운명이 이 카드로 결정됐다" 류.
- 출처는 Waite(1911)·Mathers(1888). 문장 이식 금지, 뜻만 가져와 새로 쓴다.
- 아트 중립 서술: 로어 1벌이 프리미엄 덱 상세에도 그대로 나가므로 "그림 속 절벽"이
  아니라 "절벽 끝의 발걸음"으로 쓴다.
- 변형 텍스트가 정본 문장을 재사용하면 테스트가 실패한다.

### 카드 아트

아트는 이 리포에서 고칠 수 없다. 별도 파이프라인에서 프레임·번호·카드명까지 구워져
나오고 앱은 배치만 한다. 명패가 틀렸다면 `docs/deck-title-ko-fixes.md`가 작업지시다.
월하비원의 달 표현 규칙은 `docs/wolha-biwon-moon-iconography-policy.md`에 있다.

### 결정을 바꿀 때

**원문을 지우지 않는다.** 취소선이나 "→ 철회" 표시를 남기고 이유를 적는다.
결정이 바뀐 기록이 결정 자체보다 유용하다.

## Agent skills

### 이슈 트래커

`docs/agents/issue-tracker.md`는 `.scratch/<feature-slug>/`를 가리키지만, 실제 스펙과
플랜은 `docs/superpowers/`에 있다. `.scratch/`는 데이터 저작 작업의 중간 산출물
(프롬프트·JSON·조립 스크립트) 보관에 쓰인다.

### 트리아지 라벨

기본 라벨: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`,
`wontfix`. `docs/agents/triage-labels.md` 참조.
