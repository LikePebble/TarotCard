# Fonts

## HeirofLight (빛의 계승자체) — display / titles

- Source: 게임빌·컴투스 공식 배포 (heiroflighteclipse.com2us.com), 원 저작권 FUNFLOW · 산돌 커뮤니케이션즈.
- Files here are **subsets** of the OTF originals (Regular/Bold), limited to KS X 1001 완성형
  2,350자 + Basic Latin + 문장부호, converted to woff2.
  - `HeirofLight-Regular.woff2` — weight 400
  - `HeirofLight-Bold.woff2` — weight 700
- License: 상업적 이용 무료. **임베딩은 조건부 허용** — 게임 관련 디바이스/프로그램
  임베딩은 권리자 서면 동의 필요. 본 프로젝트는 해당 서면 동의를 확보함
  (동의서는 프로젝트 관리자 보관). 근거 없이 재배포/수정/유료판매 금지.

## Chosun Centennial (조선일보명조체) — UI / 안내 문구

- `Chosun-Regular.woff2` — weight 400. KS X 1001 서브셋.
- Source: 조선일보 창간 100주년 기념 서체. 상업적 이용 무료.
- `--font-sans` 토큰에 매핑(UI 기본 폰트). 단일 굵기라 굵은 UI 텍스트는 합성 볼드.

Nanum Myeongjo (본문 해석문)은 Google Fonts(`next/font/google`)에서 로드하므로 파일을 두지 않는다.

(구 UI 폰트 Wanted Sans는 제거됨. 되돌리려면 git 이력 참조.)
