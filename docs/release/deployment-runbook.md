# Arca 배포 지침

## 배포 경로

```text
feature branch
  → GitHub Ready PR
  → Vercel Preview
  → 회귀 테스트 승인
  → squash merge to main
  → Vercel Production
  → 운영 스모크 테스트
```

- 현재 운영 확인 주소는 `https://arcatarot.vercel.app`이다.
- 향후 정식 서비스 주소는 `https://arca.realm.ai.kr`이며 DNS 연결 후 동일한
  Production 배포를 가리키게 한다.
- Vercel은 `main` 머지를 감지해 프런트엔드를 자동 배포한다.
- Supabase SQL 마이그레이션은 Vercel 배포와 별개다. 필요한 경우 앱 배포 전에
  운영 DB 적용 여부와 스키마 테스트를 따로 확인한다.

## 환경변수

Vercel Preview와 Production에 각각 아래 값을 관리한다.

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_ENABLE_RELEASE_TEST_TOOLS
```

`NEXT_PUBLIC_ENABLE_RELEASE_TEST_TOOLS`의 원칙:

- 로컬 개발: 값 없이도 테스트 도구가 보인다.
- 결제 전 Preview/제한된 Production 검증: `true`.
- 공개 상용화: 삭제하거나 `false`.
- 이 도구는 로컬 엔타이틀먼트 지급·회수와 리딩 리셋을 허용하므로 공개 출시에서
  `true`로 남겨두면 안 된다.
- 값을 바꾼 뒤에는 새 배포가 필요하다. `NEXT_PUBLIC_*` 값은 빌드 결과에 포함된다.

## 배포 전 절차

1. 원격 `main`을 갱신하고 전용 브랜치를 만든다.
2. `git status --short`로 사용자 작업과 출시 변경을 구분한다.
3. 필요한 파일만 명시적으로 스테이징한다.
4. [배포 전 회귀 테스트](./pre-deployment-checklist.md)를 수행한다.
5. 정확한 커밋 SHA의 빌드와 Vercel Preview를 확인한다.
6. 수동 시나리오 승인 후 squash merge한다.
7. Production 상태와 운영 주소를 확인한다.

## 이번 배포에서 확인된 재발 방지 항목

### 1. 로컬 개발 성공은 운영 노출을 보장하지 않는다

`process.env.NODE_ENV !== "production"` 조건은 로컬에서만 참이다. 개발자 기능을
운영 검증에도 써야 한다면 명시적인 출시 테스트 플래그를 Preview/Production에
설정하고, 실제 배포 화면에서 노출 여부를 확인한다.

### 2. 한 상태만 확인하면 권한 UI 오류를 놓친다

프리미엄 덱은 최소 `게스트 리딩 → 로그인 전 잠금 유지 → 로그인 → 만난 카드 열림
→ 지급 → 78장 열림 → 회수` 순서로 검증한다. 계정은
`미로그인 → OAuth 로그인 → 계정 표시 → 로그아웃`을 한 세트로 본다.

### 3. 테스트는 커밋 스냅샷 기준으로 수행한다

작업 폴더에는 `.env`, PDF, 이미지 실험, 패키지 변경이 남아 있을 수 있다. 현재
worktree 빌드만 통과하면 PR에 없는 파일의 도움을 받은 결과일 수 있으므로, 깨끗한
임시 worktree 또는 CI에서 PR head SHA를 빌드한다.

### 4. Next.js 빌드는 외부 폰트 네트워크에 영향을 받을 수 있다

Google Fonts DNS 실패는 애플리케이션 타입·테스트 실패와 구분한다. 네트워크가 허용된
환경에서 같은 SHA로 재검증한다. 반복되면 폰트 자체 호스팅을 별도 개선 과제로 둔다.

### 5. Vercel 상태는 즉시 확정되지 않는다

GitHub status가 `pending`인 동안 merge하지 않는다. Preview `success`를 확인하고
merge한 뒤, 새 `main` SHA의 Production status도 별도로 `success`가 될 때까지 본다.

### 6. GitHub 원격 추적 브랜치는 자동으로 갱신되지 않을 수 있다

앱/커넥터에서 merge하면 로컬 `origin/main`이 이전 SHA를 가리킬 수 있다.
후속 브랜치를 만들기 전에 `git fetch origin main`으로 기준을 갱신한다.

### 7. 정적 HTML만으로 클라이언트 상태 UI를 판정하지 않는다

컬렉션 권한과 계정 상태는 hydration 이후 결정된다. `curl`은 HTTP·메타데이터·자산
확인에 쓰고, 지급/로그인/모달/CTA는 Preview 브라우저에서 상호작용해 확인한다.

## 운영 스모크 테스트

```bash
curl -I https://arcatarot.vercel.app/
curl -I https://arcatarot.vercel.app/decks/wolha-biwon/deck-cover.webp
curl -I https://arcatarot.vercel.app/decks/k-pop-museverse/deck-cover.webp
```

- 홈은 HTTP 200이고 메타데이터가 `아르카 | Arca`다.
- 두 커버는 HTTP 200과 `content-type: image/webp`다.
- 브라우저에서 MY 로그인 상태와 프리미엄 덱 지급·기본 설정을 별도로 확인한다.

## 실패와 롤백

- Preview 실패: merge하지 않고 해당 PR에서 수정한다.
- Production 실패: 실패 원인을 확인하고 이전 정상 커밋으로 되돌리는 revert PR을
  만든다. DB 마이그레이션이 포함됐다면 앱만 되돌리지 말고 호환성을 먼저 확인한다.
- 인증/권한 이상: Supabase 설정과 Vercel 환경변수를 먼저 확인하고, 사용자 데이터를
  직접 수정하지 않는다.
- 공개 출시 전 `NEXT_PUBLIC_ENABLE_RELEASE_TEST_TOOLS=false`를 최종 체크한다.
