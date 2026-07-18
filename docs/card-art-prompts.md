# 카드별 아트 명세 프롬프트 (78장)

> 공통 규격·세이프존·파일 규칙은 `docs/card-art-spec.md` 참고. 이 문서는 `data/art/*.json`에서 자동 생성된다 — 수정은 JSON에서.
>
> **promptEn 사용법**: `{STYLE}`을 확정된 스타일 문자열로 치환해 이미지 생성에 사용. 네거티브 프롬프트에 `text, letters, numbers, watermark` 권장.

---

## 메이저 아르카나

### 바보 (The Fool) — `the-fool`

- **본질**: 아무것도 정해지지 않은 출발선의 자유
- **장면**: 주인공 캐릭터가 절벽 끝에서 하늘을 향해 고개를 들고 가볍게 발을 내딛기 직전이다. 어깨에 멘 막대 끝에 작은 보따리가 매달려 있고, 한 손에는 흰 장미를 들었다. 발치에서 작은 동물이 함께 뛰며 화면 위쪽에는 밝은 태양이 빛난다.
- **필수 상징**: 절벽 끝 · 막대에 매단 보따리 · 흰 장미 · 따르는 작은 동물 · 밝은 태양
- **무드**: 설렘과 순수, 맑은 아침 빛 / **팔레트**: 밝은 노랑과 하늘색 중심의 경쾌한 톤
- **생성 프롬프트**:
  > The main character stepping lightly toward the edge of a cliff, head lifted to the sky, carrying a small bundle on a stick over one shoulder and a white rose in hand, a small animal companion leaping at their feet, bright sun above, joyful carefree morning light, centered subject, vertical card composition, {STYLE}

### 마법사 (The Magician) — `the-magician`

- **본질**: 이미 손안에 있는 도구와 실현의 의지
- **장면**: 주인공 캐릭터가 탁자 앞에 서서 한 손은 하늘을, 다른 손은 땅을 가리키고 있다. 탁자 위에는 지팡이·잔·검·오각별 동전 네 가지 도구가 놓여 있고, 머리 위에는 무한대 기호가 빛난다. 주변에는 붉은 장미와 흰 백합이 피어 있다.
- **필수 상징**: 하늘과 땅을 잇는 양손 자세 · 탁자 위 네 도구(지팡이·잔·검·오각별 동전) · 머리 위 무한대 기호 · 붉은 장미와 흰 백합
- **무드**: 확신에 찬 집중, 선명한 한낮의 빛 / **팔레트**: 붉은색과 순백, 금빛 포인트
- **생성 프롬프트**:
  > The main character standing before a table, one hand raising a wand toward the sky while the other points to the ground, four tools laid on the table - a wand, a cup, a sword and a pentacle coin, an infinity symbol glowing above their head, red roses and white lilies blooming around, confident focused daylight, centered subject, vertical card composition, {STYLE}

### 여사제 (The High Priestess) — `the-high-priestess`

- **본질**: 고요 속에 감춰진 직관의 지혜
- **장면**: 여사제의 신비를 지닌 주인공 캐릭터가 밝은 기둥과 어두운 기둥 사이에 고요히 앉아 있다. 무릎 위에는 반쯤 감춰진 두루마리를 얹고 발치에는 초승달이 놓여 있으며, 머리에는 달 모양 관을 썼다. 뒤편에는 석류 무늬 장막이 드리워 있고 그 너머로 잔잔한 물이 비친다.
- **필수 상징**: 흑백의 두 기둥 · 반쯤 감춰진 두루마리 · 발치의 초승달 · 달 모양 관 · 석류 무늬 장막 · 장막 너머의 잔잔한 물
- **무드**: 신비로운 정적, 서늘한 달빛 / **팔레트**: 깊은 파랑과 은백색의 차분한 톤
- **생성 프롬프트**:
  > The main character embodying the high priestess archetype seated serenely between a light pillar and a dark pillar, a half-hidden scroll resting on their lap, a crescent moon at their feet, wearing a moon crown, a veil patterned with pomegranates hanging behind and calm water glimpsed beyond it, mysterious still moonlit silence, cool silvery-blue night, centered subject, vertical card composition, {STYLE}

### 여황제 (The Empress) — `the-empress`

- **본질**: 무르익은 결실과 따뜻한 돌봄의 품
- **장면**: 여황제의 풍요를 지닌 주인공 캐릭터가 무성한 숲과 시냇물을 등지고 푹신한 옥좌에 편안히 기대어 있다. 머리에는 별 열두 개로 이루어진 관을 쓰고, 옥좌 곁에는 하트 모양 방패가 세워져 있다. 발아래로는 황금빛 밀밭이 넉넉하게 펼쳐진다.
- **필수 상징**: 별 열두 개의 관 · 하트 모양 방패 · 황금빛 밀밭 · 흐르는 시냇물과 숲 · 푹신한 옥좌
- **무드**: 풍요로운 편안함, 따뜻한 오후 햇살 / **팔레트**: 따뜻한 초록과 밀밭의 금색
- **생성 프롬프트**:
  > The main character embodying the empress archetype reclining at ease on a cushioned throne, wearing a crown of twelve stars, a heart-shaped shield resting beside the throne, a lush forest and flowing stream behind, a ripe golden wheat field spreading in the foreground, warm nurturing abundance, gentle afternoon sunlight, centered subject, vertical card composition, {STYLE}

### 황제 (The Emperor) — `the-emperor`

- **본질**: 흔들리지 않는 기반과 질서의 권위
- **장면**: 황제의 위엄을 지닌 주인공 캐릭터가 숫양 머리 장식이 새겨진 석조 옥좌에 정면으로 앉아 있다. 한 손에는 홀을, 다른 손에는 보주를 들고 갑옷 위에 붉은 망토를 둘렀다. 뒤편으로는 험준한 붉은 바위산이 굳건하게 솟아 있다.
- **필수 상징**: 숫양 머리 장식의 석조 옥좌 · 홀과 보주 · 갑옷과 붉은 망토 · 붉은 바위산 배경
- **무드**: 단단한 위엄, 붉게 물든 정오의 빛 / **팔레트**: 짙은 붉은색과 회색 석조 톤
- **생성 프롬프트**:
  > The main character embodying the emperor archetype seated squarely on a stone throne carved with ram heads, holding a scepter in one hand and an orb in the other, armor showing beneath a deep red mantle, rugged red rocky mountains rising behind the throne, firm commanding presence, strong steady midday light, centered subject, vertical card composition, {STYLE}

### 교황 (The Hierophant) — `the-hierophant`

- **본질**: 전통이 건네는 검증된 가르침
- **장면**: 교황의 권위를 지닌 주인공 캐릭터가 두 기둥 사이 단상에 앉아 삼중 십자 지팡이를 들고 축복의 손짓을 하고 있다. 머리에는 삼중관을 쓰고 발치에는 교차된 두 개의 열쇠가 놓여 있다. 단 아래에는 가르침을 청하는 두 작은 캐릭터가 등을 보이며 앉아 있다.
- **필수 상징**: 삼중관 · 삼중 십자 지팡이 · 축복의 손짓 · 교차된 두 열쇠 · 두 기둥 · 경청하는 두 캐릭터
- **무드**: 엄숙한 안정감, 성소의 은은한 빛 / **팔레트**: 붉은 예복과 회백색 석조의 대비
- **생성 프롬프트**:
  > The main character embodying the hierophant archetype seated on a raised dais between two pillars, wearing a triple crown, one hand lifted in blessing and the other holding a triple cross staff, two crossed keys lying at their feet, two smaller characters seated below listening reverently, solemn sanctuary calm, soft warm interior light, centered subject, vertical card composition, {STYLE}

### 연인 (The Lovers) — `the-lovers`

- **본질**: 진심이 이끄는 선택과 마음의 조화
- **장면**: 주인공 캐릭터가 또 다른 캐릭터와 마주 보며 서로에게 손을 내밀고 있다. 두 캐릭터의 머리 위로 커다란 날개를 펼친 축복의 존재가 구름 사이에서 두 팔을 벌리고, 그 위에서 밝은 태양이 빛난다. 한쪽 뒤에는 뱀이 감긴 열매 나무가, 다른 쪽 뒤에는 불꽃 모양 잎의 나무가 서 있다.
- **필수 상징**: 마주 선 두 캐릭터 · 날개를 펼친 축복의 존재 · 뱀이 감긴 열매 나무 · 불꽃 모양 잎의 나무 · 밝은 태양
- **무드**: 설레는 교감, 눈부신 한낮 / **팔레트**: 맑은 하늘색과 초록, 금빛 햇살
- **생성 프롬프트**:
  > The main character and a second character facing each other and reaching out their hands, a great winged figure with open arms blessing them from parted clouds above, a bright sun shining overhead, a fruit tree with a coiled serpent behind one character and a tree of flame-shaped leaves behind the other, radiant harmonious midday warmth, centered subjects, vertical card composition, {STYLE}

### 전차 (The Chariot) — `the-chariot`

- **본질**: 고삐를 쥔 의지가 이끄는 승리
- **장면**: 주인공 캐릭터가 별이 수놓인 차양 아래 갑옷을 입고 전차 위에 당당히 서 있다. 전차 앞에는 흑백의 두 스핑크스가 서로 다른 쪽을 바라보며 엎드려 있고, 캐릭터는 홀을 쥔 채 정면을 응시한다. 뒤편으로는 성벽으로 둘러싸인 도시와 강이 펼쳐진다.
- **필수 상징**: 전차 · 흑백의 두 스핑크스 · 별이 수놓인 차양 · 갑옷과 홀 · 성벽 도시와 강 배경
- **무드**: 결연한 추진력, 맑고 강한 아침 빛 / **팔레트**: 청회색 갑주와 금빛, 흑백 대비
- **생성 프롬프트**:
  > The main character in armor standing tall in a chariot beneath a canopy embroidered with stars, holding a scepter and gazing straight ahead, one black sphinx and one white sphinx crouched before the chariot facing slightly apart, a walled city and a river stretching in the background, determined forward-driving momentum, clear strong morning light, centered subject, vertical card composition, {STYLE}

### 힘 (Strength) — `strength`

- **본질**: 부드러움으로 다스리는 진짜 용기
- **장면**: 주인공 캐릭터가 두려움 없는 온화한 표정으로 사자의 머리를 감싸며 입을 부드럽게 어루만지고 있다. 캐릭터의 머리 위에는 무한대 기호가 떠 있고, 허리와 머리에는 꽃으로 엮은 화환을 둘렀다. 배경에는 평화로운 들판과 낮은 산이 이어진다.
- **필수 상징**: 사자의 입을 어루만지는 손길 · 머리 위 무한대 기호 · 꽃 화환과 꽃 허리띠 · 평화로운 들판과 낮은 산
- **무드**: 고요한 확신, 부드러운 황금빛 오후 / **팔레트**: 따뜻한 크림색과 황금빛
- **생성 프롬프트**:
  > The main character gently cradling a lion's head and softly closing its jaws with calm fearless tenderness, an infinity symbol floating above the character's head, garlands of flowers woven around their waist and hair, a peaceful meadow and a low mountain in the background, quiet inner confidence, soft golden afternoon light, centered subject, vertical card composition, {STYLE}

### 은둔자 (The Hermit) — `the-hermit`

- **본질**: 홀로 밝힌 등불이 비추는 한 걸음
- **장면**: 주인공 캐릭터가 회색 망토와 두건을 두르고 눈 덮인 산봉우리 위에 홀로 서 있다. 한 손에는 육각별이 빛나는 등불을 눈높이로 들어 올리고, 다른 손으로는 긴 지팡이를 짚었다. 고개를 살짝 숙인 채 등불이 비추는 발밑의 길을 조용히 내려다본다.
- **필수 상징**: 육각별이 빛나는 등불 · 회색 망토와 두건 · 긴 지팡이 · 눈 덮인 산봉우리
- **무드**: 사색의 고요, 어스름 속 등불 빛 / **팔레트**: 잿빛과 남색, 등불의 노란 점광
- **생성 프롬프트**:
  > The main character wrapped in a grey hooded cloak standing alone on a snowy mountain peak, lifting a lantern glowing with a six-pointed star in one hand and leaning on a tall staff with the other, head bowed while gazing at the small lit path below, contemplative solitude, dim twilight pierced by warm lantern glow, centered subject, vertical card composition, {STYLE}

### 운명의 수레바퀴 (Wheel Of Fortune) — `wheel-of-fortune`

- **본질**: 돌고 도는 흐름이 데려오는 전환점
- **장면**: 하늘 한가운데 거대한 황금 바퀴가 떠서 천천히 돌고 있고, 주인공 캐릭터가 그 아래에서 바퀴를 올려다보며 손을 뻗고 있다. 바퀴 위에는 검을 든 스핑크스가 앉아 있고, 바퀴를 따라 올라가는 존재와 미끄러져 내려가는 뱀이 얽혀 있다. 네 모서리 구름 속에서는 날개 달린 네 상징 존재가 지켜본다.
- **필수 상징**: 거대한 황금 바퀴 · 바퀴 위의 검을 든 스핑크스 · 바퀴를 오르는 존재와 내려가는 뱀 · 네 모서리의 날개 달린 네 존재 · 구름
- **무드**: 운명적 역동, 구름 사이로 번지는 빛 / **팔레트**: 하늘색 바탕에 금색과 주황 포인트
- **생성 프롬프트**:
  > A great golden wheel turning slowly in the middle of the sky, the main character below looking up and reaching toward it, a sphinx holding a sword seated on top of the wheel, one figure climbing up the wheel while a serpent slides down, four winged symbolic beings watching from clouds in the corners, dynamic fateful motion, light spreading between clouds, centered subject, vertical card composition, {STYLE}

### 정의 (Justice) — `justice`

- **본질**: 치우침 없는 저울과 곧은 진실
- **장면**: 정의의 위엄을 지닌 주인공 캐릭터가 두 기둥 사이 옥좌에 정면으로 앉아 있다. 한 손에는 하늘을 향해 곧게 세운 검을, 다른 손에는 수평을 이룬 저울을 들고 있다. 머리에는 관을 쓰고 붉은 예복을 둘렀으며 뒤편에는 보랏빛 장막이 드리워 있다.
- **필수 상징**: 곧게 세운 검 · 수평을 이룬 저울 · 두 기둥과 보랏빛 장막 · 관과 붉은 예복
- **무드**: 엄정한 균형감, 치우침 없는 고른 빛 / **팔레트**: 붉은 예복과 보라, 차분한 금속빛
- **생성 프롬프트**:
  > The main character embodying the archetype of justice seated squarely on a throne between two pillars, holding an upright sword pointing to the sky in one hand and perfectly balanced scales in the other, wearing a crown and a red robe, a violet veil hanging behind the throne, stern impartial stillness, even neutral light, centered subject, vertical card composition, {STYLE}

### 매달린 사람 (The Hanged Man) — `the-hanged-man`

- **본질**: 거꾸로 매달려 얻는 새로운 눈
- **장면**: 주인공 캐릭터가 잎이 돋아 있는 살아 있는 나무 가로대에 한쪽 발이 묶인 채 거꾸로 매달려 있다. 다른 쪽 다리는 무릎을 접어 편안하게 걸치고 두 손은 등 뒤로 모았으며, 표정은 놀랍도록 평온하다. 거꾸로 된 머리 주위로 은은한 후광이 둥글게 빛난다.
- **필수 상징**: 잎이 돋은 나무 가로대 · 한쪽 발을 묶은 밧줄 · 접어 올린 다른 쪽 다리 · 머리 주위의 후광 · 평온한 표정
- **무드**: 평온한 몰입, 정지된 듯 고요한 빛 / **팔레트**: 차분한 청록과 후광의 연노랑
- **생성 프롬프트**:
  > The main character hanging upside down from a living wooden beam sprouting green leaves, one ankle bound by a rope, the other leg bent casually at the knee, hands folded behind the back, face perfectly serene, a soft round halo glowing around the inverted head, tranquil suspended stillness, calm diffuse light, centered subject, vertical card composition, {STYLE}

### 죽음 (Death) — `death`

- **본질**: 끝맺음이 열어 주는 새로운 문
- **장면**: 죽음의 기사 원형을 맡은 주인공 캐릭터가 검은 갑옷을 입고 흰 말 위에 올라 천천히 나아간다. 손에는 흰 장미가 그려진 검은 깃발을 들었고, 말 앞 땅에는 왕관이 떨어져 있다. 저 멀리 두 탑 사이로 새벽 태양이 떠오르고 있다.
- **필수 상징**: 검은 갑옷 · 흰 말 · 흰 장미 문양의 검은 깃발 · 떨어진 왕관 · 두 탑 사이로 떠오르는 태양
- **무드**: 장엄한 고요, 새벽의 여명 / **팔레트**: 흑백 대비와 지평선의 연금빛
- **생성 프롬프트**:
  > The main character embodying the rider of death in black armor advancing slowly on a white horse, carrying a black banner emblazoned with a white rose, a fallen crown lying on the ground before the horse, the dawn sun rising between two distant towers on the horizon, solemn quiet grandeur, pale first light of daybreak, centered subject, vertical card composition, {STYLE}

### 절제 (Temperance) — `temperance`

- **본질**: 섞고 고르며 찾아가는 중용의 길
- **장면**: 커다란 날개를 지닌 주인공 캐릭터가 두 개의 잔 사이로 물줄기를 흘려보내며 신중하게 섞고 있다. 한 발은 잔잔한 연못에, 다른 발은 물가의 땅에 딛고 서 있다. 곁에는 노란 붓꽃이 피어 있고, 멀리 산등성이 너머로 빛나는 길이 이어진다.
- **필수 상징**: 두 잔 사이로 흐르는 물줄기 · 물과 뭍에 걸친 두 발 · 커다란 날개 · 노란 붓꽃 · 산 너머 빛나는 길
- **무드**: 차분한 조화, 부드러운 해질녘 빛 / **팔레트**: 맑은 하늘색과 흰색, 노랑 포인트
- **생성 프롬프트**:
  > The main character with large wings pouring water in a continuous stream between two cups with careful focus, one foot resting in a calm pool and the other on the grassy bank, yellow irises blooming nearby, a shining path leading over distant hills toward a glowing light, calm harmonious balance, soft late-afternoon glow, centered subject, vertical card composition, {STYLE}

### 악마 (The Devil) — `the-devil`

- **본질**: 느슨한 사슬을 스스로 붙든 속박
- **장면**: 어두운 배경의 검은 받침대 위에 뿔과 박쥐 날개를 지닌 어둠의 존재가 웅크리고 앉아 있고, 그 머리 위로 거꾸로 선 오각별이 떠 있다. 받침대 아래에는 주인공 캐릭터가 또 다른 캐릭터와 나란히 목에 느슨한 사슬을 건 채 서 있다. 사슬은 헐거워 언제든 벗을 수 있어 보인다.
- **필수 상징**: 뿔과 박쥐 날개의 어둠의 존재 · 거꾸로 선 오각별 · 느슨하게 걸린 사슬 · 검은 받침대 · 사슬에 묶인 두 캐릭터
- **무드**: 무겁고 짙은 어둠, 횃불의 붉은 빛 / **팔레트**: 짙은 검정과 어두운 갈색, 붉은 불빛
- **생성 프롬프트**:
  > A horned shadowy being with bat-like wings crouching on a black pedestal beneath an inverted five-pointed star, the main character and a second character standing chained below, the loose chains around their necks clearly slack enough to slip off, oppressive darkness lit by a red torch glow, heavy brooding air, centered subjects, vertical card composition, {STYLE}

### 탑 (The Tower) — `the-tower`

- **본질**: 번개 한 줄기에 무너지는 낡은 확신
- **장면**: 바위산 꼭대기의 높은 탑에 번개가 내리쳐 꼭대기가 불타며 무너지고, 왕관 모양 지붕이 공중으로 튕겨 나간다. 주인공 캐릭터가 또 다른 캐릭터와 함께 탑에서 떨어지고 있다. 검은 밤하늘에는 번개와 불꽃이 흩날린다.
- **필수 상징**: 내리치는 번개 · 불타며 무너지는 탑 · 튕겨 나가는 왕관 모양 지붕 · 떨어지는 두 캐릭터 · 검은 하늘의 불꽃
- **무드**: 격렬한 붕괴의 순간, 밤의 섬광 / **팔레트**: 짙은 남색 바탕에 번개의 노랑과 주황
- **생성 프롬프트**:
  > A tall tower on a rocky peak struck by a bolt of lightning, its crown-shaped top blasted off in flames, the main character and a second character falling headlong from the tower, sparks and flames scattering across a black night sky, violent moment of sudden collapse, harsh lightning flash against darkness, centered subject, vertical card composition, {STYLE}

### 별 (The Star) — `the-star`

- **본질**: 폭풍 뒤에 돌아온 조용한 희망
- **장면**: 주인공 캐릭터가 연못가에 한쪽 무릎을 꿇고 두 항아리의 물을 하나는 연못에, 하나는 땅에 붓고 있다. 밤하늘 한가운데에는 커다란 별 하나가 빛나고 그 둘레를 일곱 개의 작은 별이 감싸고 있다. 뒤편 나무 위에는 작은 새 한 마리가 앉아 있다.
- **필수 상징**: 커다란 별과 일곱 개의 작은 별 · 두 개의 물 항아리 · 연못과 땅에 동시에 붓는 물 · 연못가 · 나무 위의 작은 새
- **무드**: 치유의 평온, 맑은 별밤 / **팔레트**: 깊은 파랑 밤하늘과 은백색 별빛
- **생성 프롬프트**:
  > The main character kneeling by a calm pool at night, pouring water from two jugs, one onto the land and one into the pool, a single large radiant star surrounded by seven smaller stars in the sky above, a small bird perched in a tree behind, serene healing stillness, clear gentle starlit night, centered subject, vertical card composition, {STYLE}

### 달 (The Moon) — `the-moon`

- **본질**: 안개 속을 더듬어 걷는 직관의 밤
- **장면**: 커다란 달이 은은한 빛을 흘리는 밤, 주인공 캐릭터가 두 개의 탑 사이로 이어진 구불구불한 길을 조심스럽게 걸어간다. 길 양옆에서는 개와 늑대가 달을 향해 울부짖고, 앞쪽 연못에서는 가재가 물 밖으로 기어 나온다. 달에서는 이슬 방울이 빛처럼 떨어져 내린다.
- **필수 상징**: 커다란 달 · 두 개의 탑 · 구불구불한 길 · 울부짖는 개와 늑대 · 연못에서 나오는 가재 · 떨어지는 이슬 방울
- **무드**: 몽롱한 불안과 신비, 짙은 달밤 / **팔레트**: 푸른 회색과 창백한 노란 달빛
- **생성 프롬프트**:
  > The main character walking cautiously along a winding path that passes between two distant towers under a large glowing moon, a dog and a wolf howling upward on either side of the path, a crayfish crawling out of a pool in the foreground, droplets of light drifting down from the moon, uneasy dreamlike mystery, deep hazy night, centered subject, vertical card composition, {STYLE}

### 태양 (The Sun) — `the-sun`

- **본질**: 숨김없이 쏟아지는 기쁨과 활력
- **장면**: 주인공 캐릭터가 두 팔을 활짝 벌린 채 흰 말 위에 올라 환하게 웃고 있다. 한 손에 든 커다란 붉은 깃발이 바람에 펄럭이고, 뒤편 담장 위로는 해바라기가 줄지어 피어 있다. 하늘 한가운데에서 곧은 광선을 뻗는 태양이 눈부시게 빛난다.
- **필수 상징**: 광선을 뻗는 큰 태양 · 흰 말 · 활짝 벌린 두 팔 · 붉은 깃발 · 담장 위 해바라기
- **무드**: 터질 듯한 기쁨, 쨍한 한낮의 햇살 / **팔레트**: 샛노랑과 주황, 맑은 하늘색
- **생성 프롬프트**:
  > The main character riding a white horse with both arms flung wide in open joy, a large red banner streaming in the breeze, a row of sunflowers blooming along a wall behind, a great sun with straight radiating beams blazing at the top of the sky, exuberant celebratory energy, brilliant midday sunshine, centered subject, vertical card composition, {STYLE}

### 심판 (Judgement) — `judgement`

- **본질**: 지난 장을 덮고 깨어나는 부름
- **장면**: 구름 사이로 나타난 날개 달린 존재가 십자 문양 깃발이 걸린 나팔을 힘차게 불고 있다. 그 아래에서 주인공 캐릭터가 열린 관에서 일어나 두 팔을 벌리고 하늘을 올려다본다. 주변의 다른 캐릭터들도 함께 깨어나고, 뒤편에는 잔잔한 물과 눈 덮인 산맥이 펼쳐진다.
- **필수 상징**: 나팔을 부는 날개 달린 존재 · 십자 문양 깃발 · 열린 관에서 일어나는 캐릭터들 · 하늘을 향해 벌린 두 팔 · 잔잔한 물과 눈 덮인 산맥
- **무드**: 장엄한 깨어남, 구름을 가르는 빛 / **팔레트**: 회청색 구름과 눈부신 흰빛
- **생성 프롬프트**:
  > A winged figure emerging from parted clouds sounding a great trumpet hung with a cross-emblem banner, the main character rising from an open coffin below with arms spread wide gazing upward, other characters awakening around them, calm water and snowy mountains in the far background, solemn awakening grandeur, radiant light breaking through clouds, centered subject, vertical card composition, {STYLE}

### 세계 (The World) — `the-world`

- **본질**: 한 바퀴를 완성한 충만한 마무리
- **장면**: 주인공 캐릭터가 하늘에 떠 있는 커다란 타원형 월계수 화환 한가운데에서 가볍게 춤추듯 떠 있다. 양손에는 짧은 지팡이를 하나씩 들고 몸에는 긴 천이 부드럽게 휘감겨 있다. 네 모서리 구름 속에서 네 상징 존재가 완성의 순간을 지켜본다.
- **필수 상징**: 타원형 월계수 화환 · 양손의 두 지팡이 · 몸을 휘감은 긴 천 · 네 모서리의 네 상징 존재 · 구름
- **무드**: 충만한 성취감, 환하고 개운한 빛 / **팔레트**: 보랏빛 하늘과 월계수 초록, 금빛
- **생성 프롬프트**:
  > The main character floating in a light dancing pose at the center of a great oval laurel wreath suspended in the sky, holding a short wand in each hand, a long ribbon of cloth swirling gently around them, four symbolic beings watching from clouds at the four corners, fulfilled triumphant serenity, bright clear celebratory light, centered subject, vertical card composition, {STYLE}

---

## 완드 (불 · 열정 · 행동)

### 완드 에이스 (Ace of Wands) — `ace-of-wands`

- **본질**: 새 열정이 움트는 창조의 첫 불씨
- **장면**: 화면 중앙, 구름 사이로 내민 손이 잎이 돋아난 살아 있는 나무 지팡이 하나를 힘 있게 움켜쥐고 있다. 지팡이에서 갓 돋은 잎사귀 몇 장이 주위로 흩날리고, 아래로는 강이 흐르는 들판과 멀리 언덕 위의 성이 보인다. 하늘은 위쪽에, 대지는 아래쪽에 두어 지팡이가 화면 세로 중앙을 곧게 가로지른다.
- **필수 상징**: 구름에서 나온 손 · 잎이 돋아난 완드 정확히 1개 · 흩날리는 새잎 · 강이 흐르는 들판 · 멀리 보이는 성
- **무드**: 영감이 번쩍이는 순간, 맑고 환한 대낮의 빛 / **팔레트**: 생명력 있는 초록 새잎에 따뜻한 주황·금빛 하늘
- **생성 프롬프트**:
  > A hand emerging from a soft cloud, firmly gripping exactly one living wooden wand with fresh green leaves sprouting from it, a few small leaves drifting in the air, a river valley and a distant castle on a hill below, bright clear daylight full of inspiration, centered subject, vertical card composition, {STYLE}

### 완드 2 (Two of Wands) — `two-of-wands`

- **본질**: 이룬 것 위에서 더 넓은 세계를 그리는 전망
- **장면**: 주인공 캐릭터가 성의 옥상 난간에 서서 한 손에 작은 지구본을 들고 먼 바다와 산맥을 내려다본다. 다른 손은 잎이 돋은 나무 지팡이 하나를 짚고 있으며, 또 하나의 지팡이는 난간 옆 벽에 고정되어 서 있다. 화면에는 완드가 정확히 두 개만 보이고, 위쪽은 넓은 하늘, 아래쪽은 성벽과 풍경이 받친다.
- **필수 상징**: 완드 정확히 2개(하나는 손에, 하나는 벽에 고정) · 손에 든 지구본 · 성의 옥상 난간 · 내려다보이는 바다와 먼 풍경
- **무드**: 야망과 미묘한 갈망이 교차하는 고요한 늦은 오후 / **팔레트**: 잿빛 석조에 붉은 노을 기운, 바다의 짙은 청록 대비
- **생성 프롬프트**:
  > The main character standing on a castle rooftop, holding a small globe in one hand and gripping one leafy living wooden wand, a second wand fixed upright against the parapet beside them, exactly two wands in the scene, gazing out over a distant sea and mountains, quiet contemplative late afternoon light of ambition and longing, centered subject, vertical card composition, {STYLE}

### 완드 3 (Three of Wands) — `three-of-wands`

- **본질**: 노력의 결실이 배처럼 돌아오는 확장의 조짐
- **장면**: 주인공 캐릭터가 언덕 꼭대기에서 등을 보인 채 서서 황금빛 바다를 항해하는 배들을 바라본다. 한 손은 잎이 돋은 나무 지팡이 하나를 잡고 있고, 나머지 두 개의 지팡이는 좌우 땅에 곧게 꽂혀 캐릭터를 감싼다. 화면에 완드는 정확히 세 개이며, 위쪽 하늘과 아래쪽 언덕 사면이 여백을 이룬다.
- **필수 상징**: 완드 정확히 3개(하나는 손에, 둘은 땅에) · 등을 보이고 선 캐릭터 · 언덕 꼭대기 · 바다 위의 배들 · 넓은 수평선
- **무드**: 기대에 찬 차분한 응시, 황금빛으로 물든 이른 아침 바다 / **팔레트**: 황금·주황의 바다와 하늘, 따뜻한 갈색 언덕
- **생성 프롬프트**:
  > The main character seen from behind, standing on a hilltop and holding one living wooden wand while exactly two more leafy wands stand planted in the ground beside them, exactly three wands total, watching ships sailing across a golden sea toward the wide horizon, calm expectant golden morning light, centered subject, vertical card composition, {STYLE}

### 완드 4 (Four of Wands) — `four-of-wands`

- **본질**: 결실을 함께 나누는 축하와 안식의 터전
- **장면**: 잎이 돋은 네 개의 나무 지팡이가 땅에 곧게 세워져 있고, 그 위에 꽃과 과일로 엮은 화환이 걸려 작은 문처럼 서 있다. 그 아래에서 주인공 캐릭터가 꽃다발을 높이 들어 올리며 기쁘게 맞이하고, 뒤로는 안정된 성채와 축제 분위기의 사람들이 보인다. 완드는 정확히 네 개이며 화환 구조물이 화면 중앙을 차지한다.
- **필수 상징**: 완드 정확히 4개(기둥처럼 세워짐) · 꽃과 과일 화환 · 꽃다발을 든 캐릭터 · 축제 분위기 · 뒤편의 안정된 성채
- **무드**: 환영과 화합의 기쁨, 맑고 따뜻한 한낮 / **팔레트**: 노랑·주황의 축제빛에 화환의 초록과 꽃색 포인트
- **생성 프롬프트**:
  > Exactly four living wooden wands standing upright like pillars, crowned with a welcoming garland of flowers and fruit, the main character beneath the garland joyfully raising a bouquet in celebration, a festive gathering and a stable castle in the background, warm bright midday light of homecoming and harmony, centered subject, vertical card composition, {STYLE}

### 완드 5 (Five of Wands) — `five-of-wands`

- **본질**: 서로 다른 열정이 부딪히는 경쟁의 소란
- **장면**: 다섯 명의 캐릭터가 탁 트인 언덕 위에서 각자 잎이 돋은 나무 지팡이를 하나씩 치켜들고 뒤엉켜 겨루고 있다. 지팡이들은 공중에서 어지럽게 엇갈리지만 누구도 다치지 않는, 힘겨루기 놀이 같은 소란이다. 완드는 정확히 다섯 개이며 인물들의 몸짓이 화면 중앙에 모여 역동적인 덩어리를 이룬다.
- **필수 상징**: 완드 정확히 5개(각자 하나씩) · 다섯 캐릭터의 뒤엉킨 겨루기 · 공중에서 엇갈리는 지팡이 · 탁 트인 언덕
- **무드**: 소란스럽지만 악의 없는 활기, 쨍한 대낮의 빛 / **팔레트**: 선명한 원색 대비, 흙빛 언덕과 파란 하늘
- **생성 프롬프트**:
  > Five characters on an open hillside, each raising one leafy living wooden wand, exactly five wands clashing and crossing in mid-air in a rowdy but harmless mock contest, dynamic tangled poses gathered at the center, energetic bright midday light of spirited rivalry, centered subject, vertical card composition, {STYLE}

### 완드 6 (Six of Wands) — `six-of-wands`

- **본질**: 노력의 결실이 인정받는 승리의 행진
- **장면**: 주인공 캐릭터가 머리에 월계관을 쓰고 말에 올라 개선 행진을 하고 있다. 손에 든 잎 돋은 지팡이 끝에도 월계 화환이 걸려 있고, 길가의 사람들이 다섯 개의 지팡이를 치켜들어 환호한다. 화면의 완드는 정확히 여섯 개이며, 말 탄 캐릭터가 세로 중앙에 우뚝 선다.
- **필수 상징**: 완드 정확히 6개(주인공 1개, 환호하는 이들 5개) · 머리의 월계관 · 지팡이 끝의 월계 화환 · 말을 탄 개선 행진 · 환호하는 군중
- **무드**: 자랑스럽고 벅찬 승리의 순간, 화창한 오후의 빛 / **팔레트**: 승리의 금빛과 월계수 초록, 붉은 망토 포인트
- **생성 프롬프트**:
  > The main character wearing a laurel wreath, riding a horse in a triumphant procession, holding one living wooden wand crowned with a laurel garland, while cheering figures alongside raise exactly five more leafy wands, exactly six wands in total, proud jubilant parade under bright sunny afternoon light, centered subject, vertical card composition, {STYLE}

### 완드 7 (Seven of Wands) — `seven-of-wands`

- **본질**: 높은 자리에서 소신을 지켜 내는 용기
- **장면**: 주인공 캐릭터가 언덕 꼭대기의 유리한 고지에 서서 잎이 돋은 지팡이 하나를 두 손으로 비껴 잡고 아래를 향해 맞서고 있다. 화면 아래쪽 절벽 너머에서 여섯 개의 지팡이가 도전하듯 솟아오르지만 그 주인들은 보이지 않는다. 완드는 정확히 일곱 개이며 캐릭터의 버티는 자세가 중앙을 지킨다.
- **필수 상징**: 완드 정확히 7개(주인공 1개, 아래에서 솟는 6개) · 언덕 위의 유리한 위치 · 두 손으로 맞서는 방어 자세 · 아래에서 솟아오르는 도전
- **무드**: 긴장 속의 결연함, 구름 낀 하늘 아래 또렷한 빛 / **팔레트**: 차분한 청회색 하늘에 캐릭터와 지팡이의 따뜻한 갈색·초록 대비
- **생성 프롬프트**:
  > The main character standing firm on high ground atop a hill, gripping one leafy living wooden wand in both hands in a defensive stance, while exactly six more wands rise up challengingly from below the slope with their bearers unseen, exactly seven wands in total, tense but resolute mood under a cloudy sky with clear determined light, centered subject, vertical card composition, {STYLE}

### 완드 8 (Eight of Wands) — `eight-of-wands`

- **본질**: 순풍을 탄 소식과 일의 빠른 진행
- **장면**: 잎이 돋은 여덟 개의 나무 지팡이가 나란히 대각선을 그리며 맑은 하늘을 화살처럼 빠르게 가로질러 날아간다. 아래로는 강이 흐르는 평화로운 들판과 작은 언덕 위의 집이 펼쳐진다. 인물 없이 여덟 개의 완드 무리가 화면 중앙을 채우며, 속도감이 그대로 느껴지는 구도다.
- **필수 상징**: 하늘을 나는 완드 정확히 8개 · 나란한 대각선 궤적 · 강이 흐르는 들판 · 탁 트인 맑은 하늘
- **무드**: 거침없는 속도감과 설렘, 맑게 갠 대낮 / **팔레트**: 청명한 하늘색 바탕에 지팡이의 갈색과 새잎 초록
- **생성 프롬프트**:
  > Exactly eight living wooden wands with sprouting green leaves flying swiftly through a clear open sky in a parallel diagonal streak like arrows in motion, a peaceful river landscape with green fields and a small house on a hill far below, sense of rushing speed and momentum, fresh clear midday light, centered subject, vertical card composition, {STYLE}

### 완드 9 (Nine of Wands) — `nine-of-wands`

- **본질**: 마지막 고비 앞에서 버티는 끈기와 저력
- **장면**: 머리에 붕대를 감은 주인공 캐릭터가 잎 돋은 지팡이 하나에 몸을 기대고 서서 경계하듯 어깨 너머를 돌아본다. 등 뒤로는 여덟 개의 지팡이가 울타리처럼 나란히 땅에 꽂혀 있다. 완드는 정확히 아홉 개이며, 지친 몸으로도 자리를 지키는 캐릭터가 화면 중앙에 선다.
- **필수 상징**: 완드 정확히 9개(손에 1개, 울타리처럼 선 8개) · 머리의 붕대 · 지팡이에 기댄 자세 · 경계하며 돌아보는 시선
- **무드**: 지쳤지만 물러서지 않는 결기, 해 질 녘의 묵직한 빛 / **팔레트**: 노을빛 황갈색 바탕에 붕대의 흰색, 지팡이의 짙은 갈색
- **생성 프롬프트**:
  > The main character with a bandaged head leaning wearily on one living wooden wand, glancing warily over their shoulder, exactly eight more leafy wands planted upright behind them like a defensive fence, exactly nine wands in total, tired yet unyielding resolve in heavy late-day light near dusk, centered subject, vertical card composition, {STYLE}

### 완드 10 (Ten of Wands) — `ten-of-wands`

- **본질**: 홀로 짊어진 성취의 무게와 과중한 책임
- **장면**: 주인공 캐릭터가 잎이 돋은 열 개의 나무 지팡이를 한 아름 끌어안고 허리를 깊이 숙인 채 힘겹게 걸어간다. 지팡이 다발이 시야를 가릴 만큼 크지만, 멀지 않은 곳에 목적지인 마을과 집이 보인다. 완드는 정확히 열 개이며, 짐을 진 캐릭터의 굽은 실루엣이 화면 중앙을 차지한다.
- **필수 상징**: 한 아름 안은 완드 정확히 10개 · 깊이 숙인 허리와 굽은 실루엣 · 무거운 발걸음 · 멀지 않은 마을과 집
- **무드**: 무겁지만 끝이 보이는 인내, 노을 지는 늦은 오후 / **팔레트**: 따뜻한 황토·갈색 바탕에 낮게 깔린 주황 노을
- **생성 프롬프트**:
  > The main character bent forward under the weight of exactly ten living wooden wands gathered in their arms, carrying the heavy leafy bundle step by step along a path, a village with warm houses visible not far ahead, burdened but persevering mood in low orange late-afternoon light, centered subject, vertical card composition, {STYLE}

### 완드 시종 (Page of Wands) — `page-of-wands`

- **본질**: 새 소식과 도전을 향한 순수한 호기심
- **장면**: 완드 시종의 호기심과 열의를 지닌 주인공 캐릭터가 탁 트인 들판에 서서, 자기 키보다 큰 잎 돋은 지팡이 하나를 두 손으로 세워 잡고 그 끝에 갓 돋은 새잎을 신기한 듯 올려다본다. 배경은 메마른 언덕과 먼 산이 있는 넓은 벌판으로, 완드는 정확히 한 개다. 위쪽은 밝은 하늘, 아래쪽은 들판이 받치는 안정된 구도다.
- **필수 상징**: 잎이 돋은 완드 정확히 1개(두 손으로 세워 잡음) · 지팡이 끝을 올려다보는 시선 · 메마른 언덕과 넓은 벌판 · 가벼운 여행 차림
- **무드**: 호기심과 설렘이 반짝이는 밝은 한낮 / **팔레트**: 모래빛 대지에 노랑·주황 의상, 새잎의 싱그러운 초록
- **생성 프롬프트**:
  > The main character embodying the curious page of wands archetype, standing in a wide open field with dry hills in the distance, holding one tall living wooden wand upright with both hands and gazing up in wonder at the fresh green leaves sprouting from its tip, exactly one wand, bright cheerful midday light of curiosity, centered subject, vertical card composition, {STYLE}

### 완드 기사 (Knight of Wands) — `knight-of-wands`

- **본질**: 설렘을 안고 내달리는 추진력과 모험
- **장면**: 완드 기사의 기백을 지닌 주인공 캐릭터가 앞발을 치켜든 말 위에서 잎 돋은 지팡이 하나를 높이 들고 힘차게 출발하려 한다. 망토와 장식이 불꽃처럼 바람에 휘날리고, 배경은 메마른 사막 벌판과 먼 언덕이다. 완드는 정확히 한 개이며, 도약 직전의 역동적인 순간이 화면 중앙에 담긴다.
- **필수 상징**: 잎이 돋은 완드 정확히 1개(높이 치켜듦) · 앞발을 치켜든 말 · 불꽃처럼 휘날리는 망토 · 메마른 사막 벌판
- **무드**: 질주 직전의 뜨거운 설렘, 강렬한 한낮의 태양 / **팔레트**: 불꽃의 주황·빨강이 주조, 사막의 황토색 바탕
- **생성 프롬프트**:
  > The main character with the bold spirit of the knight of wands, mounted on a rearing horse and raising exactly one leafy living wooden wand high, cloak streaming in the wind like flames, a dry desert plain with distant hills behind, caught in the dynamic instant before charging forward, blazing passionate midday sun, centered subject, vertical card composition, {STYLE}

### 완드 여왕 (Queen of Wands) — `queen-of-wands`

- **본질**: 따뜻하고 당당하게 주변을 밝히는 카리스마
- **장면**: 완드 여왕의 따뜻한 카리스마를 지닌 주인공 캐릭터가 사자 문양이 새겨진 옥좌에 당당하고 편안하게 앉아 있다. 한 손에는 잎 돋은 지팡이 하나를, 다른 손에는 활짝 핀 해바라기 한 송이를 들었고, 발치에는 검은 고양이 한 마리가 정면을 바라보고 앉아 있다. 완드는 정확히 한 개이며 옥좌와 인물이 화면 중앙에 좌우 대칭으로 자리한다.
- **필수 상징**: 잎이 돋은 완드 정확히 1개 · 활짝 핀 해바라기 · 발치의 검은 고양이 · 사자 문양 옥좌 · 당당하고 편안한 좌상
- **무드**: 따뜻하고 자신감 넘치는 환대, 풍성한 오후의 햇살 / **팔레트**: 해바라기 노랑과 불의 주황 주조, 옥좌의 금빛
- **생성 프롬프트**:
  > The main character radiating the warm charisma of the queen of wands, seated confidently on a throne carved with lion motifs, holding exactly one leafy living wooden wand in one hand and a bright blooming sunflower in the other, a black cat sitting alert at their feet, generous sunny afternoon light of warmth and confidence, centered subject, vertical card composition, {STYLE}

### 완드 왕 (King of Wands) — `king-of-wands`

- **본질**: 경험과 정직으로 이끄는 비전의 리더십
- **장면**: 완드 왕의 위엄을 지닌 주인공 캐릭터가 도마뱀(샐러맨더) 문양이 새겨진 옥좌에 앉아, 잎이 돋은 지팡이 하나를 홀처럼 곧게 세워 잡고 먼 곳을 바라본다. 몸은 옆을 향하되 시선은 앞으로 나아갈 방향을 향하고, 발치에는 작은 도마뱀 한 마리가 함께 있다. 완드는 정확히 한 개이며 옥좌에 앉은 인물이 화면 세로 중앙에 안정적으로 자리한다.
- **필수 상징**: 잎이 돋은 완드 정확히 1개(홀처럼 세워 잡음) · 샐러맨더(도마뱀) 문양 옥좌 · 발치의 작은 도마뱀 · 먼 곳을 향한 결단의 시선 · 불꽃 모티프의 의상 장식
- **무드**: 무게 있는 확신과 열정, 따뜻하게 타오르는 저녁 빛 / **팔레트**: 깊은 빨강·주황 주조에 금빛 장식, 차분한 배경 대비
- **생성 프롬프트**:
  > The main character bearing the commanding presence of the king of wands, seated on a throne adorned with salamander motifs, holding exactly one leafy living wooden wand upright like a scepter, gazing decisively into the distance, a small salamander resting near their feet, flame motifs on their garments, warm glowing evening light of assured passion, centered subject, vertical card composition, {STYLE}

---

## 컵 (물 · 감정 · 관계)

### 컵 에이스 (Ace of Cups) — `ace-of-cups`

- **본질**: 마음이 열리며 넘쳐흐르는 감정의 시작
- **장면**: 구름 사이에서 나온 손이 화면 중앙에 커다란 성배 하나를 받쳐 들고 있고, 잔에서 다섯 줄기의 물이 아래 잔잔한 연못으로 흘러넘친다. 흰 비둘기 한 마리가 작은 원형 조각을 물고 잔을 향해 내려오는 중이다. 연못 수면에는 연꽃과 수련 잎이 떠 있어 화면 아래쪽을 채운다.
- **필수 상징**: 구름에서 나온 손이 받쳐 든 성배 한 개 · 잔에서 흘러넘치는 다섯 줄기의 물 · 잔을 향해 내려오는 흰 비둘기 · 연꽃이 떠 있는 잔잔한 수면 · 부드러운 구름
- **무드**: 축복이 내려오는 듯한 맑고 환한 빛, 고요한 낮 / **팔레트**: 맑은 물빛 청록과 흰색, 은은한 금빛 포인트
- **생성 프롬프트**:
  > A hand emerging from soft clouds holds up a single large chalice at the center, five streams of water overflowing from it into a calm pond dotted with lotus blossoms below, a white dove descending toward the cup carrying a small round wafer, gentle clouds above, serene radiant daylight full of blessing, centered subject, vertical card composition, {STYLE}

### 컵 2 (Two of Cups) — `two-of-cups`

- **본질**: 두 마음이 서로를 알아보는 교감의 맹세
- **장면**: 두 명의 주인공 캐릭터가 서로를 마주 보고 서서 각자 든 컵을 맞대어 건네려는 순간이다. 두 사람 사이 위쪽 허공에는 두 마리 뱀이 감긴 지팡이와 날개 달린 사자 머리 문양이 떠 있다. 뒤편으로는 완만한 언덕과 작은 집이 보이는 평화로운 들판이 펼쳐진다.
- **필수 상징**: 정확히 두 개의 컵 · 컵을 맞대어 교환하는 두 캐릭터 · 두 뱀이 감긴 지팡이(카두케우스) · 날개 달린 사자 머리 · 언덕과 작은 집이 있는 배경
- **무드**: 서로에게 집중한 다정한 긴장감, 부드러운 오후 햇살 / **팔레트**: 따뜻한 살구빛과 옅은 하늘색, 붉은 포인트
- **생성 프롬프트**:
  > Two main characters standing face to face in the center, each holding one cup and reaching to exchange them, exactly two cups, a winged lion head above a staff entwined by two serpents floating between them, gentle hills and a small house in the far background, warm tender afternoon light of a sincere vow, centered subject, vertical card composition, {STYLE}

### 컵 3 (Three of Cups) — `three-of-cups`

- **본질**: 함께 이룬 결실을 나누는 축하의 기쁨
- **장면**: 세 명의 주인공 캐릭터가 둥글게 모여 서서 각자 든 컵을 하늘 높이 맞부딪치며 축배를 드는 장면이다. 발치에는 포도와 호박 등 수확한 과일이 풍성하게 놓여 있고, 세 사람은 춤을 추듯 몸을 가볍게 돌리고 있다. 배경은 결실이 무르익은 밝은 과수원 들판이다.
- **필수 상징**: 정확히 세 개의 컵을 높이 든 축배 · 둥글게 모여 춤추는 세 캐릭터 · 발치의 수확 과일과 포도 덩굴 · 풍요로운 들판 배경
- **무드**: 웃음이 터지는 흥겨운 축제 분위기, 화창한 한낮 / **팔레트**: 과일빛 주황·자주와 초록, 밝고 풍성한 색감
- **생성 프롬프트**:
  > Three main characters gathered in a circle, dancing lightly and raising exactly three cups high together in a joyful toast, harvest fruits and grape vines abundant at their feet, a bright orchard field behind them, festive laughing celebration under clear midday sun, centered subject, vertical card composition, {STYLE}

### 컵 4 (Four of Cups) — `four-of-cups`

- **본질**: 가진 것에 시들해진 마음과 새 기회
- **장면**: 주인공 캐릭터가 나무 아래 풀밭에 팔짱을 끼고 앉아 눈을 내리깐 채 시큰둥한 표정을 짓고 있다. 앞에는 세 개의 컵이 나란히 세워져 있지만 눈길을 주지 않고, 옆 허공의 작은 구름에서 나온 손이 네 번째 컵을 새로 내밀고 있다. 캐릭터는 그 컵을 아직 알아채지 못한 모습이다.
- **필수 상징**: 나무 아래 팔짱 끼고 앉은 캐릭터 · 정확히 네 개의 컵 — 앞에 세 개, 구름 속 손이 내미는 한 개 · 구름에서 나온 손 · 권태로운 무관심의 표정 · 언덕 위 한 그루 나무
- **무드**: 심드렁하고 나른한 권태, 흐릿한 늦은 오후 / **팔레트**: 차분한 회녹색과 흙빛, 구름의 옅은 회백색
- **생성 프롬프트**:
  > The main character sitting cross-armed under a lone tree on a grassy hill, eyes lowered with a bored indifferent expression, three cups standing in a row before them ignored, while a hand from a small cloud beside offers a fourth cup unnoticed, exactly four cups in total, listless hazy late-afternoon calm, centered subject, vertical card composition, {STYLE}

### 컵 5 (Five of Cups) — `five-of-cups`

- **본질**: 잃은 것 뒤에 아직 남아 있는 두 개의 잔
- **장면**: 검은 망토를 두른 주인공 캐릭터가 고개를 숙인 채 발치에 쓰러져 내용물이 쏟아진 세 개의 컵을 내려다보고 있다. 등 뒤에는 온전히 서 있는 두 개의 컵이 있지만 캐릭터는 아직 돌아보지 못한다. 뒤편으로 강이 흐르고, 다리 건너 멀리 작은 성이 보인다.
- **필수 상징**: 정확히 다섯 개의 컵 — 쓰러져 쏟아진 세 개와 등 뒤에 서 있는 두 개 · 검은 망토를 두르고 고개 숙인 캐릭터 · 흐르는 강 · 강 위의 다리 · 다리 건너 멀리 보이는 성
- **무드**: 상실의 무거운 침묵, 잿빛 흐린 하늘 / **팔레트**: 잿빛 회청색과 어두운 망토색, 강물의 차가운 은빛
- **생성 프롬프트**:
  > A main character wrapped in a dark cloak, head bowed, gazing down at three fallen cups spilled at their feet, while exactly two cups still stand upright behind their back unnoticed, five cups in total, a river flowing behind with a bridge leading to a distant small castle, heavy silent grief under an overcast gray sky, centered subject, vertical card composition, {STYLE}

### 컵 6 (Six of Cups) — `six-of-cups`

- **본질**: 순수했던 시절이 건네는 따뜻한 그리움
- **장면**: 옛 마을 안뜰에서 주인공 캐릭터가 흰 꽃이 가득 꽂힌 컵 하나를 몸집이 작은 어린 캐릭터에게 다정하게 건네고 있다. 주변에는 같은 흰 꽃이 담긴 컵 다섯 개가 뜰 곳곳에 놓여 있어 모두 여섯 개의 컵이 화면에 담긴다. 배경에는 낡고 정겨운 돌담과 오래된 집이 감싸듯 서 있다.
- **필수 상징**: 정확히 여섯 개의 컵, 모두 흰 꽃이 담김 · 꽃 컵을 건네는 캐릭터와 받는 어린 캐릭터 · 정겨운 옛 마을 안뜰과 돌담 · 오래된 집
- **무드**: 그리움이 번지는 포근한 온기, 노을빛 스민 늦은 오후 / **팔레트**: 빛바랜 노란빛과 크림색, 흰 꽃의 담백한 흰색
- **생성 프롬프트**:
  > In an old village courtyard, the main character gently hands a cup filled with white flowers to a smaller young character, five more flower-filled cups placed around the yard, exactly six cups in total, weathered stone walls and an old house embracing the scene, nostalgic golden warmth of a late afternoon memory, centered subject, vertical card composition, {STYLE}

### 컵 7 (Seven of Cups) — `seven-of-cups`

- **본질**: 많은 선택지 속 손에 잡히지 않는 환상
- **장면**: 주인공 캐릭터가 뒷모습 실루엣으로 서서 허공의 구름 위에 떠오른 일곱 개의 컵을 올려다보고 있다. 각 컵에는 보석, 월계관, 성, 용, 얼굴, 뱀, 빛나는 베일에 싸인 형상 같은 서로 다른 환영이 담겨 있다. 어느 것이 진짜인지 알 수 없는 몽롱한 광경이 화면 중앙을 가득 채운다.
- **필수 상징**: 구름 위에 떠 있는 정확히 일곱 개의 컵 · 컵마다 담긴 서로 다른 환영 — 보석, 월계관, 성, 용, 얼굴, 뱀, 베일에 싸여 빛나는 형상 · 환영을 올려다보는 캐릭터의 뒷모습 실루엣 · 몽환적인 구름
- **무드**: 홀린 듯 몽롱한 백일몽, 어스름한 빛 / **팔레트**: 안개 낀 보랏빛 회색과 은은한 무지갯빛 환영
- **생성 프롬프트**:
  > The main character seen from behind as a silhouette, gazing up at exactly seven cups floating on billowing clouds, each cup holding a different vision, jewels, a laurel wreath, a castle, a dragon, a face, a snake, and a glowing veiled figure, dreamy bewitched twilight haze where nothing feels solid, centered subject, vertical card composition, {STYLE}

### 컵 8 (Eight of Cups) — `eight-of-cups`

- **본질**: 채워지지 않는 것을 뒤로하고 떠나는 용기
- **장면**: 주인공 캐릭터가 지팡이를 짚고 등을 보인 채 물가를 따라 멀리 산 쪽으로 걸어가고 있다. 앞쪽 물가에는 여덟 개의 컵이 두 줄로 쌓여 있는데, 한 자리가 빈 듯 어긋나게 놓여 떠남의 이유를 암시한다. 하늘에는 달이 조용히 내려다보고 있다.
- **필수 상징**: 정확히 여덟 개의 컵 — 아래 다섯 개, 위 세 개로 쌓이고 한쪽이 비어 보이는 배열 · 지팡이를 짚고 등 돌려 떠나는 캐릭터 · 하늘의 달 · 물가와 개울 · 멀리 어두운 산
- **무드**: 쓸쓸하지만 단호한 떠남, 달빛 어린 밤 / **팔레트**: 깊은 남청색과 달빛 은색, 어두운 산그림자
- **생성 프롬프트**:
  > The main character walking away with a walking staff, back turned, following a stream toward dark distant mountains, exactly eight cups stacked by the water in the foreground, five below and three above with a conspicuous gap, a quiet moon watching from the night sky, lonely yet resolute moonlit departure, centered subject, vertical card composition, {STYLE}

### 컵 9 (Nine of Cups) — `nine-of-cups`

- **본질**: 바라던 것이 이루어진 충만한 만족
- **장면**: 주인공 캐릭터가 화면 중앙의 작은 벤치에 팔짱을 끼고 흡족한 미소로 앉아 있다. 등 뒤에는 둥근 아치형 단상 위에 아홉 개의 컵이 가지런히 줄지어 놓여, 이루어 낸 것들을 자랑스레 펼쳐 보이는 듯하다. 푸른 천이 단상을 덮고 있어 잔들이 한층 돋보인다.
- **필수 상징**: 둥근 단상 위에 나란히 놓인 정확히 아홉 개의 컵 · 팔짱 끼고 만족스럽게 앉은 캐릭터 · 컵을 받친 아치형 단상과 덮인 천 · 흡족한 미소
- **무드**: 여유롭고 자랑스러운 흡족함, 환하고 안락한 실내빛 / **팔레트**: 밝은 노랑과 따뜻한 파랑, 잔의 반짝임
- **생성 프롬프트**:
  > The main character seated on a small bench at the center, arms crossed with a satisfied contented smile, exactly nine cups arranged neatly in an arc on a raised curved platform draped in blue cloth behind them, a proud display of wishes fulfilled, cozy bright glow of comfort and abundance, centered subject, vertical card composition, {STYLE}

### 컵 10 (Ten of Cups) — `ten-of-cups`

- **본질**: 온 마음이 쉬어 가는 완성된 사랑의 안식
- **장면**: 두 명의 주인공 캐릭터가 나란히 서서 한 팔씩 하늘을 향해 벌리고, 그 곁에서 어린 캐릭터 둘이 손을 맞잡고 춤추고 있다. 하늘에는 커다란 무지개가 걸려 있고 그 무지개를 따라 열 개의 컵이 늘어서 빛난다. 뒤편에는 강이 흐르고 나무 사이로 아담한 집이 보인다.
- **필수 상징**: 하늘의 무지개를 따라 늘어선 정확히 열 개의 컵 · 팔을 벌려 무지개를 바라보는 두 캐릭터 · 손잡고 춤추는 두 어린 캐릭터 · 강과 언덕 · 나무 곁의 아담한 집
- **무드**: 벅차오르는 평온한 행복, 비 갠 맑은 하늘 / **팔레트**: 무지개색과 초원의 초록, 맑은 하늘색
- **생성 프롬프트**:
  > Two main characters standing side by side with arms raised toward a great rainbow arching across the sky, exactly ten cups lined up glowing along the rainbow, two small young characters holding hands and dancing beside them, a river, green hills and a modest house among trees behind, overflowing peaceful joy under a freshly cleared sky, centered subject, vertical card composition, {STYLE}

### 컵 시종 (Page of Cups) — `page-of-cups`

- **본질**: 마음을 두드리는 뜻밖의 소식과 영감
- **장면**: 컵 시종의 순수한 호기심을 지닌 주인공 캐릭터가 바닷가에 서서 한 손에 든 컵을 눈높이로 들어 올려 바라보고 있다. 컵 속에서 작은 물고기 한 마리가 고개를 내밀어 캐릭터와 서로 눈을 맞추는 순간이다. 뒤로는 잔잔한 파도가 넘실대는 바다가 화면 아래쪽을 채운다.
- **필수 상징**: 한 개의 컵과 그 속에서 고개를 내민 작은 물고기 · 컵과 눈을 맞추는 호기심 어린 캐릭터 · 뒤편의 잔잔한 바다와 물결 · 가볍고 산뜻한 옷차림
- **무드**: 장난스럽고 산뜻한 호기심, 밝은 바닷가 아침 / **팔레트**: 옅은 하늘색과 파도의 청록, 산뜻한 분홍 포인트
- **생성 프롬프트**:
  > A main character with the innocent curiosity of the Page of Cups standing by the seashore, lifting a single cup to eye level as a small fish pokes its head out of the cup to meet their gaze, gentle waves rippling across the sea behind, playful fresh seaside morning full of wonder, centered subject, vertical card composition, {STYLE}

### 컵 기사 (Knight of Cups) — `knight-of-cups`

- **본질**: 진심을 담아 다가오는 낭만적인 제안
- **장면**: 컵 기사의 낭만을 지닌 주인공 캐릭터가 차분히 걸어오는 탈것 위에 앉아, 한 손에 든 컵을 바치듯 앞으로 들어 보이며 다가온다. 투구와 신발에는 작은 날개 장식이 달려 있고, 옷에는 물고기 문양이 그려져 있다. 앞쪽에는 얕은 강이 흐르고 뒤로는 완만한 언덕이 이어진다.
- **필수 상징**: 앞으로 받쳐 든 한 개의 컵 · 천천히 걸어오는 탈것에 앉은 캐릭터 · 투구와 신발의 날개 장식 · 옷의 물고기 문양 · 앞을 가로지르는 얕은 강
- **무드**: 설렘을 전하러 오는 정중한 낭만, 부드러운 오후 빛 / **팔레트**: 은회색과 강물의 옅은 파랑, 붉은 물고기 문양 포인트
- **생성 프롬프트**:
  > A main character with the romantic grace of the Knight of Cups riding slowly forward on a calm mount, holding a single cup extended before them like a sincere offering, small wing ornaments on helmet and shoes, fish motifs on their garment, a shallow river crossing the foreground with gentle hills behind, courteous heartfelt approach in soft afternoon light, centered subject, vertical card composition, {STYLE}

### 컵 여왕 (Queen of Cups) — `queen-of-cups`

- **본질**: 마음 깊이 헤아리는 공감과 직관의 지혜
- **장면**: 컵 여왕의 온화함을 지닌 주인공 캐릭터가 바닷가 물가에 놓인 조개 장식 옥좌에 앉아 있다. 두 손으로 받쳐 든, 뚜껑이 닫힌 화려한 성배를 지그시 바라보며 그 안의 마음을 읽어 내는 듯하다. 옥좌 발치까지 잔잔한 물결이 밀려와 반짝이고, 발치에는 조약돌과 조개껍데기가 흩어져 있다.
- **필수 상징**: 두 손으로 받쳐 든 뚜껑 닫힌 화려한 성배 한 개 · 조개와 물결 장식의 옥좌 · 옥좌 발치까지 밀려온 잔잔한 물결 · 성배를 응시하는 그윽한 시선 · 조약돌과 조개껍데기
- **무드**: 고요하고 자애로운 사색, 은은한 해질 무렵 물빛 / **팔레트**: 진주빛 흰색과 깊은 바다 파랑, 은은한 은빛
- **생성 프롬프트**:
  > A main character with the gentle warmth of the Queen of Cups seated on a shell-adorned throne at the water's edge, holding an ornate lidded chalice in both hands and gazing into it with deep quiet intuition, calm waves lapping at the throne's base, pebbles and seashells scattered below, serene compassionate stillness in soft dusk light over water, centered subject, vertical card composition, {STYLE}

### 컵 왕 (King of Cups) — `king-of-cups`

- **본질**: 출렁이는 물결 위에서도 고요한 감정의 성숙
- **장면**: 컵 왕의 성숙함을 지닌 주인공 캐릭터가 출렁이는 바다 한가운데 떠 있는 돌 옥좌에 흔들림 없이 앉아 있다. 한 손에는 컵을, 다른 손에는 짧은 홀을 들고 정면을 향해 차분한 표정을 짓고 있으며, 목에는 물고기 모양 목걸이가 걸려 있다. 뒤편 파도 위로 물고기 한 마리가 뛰어오르고 멀리 배 한 척이 지나간다.
- **필수 상징**: 한 손에 든 컵 한 개와 다른 손의 짧은 홀 · 출렁이는 바다 위 돌 옥좌에 미동 없이 앉은 캐릭터 · 물고기 모양 목걸이 · 파도 위로 뛰어오르는 물고기 · 멀리 지나가는 배
- **무드**: 물결 속의 흔들림 없는 평정, 짙푸른 바다의 낮 / **팔레트**: 깊은 청록과 회청색 파도, 차분한 금빛 포인트
- **생성 프롬프트**:
  > A main character with the composed maturity of the King of Cups sitting unmoved on a stone throne floating amid a restless choppy sea, one hand holding a single cup and the other a short scepter, a fish-shaped pendant at their chest, a fish leaping from the waves and a distant ship sailing behind, steady calm authority over deep blue waters, centered subject, vertical card composition, {STYLE}

---

## 소드 (바람 · 이성 · 갈등)

### 소드 에이스 (Ace of Swords) — `ace-of-swords`

- **본질**: 혼란을 단숨에 가르는 명료한 진실의 힘
- **장면**: 구름 사이에서 뻗어 나온 손이 한 자루의 검을 하늘을 향해 곧게 치켜들고 있다. 검 끝은 황금 왕관을 꿰뚫고, 왕관에는 월계수 가지와 올리브 가지가 드리워져 있다. 검날 주위로 작은 금빛 불꽃이 흩날리고, 저 아래로는 험준한 산맥이 아득하게 펼쳐진다.
- **필수 상징**: 구름에서 나온 손 · 곧게 선 검 한 자루 · 검 끝에 꿰인 황금 왕관 · 왕관에 드리운 월계수·올리브 가지 · 흩날리는 금빛 불꽃 · 저 멀리 험준한 산맥
- **무드**: 차고 맑은 긴장감, 새벽의 예리한 첫 빛 / **팔레트**: 차가운 청회색 하늘에 강철빛 은색, 왕관의 금색 포인트
- **생성 프롬프트**:
  > A hand emerging from a cloud holding a single upright sword, its tip piercing a golden crown draped with laurel and olive branches, small golden sparks drifting around the blade, rugged mountains far below, crisp clear air of a sharp cold dawn, centered subject, vertical card composition, {STYLE}

### 소드 2 (Two of Swords) — `two-of-swords`

- **본질**: 눈을 가린 채 지키는 위태로운 균형
- **장면**: 주인공 캐릭터가 눈가리개를 한 채 밤바다를 등지고 돌 벤치에 앉아 있다. 가슴 앞에 팔을 엇갈려 두 자루의 검을 서로 반대 방향으로 비껴 들고, 미동도 없이 균형을 지킨다. 등 뒤 잔잔한 바다에는 바위섬들이 떠 있고 하늘에는 가는 초승달이 걸려 있다.
- **필수 상징**: 눈가리개를 한 주인공 캐릭터 · 가슴 앞에 엇갈려 든 검 두 자루 · 등 뒤의 잔잔한 밤바다 · 물 위의 바위섬들 · 가는 초승달
- **무드**: 숨을 죽인 정적과 팽팽한 긴장, 서늘한 달밤 / **팔레트**: 짙은 남색과 청회색, 달빛의 창백한 은백색
- **생성 프롬프트**:
  > The main character seated blindfolded on a stone bench with their back to a calm night sea, arms crossed over the chest holding exactly two long swords angled in opposite directions, rocky islets dotting the dark water behind, a thin crescent moon above, tense breathless stillness under cool moonlight, centered subject, vertical card composition, {STYLE}

### 소드 3 (Three of Swords) — `three-of-swords`

- **본질**: 마음을 관통하는 아픔과 피할 수 없는 진실
- **장면**: 폭풍이 몰려온 잿빛 하늘 한가운데에 커다란 상징적 심장 도상이 떠 있다. 세 자루의 검이 그 심장을 위에서 아래로 깨끗하게 관통하고 있으며, 피는 전혀 보이지 않는다. 주위의 짙은 먹구름에서 곧은 빗줄기가 화면 가득 내리꽂힌다.
- **필수 상징**: 상징적 심장 도상 (유혈 없음) · 심장을 관통한 검 세 자루 · 짙은 먹구름 · 곧게 내리꽂히는 빗줄기 · 잿빛 폭풍 하늘
- **무드**: 정화하듯 쏟아지는 슬픔, 비에 씻긴 흐린 낮 / **팔레트**: 잿빛과 짙은 청회색, 심장의 깊고 차분한 붉은색
- **생성 프롬프트**:
  > A large symbolic heart shape floating at the center of a stormy gray sky, pierced cleanly from above by exactly three straight swords, no blood, heavy rain falling in straight lines from dense dark clouds surrounding it, sorrowful cleansing atmosphere in dim rain-washed daylight, centered subject, vertical card composition, {STYLE}

### 소드 4 (Four of Swords) — `four-of-swords`

- **본질**: 다음 장을 위한 고요한 휴식과 재정비
- **장면**: 주인공 캐릭터가 조용한 예배당 안 돌 벤치 위에 두 손을 가슴에 모은 채 평온하게 누워 쉬고 있다. 머리맡 벽에는 정확히 세 자루의 검이 가로로 걸려 있고, 벤치 아래에는 한 자루의 검이 나란히 놓여 있다. 스테인드글라스 창으로 부드러운 색색의 빛이 스며들어 캐릭터를 감싼다.
- **필수 상징**: 돌 벤치 위에 평온하게 누운 주인공 캐릭터 · 가슴에 모은 두 손 · 벽에 걸린 검 세 자루 · 벤치 아래 놓인 검 한 자루 · 빛이 스며드는 스테인드글라스 창
- **무드**: 회복의 깊은 정적, 어스름한 실내에 스민 온화한 빛 / **팔레트**: 차분한 회청색 석조 톤에 스테인드글라스의 은은한 색빛
- **생성 프롬프트**:
  > The main character lying in peaceful rest on a stone bench inside a quiet chapel, hands folded over the chest, exactly three swords hanging horizontally on the wall above and one sword resting lengthwise beneath the bench, soft colored light streaming from a glowing stained-glass window, serene hush of deep recovery in dim tranquil interior light, centered subject, vertical card composition, {STYLE}

### 소드 5 (Five of Swords) — `five-of-swords`

- **본질**: 이겨도 남는 것 없는 상처뿐인 승리
- **장면**: 주인공 캐릭터가 화면 앞쪽에서 의기양양한 곁눈질로 정확히 세 자루의 검을 품에 그러모으고 있다. 발치에는 두 자루의 검이 버려진 채 놓여 있고, 저만치 두 인물이 어깨를 늘어뜨리고 거친 물가 쪽으로 걸어간다. 하늘에는 들쭉날쭉한 조각구름이 바람에 찢기며 흘러간다.
- **필수 상징**: 검 세 자루를 그러모은 주인공 캐릭터 · 땅에 버려진 검 두 자루 · 등을 돌리고 떠나는 두 인물 · 바람에 찢긴 들쭉날쭉한 구름 · 거친 물가
- **무드**: 승리 뒤의 공허한 뒷맛, 차고 세찬 바람의 낮 / **팔레트**: 탁한 청록색 하늘과 회갈색 땅, 서늘한 강철빛
- **생성 프롬프트**:
  > The main character standing in the foreground with a sly sidelong glance, gathering exactly three swords into their arms while exactly two more swords lie abandoned on the ground, two dejected figures walking away toward a rough shoreline, jagged wind-torn clouds racing overhead, hollow aftermath of a quarrel in cold gusty daylight, centered subject, vertical card composition, {STYLE}

### 소드 6 (Six of Swords) — `six-of-swords`

- **본질**: 험한 물을 뒤로하고 건너가는 조용한 전환
- **장면**: 주인공 캐릭터가 작은 나룻배의 고물에 서서 삿대를 밀며 거친 물을 뒤로하고 잔잔한 건너편 기슭으로 나아간다. 뱃머리에는 망토를 두른 동행자가 웅크리고 앉아 있고, 배 안에는 정확히 여섯 자루의 검이 곧게 꽂혀 있다. 앞쪽 수면은 매끄럽고, 멀리 안개 낀 기슭이 어렴풋이 보인다.
- **필수 상징**: 삿대를 미는 주인공 캐릭터 · 웅크린 동행자 · 배 안에 꽂힌 검 여섯 자루 · 뒤쪽의 거친 물과 앞쪽의 잔잔한 물 · 멀리 보이는 건너편 기슭
- **무드**: 쓸쓸하지만 안도가 스미는 이행, 안개 낀 이른 아침 / **팔레트**: 부드러운 회청색과 안개빛 은회색, 물빛 청색
- **생성 프롬프트**:
  > The main character standing at the stern of a small wooden boat, poling it away from rough water toward a calm far shore, a cloaked passenger sitting huddled in the bow, exactly six swords standing upright inside the boat, smooth gray water ahead and misty banks in the distance, gentle melancholy relief in early morning haze, centered subject, vertical card composition, {STYLE}

### 소드 7 (Seven of Swords) — `seven-of-swords`

- **본질**: 정면 대신 우회를 택한 위태로운 지략
- **장면**: 주인공 캐릭터가 진영의 천막들을 등지고 발끝으로 살금살금 빠져나가며 어깨 너머를 흘끔 돌아본다. 두 팔에는 정확히 다섯 자루의 검을 어설프게 끌어안았고, 등 뒤 땅에는 두 자루의 검이 그대로 꽂혀 남아 있다. 멀리 천막 위 깃발들이 바람에 나부낀다.
- **필수 상징**: 발끝으로 빠져나가는 주인공 캐릭터 · 품에 안은 검 다섯 자루 · 땅에 남겨진 검 두 자루 · 뒤쪽의 천막 진영 · 나부끼는 깃발 · 어깨 너머로 돌아보는 시선
- **무드**: 들킬 듯 말 듯한 긴장과 능청, 노르스름한 늦은 오후 / **팔레트**: 모래빛 황토색 바탕에 서늘한 강철 회색 대비
- **생성 프롬프트**:
  > The main character tiptoeing away from a cluster of camp tents, glancing back over one shoulder, carrying exactly five swords bundled awkwardly in both arms while exactly two swords remain planted upright in the ground behind, banners fluttering above the distant tents, sly suspenseful mischief in warm late-afternoon light, centered subject, vertical card composition, {STYLE}

### 소드 8 (Eight of Swords) — `eight-of-swords`

- **본질**: 스스로 만든 생각의 감옥과 가까운 출구
- **장면**: 주인공 캐릭터가 눈가리개를 하고 몸에 느슨하게 감긴 끈에 묶인 채 습지 위에 홀로 서 있다. 주위에는 정확히 여덟 자루의 검이 울타리처럼 땅에 꽂혀 캐릭터를 에워싸지만, 앞쪽으로는 빠져나갈 틈이 열려 있다. 발치의 얕은 물웅덩이가 잿빛 하늘을 비추고, 멀리 절벽 위 성이 보인다.
- **필수 상징**: 눈가리개와 느슨한 결박의 주인공 캐릭터 · 울타리처럼 꽂힌 검 여덟 자루 · 앞쪽으로 열린 틈 · 얕은 물웅덩이가 있는 습지 · 멀리 절벽 위의 성
- **무드**: 갇힌 듯하나 풀릴 듯한 긴장, 잿빛으로 흐린 낮 / **팔레트**: 흐린 회색과 습지의 청회색, 붉은 기 도는 결박 끈 포인트
- **생성 프롬프트**:
  > The main character standing loosely bound and blindfolded in a marshy field, encircled by exactly eight swords planted upright in the ground like a fence with an open gap in front, shallow puddles reflecting a gray sky, a castle on a distant cliff behind, trapped yet quietly hopeful tension in overcast muted daylight, centered subject, vertical card composition, {STYLE}

### 소드 9 (Nine of Swords) — `nine-of-swords`

- **본질**: 밤이 깊을수록 부풀어 오르는 걱정
- **장면**: 주인공 캐릭터가 한밤중 침대에서 상체를 일으켜 두 손에 얼굴을 파묻고 있다. 등 뒤 어두운 벽에는 정확히 아홉 자루의 검이 가로로 나란히 걸려 있고, 무릎 위에는 장미 무늬 조각보 이불이 덮여 있다. 창가에는 새벽이 다가오는 희미한 첫 빛이 어른거린다.
- **필수 상징**: 얼굴을 감싼 채 침대에 일어나 앉은 주인공 캐릭터 · 벽에 가로로 걸린 검 아홉 자루 · 장미 무늬 조각보 이불 · 깊은 밤의 어두운 방 · 창가의 희미한 새벽빛
- **무드**: 잠 못 드는 불안이 새벽으로 풀려 가는 시간, 깊은 밤 / **팔레트**: 먹빛에 가까운 짙은 남색, 이불의 장미색과 새벽의 옅은 청빛
- **생성 프롬프트**:
  > The main character sitting upright in bed in the middle of the night, face buried in both hands, exactly nine swords hanging horizontally on the dark wall behind, a quilt patterned with roses draped over the legs, a faint pale glow of approaching dawn at the window, heavy sleepless anxiety easing toward morning in deep night darkness, centered subject, vertical card composition, {STYLE}

### 소드 10 (Ten of Swords) — `ten-of-swords`

- **본질**: 바닥에 닿은 끝, 그 너머로 밝아 오는 새벽
- **장면**: 주인공 캐릭터가 밤이 끝나 가는 물가에 엎드려 미동 없이 누워 있고, 등을 따라 정확히 열 자루의 검이 상징적인 짐처럼 가지런히 꽂혀 있다. 상처나 피는 전혀 보이지 않는다. 눈앞의 바다는 잔잔하고, 수평선에서는 황금빛 새벽이 터져 나와 낮게 깔린 구름을 물들이기 시작한다.
- **필수 상징**: 엎드려 누운 주인공 캐릭터 (유혈 없음) · 등을 따라 꽂힌 검 열 자루 · 잔잔한 바다 · 수평선의 황금빛 새벽 · 새벽빛에 물드는 낮은 구름
- **무드**: 장엄한 끝맺음에 스미는 조용한 희망, 동트기 직전 / **팔레트**: 검은 밤빛에서 수평선의 금색·주황으로 번지는 그러데이션
- **생성 프롬프트**:
  > The main character lying face-down and still at the water's edge as night ends, exactly ten swords standing in a neat row along their back like a symbolic burden, no wound and no blood, a calm sea beyond, golden dawn breaking across the horizon and coloring the low clouds, solemn ending touched by quiet hope in the first light of daybreak, centered subject, vertical card composition, {STYLE}

### 소드 시종 (Page of Swords) — `page-of-swords`

- **본질**: 진실을 캐묻는 날쌘 호기심의 시선
- **장면**: 주인공 캐릭터가 젊은 관찰자의 원형으로, 바람 부는 언덕 위에 서서 한 자루의 검을 두 손으로 비스듬히 세워 들고 있다. 머리카락과 옷자락이 세찬 바람에 나부끼는 가운데 시선은 경계하듯 옆쪽 먼 곳을 살핀다. 하늘에는 빠르게 흐르는 구름과 멀리 새 떼가 날고, 언덕 아래 나무들이 바람에 휘어 있다.
- **필수 상징**: 언덕 위에 선 젊은 관찰자 원형의 주인공 캐릭터 · 두 손으로 세워 든 검 한 자루 · 옆을 살피는 경계의 시선 · 세찬 바람에 나부끼는 머리카락과 옷자락 · 빠르게 흐르는 구름과 새 떼 · 바람에 휜 나무들
- **무드**: 예리하고 재빠른 호기심, 바람 세찬 맑은 낮 / **팔레트**: 청명한 하늘색과 연둣빛 언덕, 강철빛 은색
- **생성 프롬프트**:
  > The main character as a youthful watcher standing on a windswept hill, holding a single sword upright in both hands while glancing alertly to one side, hair and clothes streaming in a strong wind, fast-moving clouds and a distant flock of birds overhead, wind-bent trees below, keen curious energy in bright breezy daylight, centered subject, vertical card composition, {STYLE}

### 소드 기사 (Knight of Swords) — `knight-of-swords`

- **본질**: 확신을 향해 바람처럼 내달리는 추진력
- **장면**: 주인공 캐릭터가 돌진하는 기사의 원형으로, 전력으로 질주하는 탈것 위에서 몸을 앞으로 기울인 채 한 자루의 검을 높이 치켜들고 있다. 망토가 바람에 길게 휘날리고, 하늘에는 폭풍 구름과 흩어지는 새들이 빠르게 스쳐 간다. 지상의 나무들도 바람에 세차게 휘어 속도감을 더한다.
- **필수 상징**: 질주하는 탈것 위의 기사 원형 주인공 캐릭터 · 높이 치켜든 검 한 자루 · 앞으로 기운 자세와 휘날리는 망토 · 폭풍 구름 · 흩어지는 새들 · 바람에 휜 나무들
- **무드**: 멈출 수 없는 맹렬한 기세, 폭풍 전의 거센 낮 / **팔레트**: 폭풍의 회청색 하늘에 은백색 섬광, 차가운 강철빛
- **생성 프롬프트**:
  > The main character as a charging knight galloping at full speed on a swift mount, leaning forward with a single sword raised high, cloak streaming behind in the wind, storm clouds and scattered birds racing across the sky, wind-whipped trees along the ground below, fierce unstoppable momentum in turbulent cool daylight, centered subject, vertical card composition, {STYLE}

### 소드 여왕 (Queen of Swords) — `queen-of-swords`

- **본질**: 슬픔을 통과해 단단해진 명철한 시선
- **장면**: 주인공 캐릭터가 명철한 여왕의 원형으로, 나비 문양이 새겨진 돌 왕좌에 옆모습으로 앉아 있다. 한 손에는 검 한 자루를 곧게 세워 들고, 다른 손은 앞을 향해 활짝 펴서 진실을 맞이하듯 내밀고 있다. 왕좌 아래에는 낮은 구름이 깔려 있고, 맑은 하늘 높이 새 한 마리가 날고 있다.
- **필수 상징**: 왕좌에 앉은 여왕 원형의 주인공 캐릭터 · 곧게 세워 든 검 한 자루 · 앞으로 내민 펼친 손 · 나비 문양이 새겨진 돌 왕좌 · 왕좌 아래의 낮은 구름 · 높이 나는 새 한 마리
- **무드**: 단호하지만 맑은 위엄, 서늘하고 청명한 오후 / **팔레트**: 옅은 하늘색과 흰 구름빛, 차분한 은회색과 청보라
- **생성 프롬프트**:
  > The main character as a stern clear-eyed queen seated in profile on a stone throne carved with butterflies, holding a single sword upright in one hand and extending the other hand open as if welcoming the truth, low clouds gathered beneath the throne, a single bird flying high in a clear sky, composed honest authority in cool crisp afternoon light, centered subject, vertical card composition, {STYLE}

### 소드 왕 (King of Swords) — `king-of-swords`

- **본질**: 이성과 원칙으로 다스리는 공정한 판단
- **장면**: 주인공 캐릭터가 위엄 있는 왕의 원형으로, 나비 문양이 새겨진 높은 돌 왕좌에 정면을 향해 앉아 있다. 한 손에는 검 한 자루를 곧게 세우되 살짝 기울여 들었고, 다른 손은 팔걸이 위에 고요히 얹혀 있다. 등 뒤 맑고 푸른 하늘에는 구름 몇 점과 새 두 마리가 높이 떠 있다.
- **필수 상징**: 정면으로 앉은 왕 원형의 주인공 캐릭터 · 살짝 기울여 세워 든 검 한 자루 · 나비 문양이 새겨진 높은 돌 왕좌 · 팔걸이에 얹은 고요한 손 · 맑은 하늘의 새 두 마리 · 구름 몇 점
- **무드**: 흔들림 없는 공정한 위엄, 맑고 고요한 한낮 / **팔레트**: 깊은 청색과 회청색 기조, 왕좌의 차분한 석회색
- **생성 프롬프트**:
  > The main character as a resolute king seated squarely and facing forward on a high stone throne carved with butterflies, holding a single sword upright with a slight tilt in one hand, the other hand resting calmly on the armrest, two birds high in a clear blue sky with a few drifting clouds behind, stern fair judgment in clear steady daylight, centered subject, vertical card composition, {STYLE}

---

## 펜타클 (흙 · 물질 · 안정)

### 펜타클 에이스 (Ace of Pentacles) — `ace-of-pentacles`

- **본질**: 현실에 뿌리내릴 풍요와 기회의 씨앗
- **장면**: 구름 사이로 나온 커다란 손이 별 문양이 새겨진 금빛 동전 하나를 정원 위로 내밀고 있다. 아래에는 백합이 핀 푸른 정원이 펼쳐지고, 꽃으로 덮인 아치문 너머로 먼 산길이 이어진다. 화면 중앙의 동전이 아침 햇살을 받아 환하게 빛난다.
- **필수 상징**: 구름에서 나온 손 · 별 문양 금빛 동전 정확히 1개 · 백합이 핀 정원 · 꽃으로 덮인 아치문 · 먼 산으로 이어지는 길
- **무드**: 맑은 아침 햇살, 희망찬 시작의 설렘 / **팔레트**: 싱그러운 초록과 금빛, 맑은 하늘색
- **생성 프롬프트**:
  > A hand reaching out from a soft cloud, offering exactly one large golden coin engraved with a five-pointed star, held above a green garden blooming with white lilies, a flower-covered archway opening onto a path toward distant mountains, fresh hopeful morning light full of promise, centered subject, vertical card composition, {STYLE}

### 펜타클 2 (Two of Pentacles) — `two-of-pentacles`

- **본질**: 두 가지 일 사이에서 즐기는 균형의 리듬
- **장면**: 주인공 캐릭터가 한 발로 가볍게 스텝을 밟으며 양손으로 별 문양 금빛 동전 두 개를 저글링하듯 굴리고 있다. 두 동전은 무한대 모양으로 휘감긴 리본으로 이어져 있다. 뒤편 출렁이는 바다 위로 배 두 척이 큰 파도를 타고 넘는다.
- **필수 상징**: 별 문양 금빛 동전 정확히 2개 · 무한대(∞) 모양으로 두 동전을 잇는 리본 · 출렁이는 큰 파도 · 파도를 타는 배 두 척 · 춤추듯 균형 잡는 자세
- **무드**: 경쾌한 리듬감, 활기찬 한낮 / **팔레트**: 따뜻한 주황·노랑에 바다의 청록 대비
- **생성 프롬프트**:
  > The main character dancing lightly on one foot while juggling exactly two golden coins engraved with five-pointed stars, the coins linked by a ribbon looping in an infinity shape, two ships riding tall rolling waves on the sea behind, playful midday energy with lively movement, centered subject, vertical card composition, {STYLE}

### 펜타클 3 (Three of Pentacles) — `three-of-pentacles`

- **본질**: 실력과 협력이 만나 쌓아 올리는 성과
- **장면**: 주인공 캐릭터가 작업대 위에 올라서서 연장을 들고 석조 아치를 다듬고 있고, 아치 윗부분에는 별 문양 동전 세 개가 문양처럼 새겨져 있다. 아래에서는 두 협력자 캐릭터가 도면을 펼쳐 들고 작업을 올려다보며 의견을 나눈다.
- **필수 상징**: 별 문양 동전 정확히 3개가 새겨진 석조 아치 · 연장을 들고 작업하는 주인공 캐릭터 · 도면을 든 두 협력자 캐릭터 · 작업대(발판) · 성당풍의 높은 석조 실내
- **무드**: 집중과 존중이 흐르는 차분한 실내 빛 / **팔레트**: 회색 석재에 금빛 문양, 차분한 갈색
- **생성 프롬프트**:
  > The main character standing on a workbench carving a stone arch set with exactly three golden five-pointed-star coins, holding a craft tool, while two collaborator characters below hold up an unrolled plan and look up in discussion, calm focused light inside a grand stone hall, centered subject, vertical card composition, {STYLE}

### 펜타클 4 (Four of Pentacles) — `four-of-pentacles`

- **본질**: 쥐고 지키려는 마음과 단단한 소유
- **장면**: 주인공 캐릭터가 낮은 돌 받침대에 앉아 별 문양 금빛 동전 하나를 두 팔로 가슴에 꼭 끌어안고 있다. 머리 위에 동전 한 개가 얹혀 있고 양발 아래에도 한 개씩 눌려 있어 동전은 모두 네 개다. 등 뒤 멀리 도시의 지붕들이 보인다.
- **필수 상징**: 별 문양 금빛 동전 정확히 4개 · 가슴에 꼭 끌어안은 동전 · 머리 위에 얹힌 동전 · 양발 아래 눌린 동전 두 개 · 웅크리고 앉은 자세 · 멀리 보이는 도시 실루엣
- **무드**: 긴장 어린 고요함, 흐린 오후 빛 / **팔레트**: 무게감 있는 회갈색에 금빛 포인트
- **생성 프롬프트**:
  > The main character seated on a low stone block hugging one golden five-pointed-star coin tightly to the chest, another coin balanced on top of the head and one pressed under each foot, exactly four coins in total, a distant city skyline far behind, tense guarded stillness under muted afternoon light, centered subject, vertical card composition, {STYLE}

### 펜타클 5 (Five of Pentacles) — `five-of-pentacles`

- **본질**: 시린 겨울을 함께 견디며 지나는 시간
- **장면**: 눈보라 치는 밤, 주인공 캐릭터가 목발을 짚은 동행 캐릭터를 부축하며 눈 쌓인 길을 걷고 있다. 곁의 건물 벽에는 별 문양 동전 다섯 개가 박힌 스테인드글라스 창이 따뜻한 빛을 내며 두 캐릭터의 발치를 비춘다.
- **필수 상징**: 별 문양 동전 정확히 5개가 박힌 스테인드글라스 창 · 눈 내리는 밤거리 · 서로 부축하며 걷는 두 캐릭터 · 목발과 낡은 옷차림 · 창에서 새어 나오는 따뜻한 빛
- **무드**: 시리도록 차가운 밤, 창가의 온기 / **팔레트**: 차가운 청회색 설경에 호박색 창빛 대비
- **생성 프롬프트**:
  > The main character supporting a weary companion character on a crutch as they walk through falling snow at night, passing beneath a glowing stained-glass window set with exactly five golden five-pointed-star coins, warm light from the window spilling onto the snowy ground around them, cold wintry night softened by amber warmth, centered subject, vertical card composition, {STYLE}

### 펜타클 6 (Six of Pentacles) — `six-of-pentacles`

- **본질**: 주고받음이 순환하는 너그러운 저울
- **장면**: 주인공 캐릭터가 한 손에 수평을 이룬 저울을 들고, 다른 손으로는 무릎 꿇은 두 캐릭터의 손에 금빛 동전을 건네고 있다. 화면에 보이는 별 문양 동전은 건네지는 것과 허공에 반짝이는 것을 합쳐 모두 여섯 개다.
- **필수 상징**: 별 문양 금빛 동전 정확히 6개 · 수평을 이룬 저울 · 동전을 건네는 손길 · 무릎 꿇고 손 내민 두 캐릭터 · 베푸는 주인공 캐릭터
- **무드**: 따뜻하고 공정한 한낮의 빛 / **팔레트**: 따뜻한 금빛과 안정적인 적갈색
- **생성 프롬프트**:
  > The main character standing and holding a perfectly balanced scale in one hand while placing golden coins into the open hands of two kneeling characters, exactly six five-pointed-star coins visible in the scene, an atmosphere of generosity and fairness under warm midday light, centered subject, vertical card composition, {STYLE}

### 펜타클 7 (Seven of Pentacles) — `seven-of-pentacles`

- **본질**: 결실을 기다리며 멈춰 서는 점검의 시간
- **장면**: 주인공 캐릭터가 긴 농기구에 몸을 기대어 턱을 괴듯 서서, 눈앞의 무성한 덤불을 물끄러미 바라보고 있다. 덤불에는 별 문양 금빛 동전 일곱 개가 열매처럼 매달려 있다. 발밑에는 갈아엎은 흙이 부드럽게 펼쳐진다.
- **필수 상징**: 별 문양 동전 정확히 7개가 매달린 덤불 · 긴 농기구에 기댄 주인공 캐릭터 · 갈아엎은 흙과 밭 · 생각에 잠긴 시선
- **무드**: 해 질 무렵의 사색적인 고요 / **팔레트**: 짙은 초록 잎과 황금빛, 흙갈색
- **생성 프롬프트**:
  > The main character leaning on a long farming tool, chin resting toward folded hands, quietly gazing at a leafy bush where exactly seven golden five-pointed-star coins hang like ripening fruit, freshly tilled earth soft underfoot, contemplative stillness in late-afternoon light, centered subject, vertical card composition, {STYLE}

### 펜타클 8 (Eight of Pentacles) — `eight-of-pentacles`

- **본질**: 하루하루 쌓아 올리는 성실한 연마
- **장면**: 주인공 캐릭터가 작업대에 앉아 끌과 망치로 금빛 동전에 별 문양을 새기고 있다. 완성된 동전들이 곁의 기둥에 가지런히 걸려 있어, 작업 중인 것까지 합치면 모두 여덟 개다. 저 멀리 배경에 작은 마을이 보인다.
- **필수 상징**: 별 문양 금빛 동전 정확히 8개 · 끌과 망치로 별을 새기는 손 · 작업대에 앉은 주인공 캐릭터 · 기둥에 가지런히 걸린 완성 동전들 · 멀리 보이는 작은 마을
- **무드**: 몰입한 장인의 차분한 오후 / **팔레트**: 차분한 갈색 작업장에 금빛 반짝임
- **생성 프롬프트**:
  > The main character seated at a workbench, carefully engraving a five-pointed star into a golden coin with hammer and chisel, finished coins hung neatly in a row on a post beside them, exactly eight coins in total, a small town far in the distance, an absorbed diligent mood in calm afternoon light, centered subject, vertical card composition, {STYLE}

### 펜타클 9 (Nine of Pentacles) — `nine-of-pentacles`

- **본질**: 스스로 일군 풍요를 누리는 여유
- **장면**: 주인공 캐릭터가 탐스럽게 익은 포도 넝쿨 정원 한가운데 서서, 장갑 낀 손 위에 얌전히 앉은 새 한 마리를 바라보고 있다. 넝쿨 사이에는 별 문양 금빛 동전 아홉 개가 포도송이처럼 자리 잡고 있다.
- **필수 상징**: 별 문양 금빛 동전 정확히 9개 · 탐스러운 포도 넝쿨 정원 · 장갑 낀 손 위에 앉은 길들인 새 · 여유로운 주인공 캐릭터 · 잘 가꾼 울타리 정원
- **무드**: 풍요로운 늦여름 오후의 한가로움 / **팔레트**: 깊은 초록과 포도빛 보라, 넉넉한 금빛
- **생성 프롬프트**:
  > The main character standing at ease in a lush walled garden of ripe grapevines, a small tame bird perched calmly on their gloved hand, exactly nine golden five-pointed-star coins nestled among the vines like clusters of fruit, a leisurely late-summer afternoon of quiet self-made abundance, centered subject, vertical card composition, {STYLE}

### 펜타클 10 (Ten of Pentacles) — `ten-of-pentacles`

- **본질**: 세대를 이어 흐르는 안정과 번영
- **장면**: 나이 든 주인공 캐릭터가 커다란 돌 아치문 아래 앉아 곁에 다가온 개 두 마리를 쓰다듬고 있다. 아치 너머 마당에서는 가족 캐릭터들과 아이가 정답게 이야기를 나눈다. 화면 곳곳에 별 문양 금빛 동전 열 개가 문장처럼 배열되어 있다.
- **필수 상징**: 별 문양 금빛 동전 정확히 10개 · 커다란 돌 아치문 · 나이 든 주인공 캐릭터 · 마당의 가족 캐릭터들과 아이 · 개 두 마리
- **무드**: 포근하고 유서 깊은 오후의 안정감 / **팔레트**: 따뜻한 석재 빛과 풍성한 금빛, 포도색
- **생성 프롬프트**:
  > An elderly main character seated beneath a grand stone archway gently petting two loyal dogs, family characters and a child talking warmly in the courtyard beyond, exactly ten golden five-pointed-star coins arranged across the scene like an emblem pattern, settled generational warmth in soft afternoon light, centered subject, vertical card composition, {STYLE}

### 펜타클 시종 (Page of Pentacles) — `page-of-pentacles`

- **본질**: 배움의 씨앗을 소중히 들여다보는 열의
- **장면**: 탐구자 모습의 주인공 캐릭터가 갈아엎은 들판 한가운데 서서, 두 손으로 받쳐 든 별 문양 금빛 동전 하나를 눈높이까지 올려 골똘히 들여다보고 있다. 멀리 갓 심은 어린 나무들과 부드러운 능선이 이어진다.
- **필수 상징**: 별 문양 금빛 동전 정확히 1개 · 두 손으로 동전을 눈높이에 받쳐 든 자세 · 갈아엎은 들판 · 멀리 보이는 어린 나무들과 능선
- **무드**: 호기심 가득한 맑은 낮의 집중 / **팔레트**: 새싹 같은 연둣빛과 흙빛, 금빛 포인트
- **생성 프롬프트**:
  > The main character as a young studious explorer standing in a freshly tilled field, holding exactly one golden five-pointed-star coin up at eye level with both hands and gazing at it with complete absorption, young trees and gentle hills in the distance, bright clear daylight full of curiosity, centered subject, vertical card composition, {STYLE}

### 펜타클 기사 (Knight of Pentacles) — `knight-of-pentacles`

- **본질**: 느리지만 확실하게 나아가는 성실함
- **장면**: 기사 모습의 주인공 캐릭터가 갈아 놓은 밭 사이에 묵직한 말을 멈춰 세우고, 손에 든 별 문양 금빛 동전 하나를 지긋이 바라보고 있다. 말은 움직임 없이 단단히 서 있고, 지평선까지 정돈된 밭고랑이 이어진다.
- **필수 상징**: 별 문양 금빛 동전 정확히 1개 · 미동 없이 멈춰 선 묵직한 말 · 기사 모습의 주인공 캐릭터 · 지평선까지 이어진 정돈된 밭고랑
- **무드**: 묵직하고 신뢰감 있는 한낮의 들녘 / **팔레트**: 짙은 흙갈색과 차분한 녹색, 금빛
- **생성 프롬프트**:
  > The main character as a steadfast knight seated on a sturdy horse standing perfectly still amid neatly furrowed fields, holding exactly one golden five-pointed-star coin and regarding it with calm resolve, tidy plowed rows stretching to the horizon, a dependable unhurried midday mood, centered subject, vertical card composition, {STYLE}

### 펜타클 여왕 (Queen of Pentacles) — `queen-of-pentacles`

- **본질**: 일상을 풍요롭게 가꾸는 넉넉한 보살핌
- **장면**: 너그러운 보호자 모습의 주인공 캐릭터가 꽃과 열매 문양이 새겨진 옥좌에 앉아, 무릎 위의 별 문양 금빛 동전 하나를 두 손으로 부드럽게 감싸 내려다보고 있다. 머리 위로 장미 넝쿨이 아치를 이루고, 발치 풀숲에서 토끼 한 마리가 고개를 내민다.
- **필수 상징**: 별 문양 금빛 동전 정확히 1개 · 꽃과 열매 문양이 새겨진 옥좌 · 머리 위 장미 넝쿨 아치 · 발치의 토끼 · 무릎 위 동전을 감싼 손길
- **무드**: 온화하고 안락한 늦은 오후의 정원 / **팔레트**: 붉은 장미와 초록, 포근한 금빛
- **생성 프롬프트**:
  > The main character as a warm nurturing sovereign seated on a throne carved with fruit and flower motifs, cradling exactly one golden five-pointed-star coin on their lap and gazing down at it tenderly, an arch of blooming roses overhead, a small rabbit peeking from the grass below, gentle late-afternoon garden serenity, centered subject, vertical card composition, {STYLE}

### 펜타클 왕 (King of Pentacles) — `king-of-pentacles`

- **본질**: 현실을 다스리는 확고한 성공과 관록
- **장면**: 위엄 있는 통치자 모습의 주인공 캐릭터가 황소 머리 문양이 새겨진 옥좌에 앉아, 한 손으로 별 문양 금빛 동전 하나를 받치고 다른 손에는 홀을 들고 있다. 포도 넝쿨 무늬 망토가 흘러내리고, 등 뒤로 견고한 성벽이 솟아 있다.
- **필수 상징**: 별 문양 금빛 동전 정확히 1개 · 황소 머리 문양이 새겨진 옥좌 · 손에 든 홀 · 포도 넝쿨 무늬 망토 · 뒤편의 견고한 성벽
- **무드**: 묵직한 위엄, 황금빛 해 질 녘 / **팔레트**: 짙은 녹색과 포도색에 깊은 금빛
- **생성 프롬프트**:
  > The main character as a dignified sovereign of prosperity seated on a throne carved with bull-head motifs, one hand resting on exactly one golden five-pointed-star coin, the other holding a scepter, a robe patterned with grapevines draped around them, a solid castle wall rising behind, stately golden-hour gravity, centered subject, vertical card composition, {STYLE}
