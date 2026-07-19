# 렌더러 폰트

`render.mjs`는 두 폰트를 사용한다.

- **Wanted Sans** (영문 카드명): `wanted-sans` npm 패키지에서 자동 참조한다. 별도 다운로드 불필요.
- **Noto Serif KR** (한글 카드명, 로마 숫자): 아래 파일이 이 디렉터리에 있어야 한다.

```
tools/decks/wolha-biwon/fonts/NotoSerifKR-SemiBold.ttf
```

용량이 커서 저장소에는 포함하지 않는다(.gitignore). 다음으로 내려받는다.

```bash
curl -sSL -o tools/decks/wolha-biwon/fonts/NotoSerifKR-SemiBold.ttf \
  "https://cdn.jsdelivr.net/fontsource/fonts/noto-serif-kr@latest/korean-600-normal.ttf"
```

파일이 없으면 렌더러가 이 안내와 함께 종료한다.
