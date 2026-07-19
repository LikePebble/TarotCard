# 매죽 비대칭 선택안 생성 프롬프트

## 입력 이미지 역할

- Image 1: 사용자가 제공한 프리미엄 타로 카드 레퍼런스. 장식 밀도와 세공 품질만 참고한다.
- Image 2: 월하비원 `the-high-priestess.webp`. 프레임을 적용할 편집 대상이다.

## 생성 프롬프트

```text
Use case: precise-object-edit.

Image 1 is a reference for premium engraved detail; Image 2 is the edit target.
Preserve Image 2's adult Korean woman, exact identity, face, anatomy, pose, hands,
garment, scroll, columns, pomegranate veil, crescents, garden and lighting.
Change only frame and blank title/number surfaces.

Concept 08 — PLUM AND BAMBOO ASYMMETRY: an editorial luxury Korean tarot frame
with controlled asymmetry. A slender ink-black lacquer and moon-silver border;
a flowering plum branch climbs from lower left and a finely engraved bamboo spray
descends from upper right, balanced by tiny nacre petals, silver dew beads,
ornamental knots and subtle changho geometry. Decorative detail is exquisite and
layered like Image 1, but negative space keeps it elegant. Opposite corners use
quiet etched metal and translucent smoked glass to balance the organic branches.

Blank top cartouche and blank bottom title cartouche; bottom plaque is shaped like
overlapping translucent silk leaves with dark pearl edges, allowing the art to
remain softly visible and never appearing as a rectangular UI bar. Ornament stays
within outer 6%; face, hands, scroll and crescent clear. Ink, ivory, wine,
moon silver, small antique-gold accents. Vertical 1:1.7 premium collectible card.

No text, letters, numbers, logo, watermark, signature. Avoid flat vector, plain
geometric blocking, opaque panel, excessive florals, random stars, European
baroque, added characters or anatomy changes.
```

## 후처리

- 생성 시안은 1200 × 2040으로 정규화했다.
- 생성 이미지 안에는 텍스트를 넣지 않았다.
- 번호와 카드명은 `design-tokens.json`을 사용하는 별도 SVG 텍스트 레이어로 합성했다.
- 확정 기준선은 번호 y=80, 한글 y=1900, 영문 y=1930이다.

