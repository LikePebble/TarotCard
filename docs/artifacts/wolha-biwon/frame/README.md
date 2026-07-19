# 월하비원 프레임 디자인 산출물

이 디렉터리는 월하비원 타로 덱 공통 프레임의 디자인 결정, 생성 프롬프트,
타이포그래피 토큰과 QA 증거를 보존하기 위한 문서 패키지다.

## 선택 결과

- 최종 선택안: `08-plum-bamboo-asymmetry` — 매죽 비대칭
- 생성 방식: Codex 내장 이미지 생성
- 기준 캔버스: 1200 × 2040 px, 1:1.7
- 디자인 토큰 버전: 1.0.3
- 한글 카드명 기준선: y=1900
- 영문 카드명 기준선: y=1930
- 메이저 아르카나 번호 기준선: y=80
- 마이너 아르카나는 번호 레이어를 렌더링하지 않는다.

## 중요한 런타임 경계

`selected-mockup-no-text.png`는 선택된 디자인을 확인하기 위한 완성 카드 시안이다.
1200 × 2040 RGB 이미지이며 중앙에 여사제 원화가 포함되어 있고 알파 채널이 없다.

따라서 이 파일을 다음 런타임 위치에 복사하면 안 된다.

```text
public/decks/wolha-biwon/frame.png
```

런타임 `frame.png`는 매죽 비대칭 장식만 남기고 중앙이 투명한 별도 RGBA PNG로
제작해야 한다. 이 디렉터리는 `docs/artifacts`용이며 런타임 자산 패키지가 아니다.

## 파일 구성

```text
frame/
├── README.md
├── generation-manifest.json
├── selected-prompt.md
├── prompt-set.md
├── design-tokens.json
├── typography-spec.md
├── render-manifest.json
├── generation-verification.json
├── typography-verification.json
├── selected-mockup-no-text.png
└── qa/
    ├── layout-guide.png
    ├── typography-comparison.jpg
    ├── renders/
    │   ├── the-high-priestess.png
    │   ├── wheel-of-fortune.png
    │   └── four-of-pentacles.png
    └── previews/
        ├── the-high-priestess.webp
        ├── wheel-of-fortune.webp
        └── four-of-pentacles.webp
```

## QA 범위

- 메이저 단문: `II · 여사제 / THE HIGH PRIESTESS`
- 메이저 장문: `X · 운명의 수레바퀴 / WHEEL OF FORTUNE`
- 마이너: `펜타클 4 / FOUR OF PENTACLES`, 상단 번호 없음
- 1200 × 2040 고해상도 렌더 3장
- 600 × 1020 WebP 미리보기 3장
- 번호·제목 안전영역과 기준선 검증

## 원 프로젝트로 이관

이 디렉터리 자체를 다음 위치로 복사한다.

```text
TarotCard/docs/artifacts/wolha-biwon/frame/
```

예시:

```bash
mkdir -p /Volumes/DevProjects/projects/TarotCard/docs/artifacts/wolha-biwon
cp -R frame /Volumes/DevProjects/projects/TarotCard/docs/artifacts/wolha-biwon/
```

기존 대상 디렉터리가 있을 경우 덮어쓰기 전에 변경 내용을 확인한다.

## 재현 정보

- 전체 시안 프롬프트 요약: `prompt-set.md`
- 매죽 비대칭 실제 생성 프롬프트: `selected-prompt.md`
- 타이포그래피 수치: `design-tokens.json`
- 렌더 입력과 QA 카드: `render-manifest.json`
- 파일·규격 검증: `generation-verification.json`, `typography-verification.json`

