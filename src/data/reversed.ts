// 역방향(reversed) 카드 해석. 정방향은 ko.ts / cards.ts가 갖는다.
//
// 근거는 A.E. Waite, The Pictorial Key to the Tarot(1911)의 각 카드
// "Reversed" 점의다. 1911년 저작이라 퍼블릭 도메인이지만 문장을 그대로
// 옮기지는 않았다 — 빅토리아식 어휘가 이 앱의 결과 맞지 않아, 뜻만 가져와
// 정방향 해석문과 같은 목소리로 새로 썼다.
//
// 역방향은 정방향의 반대가 아니라 같은 힘이 지연되거나 안으로 향하거나
// 과한 상태다. Waite의 역방향이 오히려 밝은 카드도 있다(완드 4·소드 4 등).
// 컵 2는 Waite에 역방향 항목이 없어 정방향이 막힌 상태로 도출했다.

export type ReversedText = { ko: string; en: string };

export const reversedCards: Record<string, ReversedText> = {
  "the-fool": {
    ko: "역방향의 바보는 시작하려는 마음이 아직 발을 떼지 못한 상태를 비춥니다. 호기심은 있는데 준비가 따라오지 않았거나, 한 곳에 쏟았어야 할 주의가 여러 갈래로 흩어져 버린 때이기도 합니다.\n\n새로 벌이기보다 이미 벌여 둔 것을 먼저 살펴보세요. 무엇을 향해 가고 있었는지 다시 확인하고 나면, 같은 한 걸음도 훨씬 가벼워집니다.",
    en: "Reversed, the Fool speaks of a beginning that has not quite left the ground. The curiosity is there but the readiness is not, or the attention meant for one leap has scattered across several.\n\nRather than starting something new, look first at what you have already set in motion. Once you can name where you were heading, the same step forward carries much less weight.",
  },
  "the-magician": {
    ko: "역방향의 마법사는 재능과 도구는 그대로인데 마음이 흔들리는 상태를 비춥니다. 생각이 어수선해 집중이 흩어지거나, 자신의 능력을 의심하느라 가진 힘을 절반도 쓰지 못하는 때일 수 있습니다.\n\n큰 결정이나 새 시도는 잠시 미루고, 마음을 어지럽히는 것부터 정리해 보세요. 의지가 다시 한 곳으로 모이면, 손안의 도구들은 언제든 제 몫을 해낼 준비가 되어 있습니다.",
    en: "Reversed, the Magician finds the tools still in hand but the mind unsettled. Focus scatters, doubt creeps in, and the skill that usually flows with ease feels just out of reach.\n\nBefore making the next big move, tend to whatever is stirring the disquiet. Clear a little space in your thoughts and let your intention gather again. The ability has not gone anywhere; it is only waiting for a steadier hand to hold it.",
  },
  "the-high-priestess": {
    ko: "역방향의 여사제는 안쪽의 조용한 목소리가 바깥의 소음에 묻힌 상태를 비춥니다. 마음이 뜨겁게 달아올라 차분함을 잃었거나, 겉으로 아는 것만으로 이미 다 안다고 여기기 쉬운 때이기도 합니다.\n\n결론을 서두르기 전에 한 겹 더 깊이 들어가 보세요. 조금 느리게, 조금 조용하게 머무르다 보면 처음의 판단 아래에 있던 다른 답이 떠오를 수 있습니다.",
    en: "Reversed, the High Priestess suggests the quiet inner voice is being drowned out. Feelings may be running hot, or a first impression is standing in for real understanding, while the deeper knowing waits in silence beneath the surface.\n\nBefore settling on an answer, sit with the question a little longer. What you know at a glance may not be all there is; give the slower, softer knowledge time to rise.",
  },
  "the-empress": {
    ko: "역방향의 여황제는 얽혀 있던 일이 풀리기 시작하는 흐름을 비춥니다. 가려져 있던 사실이 빛 속으로 나오고 꼬였던 매듭이 하나씩 느슨해지는 때이지만, 그 과정에서 마음이 이랬다저랬다 흔들리기도 합니다.\n\n드러나는 것을 애써 붙잡거나 밀어내지 말고 그대로 보이게 두세요. 결정을 자꾸 뒤집게 된다면, 지금은 정하는 때가 아니라 밝혀지는 때라는 신호일 수 있습니다.",
    en: "Reversed, the Empress points to tangles beginning to loosen. What was hidden moves toward the light, involved matters start to unravel, and truth finds its way into the open — though the process can leave you wavering, changing your mind more often than you would like.\n\nLet what is surfacing be seen without rushing to act on it. If your decisions keep flipping, take it as a sign: this is a season for things to become clear, not yet a season to commit.",
  },
  "the-emperor": {
    ko: "역방향의 황제는 단단하던 질서가 조금 무르게 풀린 상태를 비춥니다. 엄격함 대신 너그러움이 앞서는 때일 수도 있고, 세우려는 틀이 아직 다 여물지 않아 일이 곳곳에서 걸리는 때일 수도 있습니다.\n\n지금은 권위로 밀어붙이기보다 부드러움이 더 많은 것을 지켜 줍니다. 다만 무엇을 위해 그 틀을 세우려 했는지는 놓치지 마세요. 구조는 조금 더 자란 뒤에 다시 세워도 늦지 않습니다.",
    en: "Reversed, the Emperor shows structure loosening its grip. Sometimes that looks like kindness where sternness was expected; sometimes the framework you are building is simply not ready to bear weight yet, and things catch and stall along the way.\n\nFor now, gentleness may hold more together than force. Just keep sight of why you wanted the structure in the first place — the rules can be rebuilt later, once they have had time to mature.",
  },
  "the-hierophant": {
    ko: "역방향의 교황은 어울림과 화합이 앞서는 때를 비춥니다. 다만 그 다정함이 지나쳐, 모두의 뜻에 맞추느라 정작 자신의 뜻은 말하지 못하고 있는 것은 아닌지 함께 묻는 카드입니다.\n\n좋은 관계를 위해 무엇을 양보하고 있는지 한번 살펴보세요. 친절과 동의는 같은 것이 아닙니다. 부드럽게, 그러나 분명하게 자신의 자리를 지키는 연습이 지금 필요한 배움일 수 있습니다.",
    en: "Reversed, the Hierophant speaks of harmony and belonging — and asks, gently, what they are costing you. Kindness may be tipping into over-accommodation, agreement offered so easily that your own convictions never quite get said aloud.\n\nNotice what you concede for the sake of getting along. Being kind and going along are not the same thing. The lesson here may be learning to hold your place in the circle softly, but clearly.",
  },
  "the-lovers": {
    ko: "역방향의 연인은 마음과 선택이 어긋나 있는 상태를 비춥니다. 관계나 계획이 뜻대로 이어지지 않거나, 진심이 아닌 다른 이유로 기울어진 선택 위에 서 있는 때일 수 있습니다.\n\n지금 붙잡고 있는 것이 정말 원하는 것인지 조용히 물어보세요. 어긋남은 실패라기보다, 무엇이 소중한지 다시 고르라는 초대일 수 있습니다. 방향이 맞으면 이어짐은 다시 가능해집니다.",
    en: "Reversed, the Lovers points to a misalignment between the heart and the choice. A connection or a plan may be meeting resistance, or you may find yourself leaning toward something for reasons that are not quite your own.\n\nAsk quietly whether what you are holding onto is what you truly want. This friction is less a failure than an invitation to choose again, more honestly. When the direction is true, the connection has room to follow.",
  },
  "the-chariot": {
    ko: "역방향의 전차는 앞으로 나아가던 힘이 마찰로 새어 나가는 상태를 비춥니다. 서로 다른 방향의 고집이 부딪히거나, 밀어붙일수록 오히려 바퀴가 헛도는 때일 수 있습니다.\n\n지금은 속도를 올리기보다 고삐를 다시 잡는 것이 먼저입니다. 누구와, 무엇과 힘겨루기를 하고 있는지 살펴보세요. 방향이 하나로 모이면 잃었던 추진력은 자연스럽게 되돌아옵니다.",
    en: "Reversed, the Chariot shows forward motion leaking away into friction. Wills pull in different directions, disputes flare where progress should be, and the harder you push, the more the wheels seem to spin in place.\n\nThis is a moment to take up the reins again rather than press the pace. Look at what — or whom — you are straining against. Once the directions gather into one, the momentum tends to find its own way back.",
  },
  "strength": {
    ko: "역방향의 힘은 부드러움과 단단함의 균형이 한쪽으로 기운 상태를 비춥니다. 억지로 밀어붙여 힘으로 해결하려 하거나, 반대로 스스로에 대한 믿음이 줄어 목소리를 잃어버린 때일 수 있습니다.\n\n지금 필요한 것은 더 센 힘이 아니라 자신을 대하는 다정함입니다. 두려워하는 것을 달래듯 스스로를 달래 보세요. 조용한 용기는 사라진 것이 아니라 잠시 숨을 고르고 있을 뿐입니다.",
    en: "Reversed, Strength shows the balance between firmness and gentleness tipping to one side. Perhaps force is being used where patience was needed, or perhaps confidence has thinned and the quiet courage has lost its voice.\n\nWhat is called for now is not more power but more kindness toward yourself. Soothe what is frightened in you the way you would soothe anything wild. The gentle strength has not left; it is only catching its breath.",
  },
  "the-hermit": {
    ko: "역방향의 은둔자는 성찰을 위한 물러남이 숨어 있는 쪽으로 기운 상태를 비춥니다. 신중함이라 여겼던 것이 사실은 이유를 잃은 조심스러움이거나, 두려움이 등불을 가리고 있는 때일 수 있습니다.\n\n혼자만의 시간이 무엇을 위한 것이었는지 다시 물어보세요. 얻을 것을 얻었다면 이제 문을 조금 열어도 됩니다. 등불은 감추라고 있는 것이 아니라 다음 걸음을 비추라고 있는 것입니다.",
    en: "Reversed, the Hermit suggests that retreat has drifted into hiding. What began as careful reflection may have become caution without a reason, and fear rather than wisdom may be shading the lantern.\n\nAsk yourself again what the solitude was for. If it has given you what you needed, it may be time to open the door a little. The lantern was never meant to be hidden away — it exists to light the next step.",
  },
  "wheel-of-fortune": {
    ko: "역방향의 운명의 수레바퀴는 흐름이 멈춘 것이 아니라 오히려 넘치게 도는 상태를 비춥니다. 들어오는 것이 많아 풍요롭지만, 그만큼 필요 이상의 것들까지 함께 쌓이는 때일 수 있습니다.\n\n지금은 더 얻으려 하기보다 가려내는 눈이 필요합니다. 무엇이 정말 남길 것이고 무엇이 스쳐 가는 것인지 살펴보세요. 넘치는 시기를 잘 추린 사람이 다음 순환도 가볍게 맞이합니다.",
    en: "Reversed, the Wheel of Fortune does not stop turning — if anything, it gives more than was asked for. Abundance arrives, and with it a surplus: more options, more input, more of everything than one season can hold.\n\nThe skill needed now is not gathering but sorting. Ask what is truly worth keeping and what is simply passing through. Those who sift a plentiful season well step into the next turn of the wheel travelling light.",
  },
  "justice": {
    ko: "역방향의 정의는 저울이 한쪽으로 기울어 있는 상태를 비춥니다. 판단에 선입견이 섞여 있거나, 자신이나 누군가를 필요 이상으로 가혹하게 재고 있는 때일 수 있습니다. 일이 절차에 얽혀 더디게 풀리기도 합니다.\n\n결론을 내리기 전에 저울 위에 무엇을 올렸는지 다시 살펴보세요. 공정함은 엄격함이 아니라 치우침 없음에서 옵니다. 특히 자신에게 내리는 판결이 너무 무겁지 않은지 확인해 보시기 바랍니다.",
    en: "Reversed, Justice shows the scales tipped out of true. A judgement may be carrying more bias than it appears to, or a standard — often the one applied to yourself — has grown harsher than the situation deserves. Matters may also be tangled in process, moving slower than feels fair.\n\nBefore delivering a verdict, look again at what sits on each side of the scale. Fairness is not severity. Check, especially, whether the sentence you are passing on yourself is heavier than the case warrants.",
  },
  "the-hanged-man": {
    ko: "역방향의 매달린 사람은 멈춤이 제 역할을 하지 못하는 상태를 비춥니다. 내려놓아야 할 것을 붙잡고 있거나, 자신의 시선 대신 여러 사람의 목소리에 매달려 있는 때일 수 있습니다.\n\n지금의 기다림이 무엇을 위한 것인지 스스로에게 물어보세요. 남들이 보는 각도가 아니라, 거꾸로 매달려서만 보이는 나만의 풍경이 있습니다. 그 시야를 되찾을 때 멈춤은 다시 의미를 갖습니다.",
    en: "Reversed, the Hanged Man suggests the pause has stopped doing its work. You may be holding on where letting go was the point, or hanging on the opinions of the crowd instead of the view that is yours alone.\n\nAsk what this waiting is actually for. There is a perspective that comes only from your own strange angle, not from where everyone else is standing. When you reclaim that view, the stillness begins to mean something again.",
  },
  "death": {
    ko: "역방향의 죽음은 끝나야 할 것이 끝나지 못하고 멈춰 있는 상태를 비춥니다. 변화를 미루는 사이 삶이 제자리에서 잠든 듯 무거워지고, 희망도 함께 흐려지는 때일 수 있습니다.\n\n무엇을 놓지 못하고 있는지 가만히 들여다보세요. 끝맺음은 잃는 일이 아니라 다음이 들어올 자리를 마련하는 일입니다. 작은 것 하나라도 매듭을 지어 보면, 멈춰 있던 흐름이 다시 움직이기 시작합니다.",
    en: "Reversed, Death speaks of an ending that has not been allowed to finish. Change waits at the door while life holds still — heavy, drowsy, caught in place — and hope dims not because it is gone, but because nothing is moving.\n\nLook gently at what you have not yet released. An ending is not a loss so much as the clearing of a space. Close even one small chapter, and the current that seemed frozen begins, slowly, to move again.",
  },
  "temperance": {
    ko: "역방향의 절제는 섞이던 것들이 서로 겉도는 상태를 비춥니다. 여러 일과 관계, 바람이 조화를 이루지 못하고 각자 자기 몫을 다투는 때일 수 있습니다. 어울리지 않는 조합을 억지로 붙들고 있는 것인지도 모릅니다.\n\n모든 것을 한 잔에 담으려 애쓰기보다, 지금 섞고 있는 것들이 서로 맞는지 먼저 살펴보세요. 무리한 배합을 내려놓는 것도 조율의 한 방법입니다. 균형은 덜어낸 자리에서 다시 시작됩니다.",
    en: "Reversed, Temperance shows a blend that is not quite taking. Commitments, relationships, and hopes may be competing for the same hours rather than flowing together, and some combinations may simply not belong in the same cup.\n\nInstead of working harder to mix everything, first ask whether these elements actually suit one another. Setting down an ill-matched pairing is also a form of balance. Harmony often begins not with adding more, but with pouring a little out.",
  },
  "the-devil": {
    ko: "역방향의 악마는 묶임이 크고 뚜렷한 사슬이 아니라 작고 눈에 띄지 않는 고리들로 이어져 있는 상태를 비춥니다. 사소한 미련, 자잘한 자기 비하, 못 본 척해 온 패턴이 조용히 힘을 빼앗는 때일 수 있습니다.\n\n거창한 결심보다 작은 알아차림이 먼저입니다. 오늘 나를 붙잡은 가장 작은 고리 하나를 찾아보세요. 작은 사슬은 작게 풀립니다. 그 하나를 푸는 감각이 나머지를 푸는 길을 알려 줍니다.",
    en: "Reversed, the Devil binds not with heavy chains but with small, almost invisible ones. Minor habits, little self-diminishments, patterns kept just out of sight — each too small to seem worth naming, together quietly draining your strength.\n\nStart with noticing rather than with grand resolutions. Find the smallest link that caught you today. Small chains come undone in small ways, and the feel of loosening one teaches your hands how to loosen the rest.",
  },
  "the-tower": {
    ko: "역방향의 탑은 무너질 것이 무너지지 못한 채 압력만 쌓여 가는 상태를 비춥니다. 흔들림은 작게 지나갔지만, 그 안에 갇힌 듯 답답한 구조 속에서 버티고 있는 때일 수 있습니다.\n\n큰 붕괴를 기다리기보다 벽돌 하나씩 스스로 내리는 쪽을 택해 보세요. 나를 조이고 있는 것에 이름을 붙이는 것부터가 시작입니다. 스스로 여는 문은 무너지는 벽보다 훨씬 덜 아픕니다.",
    en: "Reversed, the Tower holds its breath — the collapse that wants to happen is being held off, and pressure builds inside walls that have begun to feel like a cell. The shaking passes in smaller tremors, but the confinement remains.\n\nRather than waiting for the great fall, consider taking the structure down brick by brick yourself. Naming what is pressing in on you is the first stone lifted. A door you open costs far less than a wall that comes down on its own.",
  },
  "the-star": {
    ko: "역방향의 별은 희망과 나 사이의 연결이 흐려진 상태를 비춥니다. 다 안다는 자신감으로 그 빛을 대수롭지 않게 여기거나, 반대로 무엇을 해도 소용없다는 무력감에 잠겨 있는 때일 수 있습니다.\n\n하늘을 다시 올려다보는 데에는 대단한 계기가 필요하지 않습니다. 작은 회복 하나, 고요한 시간 하나면 충분합니다. 별은 꺼진 것이 아니라, 잠시 시선이 다른 곳에 가 있었을 뿐입니다.",
    en: "Reversed, the Star suggests the thread between you and hope has gone slack. Sometimes it is confidence curdling into pride, certain the light has nothing left to teach; sometimes it is the opposite — a heaviness that whispers nothing you do will matter.\n\nFinding the sky again does not require a grand occasion. One small act of restoration, one quiet hour, is enough to look up. The star has not gone out; your gaze has simply been elsewhere for a while.",
  },
  "the-moon": {
    ko: "역방향의 달은 짙던 안개가 옅어지고는 있지만 발밑이 아직 흔들리는 상태를 비춥니다. 큰 혼란은 지나갔어도 마음이 이랬다저랬다 하고, 알고 싶은 것 앞에서 침묵만 돌아오는 때일 수 있습니다.\n\n다 밝아지기를 기다리며 멈춰 있기보다, 지금 보이는 만큼만 걸어 보세요. 확실한 답이 없는 시기에는 작고 되돌릴 수 있는 걸음이 가장 믿을 만합니다. 안개는 걷히는 중입니다.",
    en: "Reversed, the Moon shows the fog thinning while the ground still shifts underfoot. The deeper confusions are passing, but smaller ones linger — moods that change without warning, questions that keep meeting silence instead of answers.\n\nRather than waiting for full daylight, walk only as far as you can currently see. In a season without certainty, small reversible steps are the most trustworthy kind. The mist is lifting; it simply is not finished yet.",
  },
  "the-sun": {
    ko: "역방향의 태양은 빛이 사라진 것이 아니라 구름에 한 겹 가려진 상태를 비춥니다. 기쁨과 만족이 분명 곁에 있는데 그 온기가 온전히 느껴지지 않거나, 마음껏 누리기를 스스로 망설이는 때일 수 있습니다.\n\n크고 완전한 행복을 기다리느라 작은 즐거움을 미루지 마세요. 흐린 날에도 해는 그 자리에 있습니다. 오늘 만난 작은 온기를 충분히 반기는 것에서 빛은 다시 넓어집니다.",
    en: "Reversed, the Sun has not gone out — it is only behind a thin layer of cloud. The joy and contentment are still near, but their warmth reaches you at a lower brightness, or you find yourself hesitating to enjoy them fully.\n\nDo not postpone small pleasures while waiting for complete happiness to arrive. Even on an overcast day, the sun keeps its place. Welcoming whatever warmth today offers is how the light begins to widen again.",
  },
  "judgement": {
    ko: "역방향의 심판은 부름은 이미 들려왔는데 대답이 머뭇거리는 상태를 비춥니다. 새로워질 기회 앞에서 마음이 작아졌거나, 내려야 할 결정을 미룬 채 판단만 거듭하고 있는 때일 수 있습니다.\n\n스스로를 심판하는 데 힘을 다 쓰지 않아도 됩니다. 지난 일은 배움으로 남기고, 미뤄 둔 대답 가운데 가장 작은 것 하나에 먼저 응답해 보세요. 일어서는 일은 거기서 시작됩니다.",
    en: "Reversed, Judgement suggests the call has already sounded while the answer hesitates. Faced with a chance to begin again, the heart may have grown small, or a decision keeps being weighed without ever being made.\n\nYou do not have to spend all your strength passing sentence on yourself. Let what has passed remain as learning, and answer the smallest of the postponed calls first. The rising begins there.",
  },
  "the-world": {
    ko: "역방향의 세계는 마무리되어야 할 순환이 아직 닫히지 못한 상태를 비춥니다. 거의 다 왔는데 마지막 한 걸음이 미뤄지고 있거나, 끝난 줄 알았던 일이 여전히 마음 한켠을 차지하고 있는 때이기도 합니다.\n\n무엇이 완결을 미루고 있는지 가만히 살펴보세요. 서두를 필요는 없습니다. 남은 매듭 하나를 정직하게 짓고 나면, 멈춘 듯 보이던 흐름이 다시 움직일 자리를 찾습니다.",
    en: "Reversed, the World speaks of a cycle that has not quite closed. You may be nearly there with the last step postponed, or something you thought finished may still be quietly taking up room.\n\nLook gently at what is keeping the ending open. Once you name the one loose thread and tie it honestly, a flow that seemed frozen tends to find its way into motion again.",
  },
  "ace-of-cups": {
    ko: "역방향의 컵 에이스는 새로 흐르기 시작해야 할 감정이 어딘가에서 막혀 있는 상태를 비춥니다. 마음을 열고 싶은데 확신이 서지 않거나, 겉으로 보이는 감정과 속마음이 조금 어긋나 있는 때이기도 합니다.\n\n지금은 감정을 서둘러 내보이기보다 그 결을 먼저 찬찬히 들여다볼 시간입니다. 이 마음이 정말 어디에서 오는지 확인하고 나면, 다시 흐를 길이 자연스럽게 보입니다.",
    en: "Reversed, the Ace of Cups points to feeling that wants to flow but has met a block. You may long to open your heart without quite trusting it yet, or what shows on the surface may not match what moves underneath.\n\nRather than pouring the feeling out, sit with it first. When you can tell where it truly comes from, the way for it to flow tends to appear on its own.",
  },
  "two-of-cups": {
    ko: "역방향의 컵 2는 두 마음이 만나야 할 자리에서 미묘하게 어긋나 있는 상태를 비춥니다. 주고받음의 균형이 한쪽으로 기울었거나, 하고 싶은 말이 서로에게 닿지 못하고 각자의 안에 머물러 있는 때이기도 합니다.\n\n큰 화해보다 작은 정직이 먼저입니다. 마음에 담아 둔 것 하나를 부드럽게 꺼내 보세요. 연결은 끊어진 것이 아니라, 다시 이어 줄 손길을 기다리고 있을 뿐입니다.",
    en: "Reversed, the Two of Cups shows two hearts slightly out of step where they meant to meet. The balance of give and take may have tilted, or words meant for each other may be staying inside, unspoken.\n\nBefore any grand repair, try one small honesty. Gently offer a single thing you have been holding back. The connection is not broken — it is waiting for a hand to reach across.",
  },
  "three-of-cups": {
    ko: "역방향의 컵 3은 함께하는 기쁨이 조금 과해진 상태를 비춥니다. 즐거움이 쉼이 아니라 소모가 되어 가고 있거나, 어울림 속에서 정작 나 자신은 뒷전이 된 때이기도 합니다. 한 시절의 모임이 자연스럽게 끝나 가는 신호일 수도 있습니다.\n\n자리를 다 떠날 필요는 없습니다. 다만 무엇이 나를 채우고 무엇이 비우는지 가려 보세요. 조금 덜어 낸 즐거움이 오히려 더 오래갑니다.",
    en: "Reversed, the Three of Cups suggests shared joy that has tipped into a little too much. Pleasure may be draining rather than restoring you, or amid all the company you may have slipped out of your own view. It can also mark a gathering season drawing naturally to its close.\n\nYou need not leave the table entirely. Just notice which delights fill you and which empty you — joy taken a little lighter tends to last longer.",
  },
  "four-of-cups": {
    ko: "역방향의 컵 4는 오래 머물던 권태가 걷히기 시작하는 상태를 비춥니다. 시들해 보이기만 하던 자리에 새로운 관심이 스며들고, 낯선 사람이나 배움이 조용히 다가오는 때이기도 합니다.\n\n닫아 두었던 초대장을 다시 열어 보세요. 예전엔 눈에 들어오지 않던 것이 지금은 다르게 보일 수 있습니다. 마음이 다시 궁금해하기 시작했다는 것, 그 자체가 이미 좋은 신호입니다.",
    en: "Reversed, the Four of Cups shows a long spell of weariness beginning to lift. Interest is seeping back into places that only looked dull, and a new person, idea, or lesson may be quietly approaching.\n\nReopen the invitations you once set aside. What failed to catch your eye before may look different now. The fact that your curiosity is stirring again is itself a good sign.",
  },
  "five-of-cups": {
    ko: "역방향의 컵 5는 상실의 자리에서 시선이 다시 밖으로 향하기 시작하는 상태를 비춥니다. 소식이 닿고 인연이 돌아오는 흐름이지만, 그 기대 가운데 일부는 아직 마음이 그려 낸 그림일 수 있는 때이기도 합니다.\n\n돌아오는 것을 반갑게 맞이하되, 하나하나 천천히 확인해 보세요. 진짜 위로와 서둘러 붙잡은 희망을 가려낼 수 있다면, 회복의 걸음은 훨씬 단단해집니다.",
    en: "Reversed, the Five of Cups shows the gaze lifting at last from what was lost. News arrives, ties return, and reconnection is in the air — though some of what you hope for may still be a picture the heart has painted rather than what is there.\n\nWelcome what comes back, and check each piece gently. If you can tell real comfort from hope grasped too quickly, the recovery will stand on firmer ground.",
  },
  "six-of-cups": {
    ko: "역방향의 컵 6은 시선이 과거에서 앞으로 옮겨 가는 길목을 비춥니다. 추억이 주던 온기가 옅어지는 것이 아니라, 이제 그 온기를 딛고 다가올 것을 맞이할 준비가 되어 가는 때입니다.\n\n오래 간직해 온 것 가운데 무엇을 가져가고 무엇을 두고 갈지 골라 보세요. 그리움은 짐이 아니라 방향이 될 수 있습니다. 곧 도착할 새로움에 자리를 조금 비워 두시기 바랍니다.",
    en: "Reversed, the Six of Cups marks the turn where the gaze moves from what was to what is coming. The warmth of memory is not fading — you are learning to stand on it and face forward.\n\nChoose what to carry from the past and what to leave in its keeping. Longing can be a compass rather than a weight. Clear a little room for the new thing that is nearly here.",
  },
  "seven-of-cups": {
    ko: "역방향의 컵 7은 여러 갈래로 떠 있던 상상이 하나의 바람으로 모이기 시작하는 상태를 비춥니다. 안개 같던 가능성들 사이에서 정말 원하는 것이 또렷해지고, 마음이 결심 쪽으로 기울어 가는 때입니다.\n\n또렷해진 그 하나를 종이 위에 적어 보세요. 꿈이 계획의 모양을 갖추는 순간, 흩어져 있던 힘이 한 방향으로 모입니다. 이제는 고르는 때가 아니라 걷는 때에 가깝습니다.",
    en: "Reversed, the Seven of Cups shows scattered imaginings beginning to gather into a single wish. Among possibilities that hung like mist, what you truly want is coming into focus, and the heart is leaning toward a decision.\n\nWrite that one clear thing down. The moment a dream takes the shape of a plan, energy that was drifting starts moving in one direction. This is less a time for choosing than for walking.",
  },
  "eight-of-cups": {
    ko: "역방향의 컵 8은 떠나려던 발걸음이 멈추고, 남아 있을 이유가 다시 보이기 시작하는 상태를 비춥니다. 다 식은 줄 알았던 자리에서 기쁨이 되살아나거나, 돌아와 축하할 일이 생기는 때이기도 합니다.\n\n돌아온 기쁨을 밀어낼 이유는 없습니다. 다만 머무는 것이 선택인지 미룸인지는 스스로에게 물어봐 주세요. 진심으로 다시 반가운 것이라면, 이번에는 온전히 즐기셔도 좋습니다.",
    en: "Reversed, the Eight of Cups shows the departing step pausing as reasons to stay come back into view. Joy may be rekindling in a place you thought had gone cold, or something worth returning and celebrating may be arriving.\n\nOnly ask yourself whether staying is a choice or a postponement. If what you feel is genuine gladness at being back, then this time, let yourself enjoy it fully.",
  },
  "nine-of-cups": {
    ko: "역방향의 컵 9는 만족의 겉면 아래를 들여다보게 하는 카드입니다. 바라던 것을 얻었는데 어딘가 허전하거나, 작은 흠 하나가 자꾸 눈에 밟히는 때이기도 합니다. 그 틈으로 오히려 진짜 원하는 것이 보이기 시작합니다.\n\n완벽하지 않다고 실패한 것은 아닙니다. 부족한 부분은 고치되, 이미 이룬 것의 값어치까지 깎아내리지는 마세요. 정직한 만족이 과시보다 오래갑니다.",
    en: "Reversed, the Nine of Cups looks beneath the surface of satisfaction. You may have what you wished for and still feel a small hollowness, or one flaw may keep catching your eye. Through that very gap, what you truly want begins to show itself.\n\nImperfect does not mean failed. Mend what falls short, but do not talk down the worth of what you have built. An honest contentment outlasts a displayed one.",
  },
  "ten-of-cups": {
    ko: "역방향의 컵 10은 겉으로는 평온해 보이는 자리 안쪽의 어긋남을 비춥니다. 화목해 보이려는 마음이 진짜 대화를 대신하고 있거나, 참아 온 서운함이 보이지 않는 곳에서 조금씩 자라고 있는 때이기도 합니다.\n\n조화를 지키려고 눌러 둔 말이 있다면, 가장 안전하게 느껴지는 사람에게서부터 꺼내 보세요. 잠깐의 불편한 정직이, 오래 이어질 진짜 평화의 자리를 만들어 줍니다.",
    en: "Reversed, the Ten of Cups points to strain beneath a peaceful-looking surface. The wish to appear harmonious may be standing in for real conversation, or a swallowed hurt may be slowly growing where no one sees it.\n\nIf there are words you have pressed down to keep the peace, begin with the person who feels safest. A moment of uncomfortable honesty makes room for a peace that can actually last.",
  },
  "page-of-cups": {
    ko: "역방향의 컵 페이지는 마음을 끄는 것의 겉과 속이 다를 수 있음을 비춥니다. 다정해 보이는 말이나 솔깃한 소식이 꾸며진 것일 수 있고, 나 스스로 감정을 실제보다 예쁘게 포장하고 있는 때이기도 합니다.\n\n느낌 자체를 의심하거나 버릴 필요는 없습니다. 다만 그 느낌이 어디서 왔는지 한 번 더 차분히 물어봐 주세요. 반짝임을 걷어 내고도 남아 있는 것이 진짜입니다.",
    en: "Reversed, the Page of Cups suggests that what charms you may not be all it appears. A sweet word or an enticing piece of news may be dressed up, or you may be wrapping your own feelings in prettier paper than they deserve.\n\nThere is no need to distrust feeling itself. Just ask once more where this one comes from. Whatever remains after the sparkle is brushed away — that is the real thing.",
  },
  "knight-of-cups": {
    ko: "역방향의 컵 나이트는 낭만이 실체보다 앞서 있는 상태를 비춥니다. 다가오는 제안이나 고백이 보이는 것만큼 진실하지 않을 수 있고, 말은 아름다운데 행동이 따라오지 않는 때이기도 합니다. 혹은 나 스스로 이상에 취해 현실 확인을 미뤄 두고 있는지도 모릅니다.\n\n마음을 닫으라는 뜻은 아닙니다. 다만 약속은 말이 아니라 시간이 증명하게 두세요. 천천히 지켜보아도 진짜인 것은 사라지지 않습니다.",
    en: "Reversed, the Knight of Cups shows romance running ahead of substance. An offer or a declaration may be less true than it looks, and the words may be lovely while the actions never quite arrive.\n\nThis is not a call to close your heart. Simply let promises be proven by time rather than by eloquence. What is real does not vanish for being watched patiently.",
  },
  "queen-of-cups": {
    ko: "역방향의 컵 퀸은 깊은 감수성이 물길을 잃은 상태를 비춥니다. 남의 마음을 돌보느라 내 마음이 비어 가고 있거나, 감정이 흘러넘쳐 판단까지 물들이고 있는 때이기도 합니다. 곁의 다정함이 늘 진심은 아닐 수 있다는 신호이기도 합니다.\n\n다정함을 버릴 필요는 없지만, 연민에도 가장자리가 필요합니다. 먼저 자신의 컵을 채우고, 느낌만이 아니라 사실도 함께 살펴본 뒤에 정해 보세요.",
    en: "Reversed, the Queen of Cups shows deep feeling that has lost its banks. You may be emptying yourself in the care of others, or emotion may be flooding into places where judgement needs dry ground. It can also hint that not every tenderness nearby is sincere.\n\nEven compassion needs edges. Fill your own cup first, and let the facts sit alongside the feelings before you decide.",
  },
  "king-of-cups": {
    ko: "역방향의 컵 킹은 감정의 성숙이 뒤집힌 자리를 비춥니다. 침착해 보이는 얼굴 뒤에 다른 계산이 있을 수 있고, 너그러워 보이는 태도가 실은 마음을 움직이려는 수단인 때이기도 합니다. 혹은 나 자신이 감정을 누른 채 괜찮은 척하고 있는지도 모릅니다.\n\n평온함이나 권위만으로 사람을 믿지는 마세요. 그리고 스스로에게는, 눌러 둔 감정에도 이름을 붙여 주시기 바랍니다.",
    en: "Reversed, the King of Cups shows emotional maturity turned on its head. Behind a composed face there may be another calculation, and an outwardly generous manner may be a way of steering rather than giving. Or it may be you, pressing feelings down and calling it being fine.\n\nDo not trust calm or authority on their own. And for yourself — give the feelings you have been holding down a name.",
  },
  "ace-of-pentacles": {
    ko: "역방향의 펜타클 에이스는 풍요가 나를 든든하게 하는 대신 무겁게 하는 상태를 비춥니다. 기회가 생겨도 계산이 앞서 즐거움이 사라지거나, 가진 것을 지키는 일이 원하는 삶보다 커져 버린 때이기도 합니다.\n\n돈과 안정 자체가 문제는 아닙니다. 다만 그것이 무엇을 위한 것이었는지 다시 물어봐 주세요. 목적이 제자리를 찾으면, 같은 풍요도 사뭇 다르게 느껴집니다.",
    en: "Reversed, the Ace of Pentacles shows abundance weighing on you instead of grounding you. An opportunity may arrive with the joy calculated out of it, or keeping what you have may have grown larger than the life it was meant to serve.\n\nMoney and security are not the problem. Just ask again what they were for. When the purpose finds its place, the same prosperity begins to feel different.",
  },
  "two-of-pentacles": {
    ko: "역방향의 펜타클 2는 균형 잡는 솜씨가 한계에 다다른 상태를 비춥니다. 괜찮은 척 웃고 있지만 실은 버거운 때이고, 여러 일을 굴리는 것이 재주가 아니라 의무가 되어 버린 때이기도 합니다.\n\n버티는 것만이 능력은 아닙니다. 모든 공을 계속 띄워 둘 필요는 없습니다. 하나쯤 내려놓아도 무너지지 않습니다. 어느 것이 정말 내 손에 있어야 하는지부터 다시 골라 보세요.",
    en: "Reversed, the Two of Pentacles shows the juggling act reaching its limit. The smile may be held in place while the load underneath has become too much, and keeping everything moving has turned from a skill into an obligation.\n\nNot every ball needs to stay in the air. Setting one down will not bring the rest crashing. Start by choosing again which things truly belong in your hands.",
  },
  "three-of-pentacles": {
    ko: "역방향의 펜타클 3은 함께 짓는 일이 제 높이에 이르지 못한 상태를 비춥니다. 노력이 그럭저럭에 머물고 있거나, 협업이 겉돌아 각자 다른 방향을 보고 있는 때이기도 합니다. 사소한 일에 힘을 쓰느라 정작 중요한 완성도가 뒤로 밀렸을 수도 있습니다.\n\n기준을 다시 세우는 데서 시작해 보세요. 무엇이 좋은 결과인지 함께 합의하고 나면, 같은 손들이 훨씬 나은 것을 지어 올립니다.",
    en: "Reversed, the Three of Pentacles shows shared work falling short of its intended height. Effort may be settling for good enough, or the collaboration may be drifting, each pair of hands facing a different way. Energy spent on small things may have pushed real quality aside.\n\nBegin by resetting the standard. Once everyone agrees on what good actually looks like, the same hands can build something far better.",
  },
  "four-of-pentacles": {
    ko: "역방향의 펜타클 4는 붙잡고 있던 것이 뜻대로 움직이지 않는 상태를 비춥니다. 기다리던 답이 미뤄지고 있거나, 지키려는 마음이 오히려 흐름을 막아 반대에 부딪히는 때이기도 합니다.\n\n지연이 곧 거절은 아닙니다. 억지로 밀어붙이기보다, 꽉 쥔 손에서 무엇을 조금 풀어 둘 수 있을지 살펴보세요. 쥐는 힘을 늦출 때 오히려 다시 움직이기 시작하는 것들이 있습니다.",
    en: "Reversed, the Four of Pentacles shows what you hold refusing to move as you wish. An answer you have waited for keeps being delayed, or the very tightness of your grip may be blocking the flow and meeting resistance.\n\nA delay is not a refusal. Rather than forcing the matter, see what your closed hand might loosen a little. Some things begin to move again precisely when the grip eases.",
  },
  "five-of-pentacles": {
    ko: "역방향의 펜타클 5는 어려움 위에 어수선함이 겹친 상태를 비춥니다. 부족한 가운데 씀씀이나 마음이 흐트러져 있거나, 힘든 시기를 함께 견뎌야 할 사람들 사이에 불화가 스며드는 때이기도 합니다.\n\n모든 것을 한 번에 되돌리려 하지 마세요. 오늘 정돈할 수 있는 한 가지부터 손보는 것으로 충분합니다. 작은 질서가 돌아오면, 도움도 길도 다시 보이기 시작합니다.",
    en: "Reversed, the Five of Pentacles shows disorder settling on top of hardship. In the midst of scarcity, spending or spirit may be scattering, or friction may be creeping in among the very people who need to weather this together.\n\nDo not try to set everything right at once. It is enough to mend the one thing you can tidy today. As small order returns, both help and the way forward come back into view.",
  },
  "six-of-pentacles": {
    ko: "역방향의 펜타클 6은 주고받음의 흐름이 어딘가에서 어긋난 상태를 비춥니다. 남의 몫과 내 몫을 자꾸 견주게 되거나, 베풂에 조건이 붙거나, 공정해 보이던 저울이 실은 기울어 있었을 수 있습니다.\n\n지금 오가는 것들의 셈을 잠시 내려놓아 보세요. 내가 무엇을 바라며 주고 있었는지, 무엇이 부러움으로 남아 있는지 알아차리는 것만으로도 흐름은 다시 순해집니다.",
    en: "Reversed, the Six of Pentacles reflects a flow of giving and receiving that has slipped out of balance. You may find yourself measuring your share against someone else's, or offering help that quietly carries conditions. What looked like a fair exchange may be tilted.\n\nSet down the arithmetic for a moment. Noticing what you hoped to receive by giving, and what still lingers as envy, is often enough to let the current run clean again.",
  },
  "seven-of-pentacles": {
    ko: "역방향의 펜타클 7은 들인 것에 대한 마음이 기대보다 걱정 쪽으로 기울어 있는 때를 비춥니다. 돈이든 시간이든 정성이든, 여기에 더 부어도 되는지 확신이 서지 않아 자꾸 셈을 다시 하게 되는 상태입니다.\n\n불안 자체가 답을 주지는 않지만, 살펴보라는 신호는 됩니다. 무엇을 근거로 기대했는지 처음으로 돌아가 확인해 보세요. 계속 가꿀 자리와 거둬들일 자리가 그때 나뉩니다.",
    en: "Reversed, the Seven of Pentacles reflects an investment that has begun to feel more like worry than hope. Whether it is money, time, or care, you may be unsure whether to keep pouring in, counting and recounting what you have already given.\n\nThe anxiety itself is not an answer, but it is a signal to look closely. Go back to what you originally expected and why. That is where it becomes clear what deserves more tending and what is ready to be gathered back.",
  },
  "eight-of-pentacles": {
    ko: "역방향의 펜타클 8은 일과 나 사이가 조금 헐거워진 상태를 비춥니다. 손은 여전히 움직이는데 왜 하는지가 흐려졌거나, 솜씨가 보여 주기나 잇속 쪽으로 기울어 일 자체의 기쁨이 옅어진 때일 수 있습니다.\n\n처음 이 일이 좋았던 순간을 떠올려 보세요. 누구에게 보이기 위한 것이 아니라 나를 위해 다듬는 작은 작업 하나로 돌아가면, 흐려졌던 이유가 다시 또렷해집니다.",
    en: "Reversed, the Eight of Pentacles reflects a loosening between you and your work. The hands still move, but the reason has gone dim — or the skill has drifted toward appearances and advantage, and the quiet joy of the craft itself has thinned.\n\nRemember the moment this work first drew you in. Return to one small task done for its own sake, not for anyone watching. The purpose that faded tends to come back into focus there.",
  },
  "nine-of-pentacles": {
    ko: "역방향의 펜타클 9는 스스로 일군 안정에 어딘가 미덥지 못한 구석이 있음을 비춥니다. 믿고 맡긴 것이 약속대로 굴러가지 않거나, 겉으로는 여유로워 보여도 기반의 어느 한 곳이 비어 있는 때일 수 있습니다.\n\n누리던 것을 잠시 멈추고 토대를 점검해 보세요. 어떤 약속 위에 서 있는지, 그 약속이 아직 유효한지 확인하는 일은 의심이 아니라 자신을 지키는 정돈입니다.",
    en: "Reversed, the Nine of Pentacles suggests that the comfort you built may be resting on something less solid than it looks. An arrangement you trusted may not be holding its end, or one corner of the foundation may be quietly empty beneath the ease.\n\nPause the enjoying for a moment and inspect the ground. Asking what promises you are standing on, and whether they still hold, is not suspicion — it is a way of keeping what you made.",
  },
  "ten-of-pentacles": {
    ko: "역방향의 펜타클 10은 오래 쌓아 온 안정이 운에 기대어 흔들리는 상태를 비춥니다. 지켜야 할 것을 확률에 걸고 있거나, 든든하다고 믿었던 기반에서 예상치 못한 새는 곳이 드러나는 때일 수 있습니다.\n\n크게 벌이기보다 지키는 쪽으로 무게를 옮겨 보세요. 나와 곁의 사람들에게 정말 남겨야 할 것이 무엇인지 가려내고 나면, 흔들림 속에서도 붙들 기둥이 분명해집니다.",
    en: "Reversed, the Ten of Pentacles reflects long-built stability leaning on luck. Something meant to be kept safe may be riding on chance, or an unexpected leak may be showing in a foundation you had stopped checking.\n\nShift your weight from expanding to protecting for now. When you are clear about what truly needs to last — for you and for those who share it — the pillars worth holding become easy to see, even while things shake.",
  },
  "page-of-pentacles": {
    ko: "역방향의 펜타클 페이지는 배우려던 마음이 좀처럼 한곳에 머물지 못하는 상태를 비춥니다. 쌓아야 할 시기에 흩어 쓰고 있거나, 시작해 둔 공부가 눈앞의 즐거움에 자리를 내어 준 때일 수 있습니다. 반갑지 않은 소식에 마음이 흔들리기도 합니다.\n\n거창한 계획보다 오늘 마칠 수 있는 한 가지를 정해 보세요. 작게라도 끝을 본 경험이 흩어진 주의를 다시 불러 모읍니다.",
    en: "Reversed, the Page of Pentacles reflects a learner's energy that cannot quite settle. Resources meant for building may be scattering as they arrive, or a study once begun may have given its place to easier pleasures. Unwelcome news may be tugging at your attention too.\n\nInstead of a grand plan, choose one small thing you can finish today. The experience of seeing something through, however modest, is what calls scattered attention home.",
  },
  "knight-of-pentacles": {
    ko: "역방향의 펜타클 나이트는 꾸준함이 어느새 제자리걸음으로 굳어 버린 상태를 비춥니다. 성실하게 반복하고는 있는데 나아가는 감각이 사라졌거나, 지루함과 낙심 속에 손끝의 정성이 무뎌진 때일 수 있습니다.\n\n멈춘 것이 게으름만은 아닙니다. 같은 길을 너무 오래 걸었다는 신호일 수 있습니다. 익숙한 순서를 아주 조금만 바꿔 보세요. 작은 변화가 무거워진 걸음을 다시 풀어 줍니다.",
    en: "Reversed, the Knight of Pentacles reflects steadiness that has hardened into standing still. The routine continues faithfully, yet the sense of getting anywhere has gone — or boredom and discouragement have dulled the care you once put into the details.\n\nThe stall is not simply laziness; it may be a sign you have walked the same path too long. Change the familiar order just slightly. A small variation is often enough to loosen a heavy stride.",
  },
  "queen-of-pentacles": {
    ko: "역방향의 펜타클 퀸은 돌보는 마음이 걱정과 의심 쪽으로 기울어 버린 상태를 비춥니다. 곁을 살피던 눈길이 못 미더움으로 바뀌었거나, 남을 챙기느라 정작 자신의 안녕은 뒷전이 된 채 마음만 졸이고 있는 때일 수 있습니다.\n\n먼저 자신을 식탁에 앉혀 주세요. 잘 먹고 잘 쉬어 몸이 안심하면, 흐릿하던 의심 가운데 무엇이 진짜 살펴볼 일인지도 훨씬 또렷해집니다.",
    en: "Reversed, the Queen of Pentacles reflects care that has tipped into worry and mistrust. The gaze that once tended others may have turned wary, or you may be so busy looking after everyone else that your own well-being waits at the back, anxious and unfed.\n\nSeat yourself at the table first. When the body is fed and rested, it becomes far clearer which of your suspicions actually asks to be looked at, and which were only tiredness speaking.",
  },
  "king-of-pentacles": {
    ko: "역방향의 펜타클 킹은 쌓아 올린 힘이 본래의 쓰임에서 벗어나 있는 상태를 비춥니다. 지키려던 것이 움켜쥠이 되었거나, 안정 자체가 목적이 되어 더 중요한 것을 놓치고 있는 때일 수 있습니다. 그런 자리는 오히려 위태로움을 부르기도 합니다.\n\n가진 것의 크기보다 쓰임을 돌아보세요. 이 힘이 처음에 무엇을 위한 것이었는지 기억해 내는 순간, 무엇을 내려놓아야 할지도 함께 보입니다.",
    en: "Reversed, the King of Pentacles reflects accumulated strength drifting from its original purpose. Protecting may have become gripping, or stability itself may have become the goal, crowding out what it was meant to serve. Held that way, the seat of power can invite its own peril.\n\nLook at the use of what you have rather than the size of it. The moment you remember what this strength was first built for, it also becomes clear what to loosen.",
  },
  "ace-of-swords": {
    ko: "역방향의 소드 에이스는 명료함의 칼이 지나치게 세게 휘둘리는 상태를 비춥니다. 옳은 말이 상처를 내는 도구가 되었거나, 하나의 생각을 밀어붙이는 힘이 상황을 여는 대신 베어 버리는 때일 수 있습니다.\n\n칼끝을 잠시 내려 보세요. 그 통찰이 틀린 것이 아니라, 힘과 때가 맞지 않았을 뿐입니다. 무엇을 위해 이 명료함을 쓰려 했는지 되짚고 나면, 같은 진실도 다르게 전할 수 있습니다.",
    en: "Reversed, the Ace of Swords reflects clarity swung with too much force. A truth that could open a situation may be cutting it instead — the right words turned sharp-edged, or a single idea pushed harder than the moment can bear.\n\nLower the point for a while. The insight itself is not wrong; the force and the timing are simply out of step. Recall what you meant this clarity to serve, and the same truth can be delivered another way.",
  },
  "two-of-swords": {
    ko: "역방향의 소드 2는 미뤄 둔 결정이 어느새 감춤으로 이어진 상태를 비춥니다. 균형처럼 보이던 침묵 속에서 말하지 않은 것들이 쌓였거나, 나에게든 상대에게든 온전히 정직하지 못한 채 서 있는 때일 수 있습니다.\n\n모든 것을 한꺼번에 밝히지 않아도 됩니다. 다만 스스로에게만은 지금 무엇을 피하고 있는지 이름을 붙여 보세요. 거기서부터 눈가리개가 느슨해집니다.",
    en: "Reversed, the Two of Swords reflects a postponed decision that has quietly turned into concealment. Inside a silence that once looked like balance, unsaid things have been gathering — and somewhere along the way, full honesty with yourself or another may have slipped.\n\nYou do not have to reveal everything at once. But to yourself, at least, name what is being avoided. That naming is where the blindfold begins to loosen.",
  },
  "three-of-swords": {
    ko: "역방향의 소드 3은 아픔이 정리되지 못한 채 머릿속을 어지럽히는 상태를 비춥니다. 상처 자체보다 그 주위를 맴도는 생각들이 더 소란스럽거나, 혼란 속에서 잘못 짚은 판단이 겹치는 때일 수 있습니다.\n\n생각으로 아픔을 풀어내려는 손을 잠시 쉬게 해 주세요. 무엇이 아팠는지 한 문장으로만 적어 보는 것으로 충분합니다. 어지러운 실타래는 이름이 붙는 순간부터 풀리기 시작합니다.",
    en: "Reversed, the Three of Swords reflects a hurt that has not settled, circling the mind instead. The thoughts around the wound may be noisier than the wound itself, and in the confusion, misreadings can stack on top of the original pain.\n\nLet the hand that keeps untangling by thinking rest for a while. Write a single sentence naming what hurt — that is enough. A tangled thread begins to loosen the moment it has a name.",
  },
  "four-of-swords": {
    ko: "역방향의 소드 4는 쉼의 시간이 끝을 향해 가고 있음을 비춥니다. 물러나 있던 자리에서 다시 일상을 꾸릴 준비가 되어 가는 때이며, 이제 필요한 것은 큰 결단보다 신중한 살림입니다.\n\n한꺼번에 복귀하려 하지 말고, 힘을 아껴 쓰는 순서를 먼저 정해 보세요. 어디에 기운을 쓰고 어디를 비워 둘지 미리 정해 두면, 회복해 둔 것을 잃지 않고 돌아갈 수 있습니다.",
    en: "Reversed, the Four of Swords suggests that a season of rest is drawing toward its close. You are becoming ready to pick up ordinary life again — and what this return asks for is not a bold move but careful housekeeping.\n\nRather than coming back all at once, decide first how to spend your strength sparingly. Choose where your energy goes and what stays set aside, and you can re-enter without losing what the rest restored.",
  },
  "five-of-swords": {
    ko: "역방향의 소드 5는 이미 끝난 다툼이 마음속에서는 아직 끝나지 않은 상태를 비춥니다. 이겼든 졌든 그 싸움이 남긴 것을 계속 되새기며, 제대로 떠나보내지 못한 감정이 자리를 차지하고 있는 때일 수 있습니다.\n\n그 갈등을 정식으로 배웅해 주세요. 잃은 것을 인정하고 애도하는 일은 지는 것이 아니라 끝맺는 것입니다. 묻어 준 자리에서만 다음 것이 자랍니다.",
    en: "Reversed, the Five of Swords reflects a conflict that has ended everywhere except inside you. Win or lose, what the fight left behind keeps replaying, and a feeling that never got its farewell is still occupying the room.\n\nGive that conflict a proper burial. Acknowledging what was lost and grieving it is not defeat — it is completion. Only where something has been laid to rest does the next thing have ground to grow.",
  },
  "six-of-swords": {
    ko: "역방향의 소드 6은 조용히 건너가려던 것이 말이 되어 나오려는 상태를 비춥니다. 혼자 삭이며 옮겨 가려던 마음이 고백이나 선언을 요구하거나, 덮어 두었던 사정이 드러나는 때일 수 있습니다. 그중에는 전하고 싶었던 애정도 있습니다.\n\n말이 되려는 것을 억지로 붙들지 마세요. 언제, 누구에게, 어디까지 말할지는 고를 수 있습니다. 스스로 고른 자리에서 꺼낸 말은 무겁지 않습니다.",
    en: "Reversed, the Six of Swords reflects a crossing you meant to make in silence now asking to be spoken. What you planned to carry over quietly may be pressing toward confession or open declaration — hidden circumstances surfacing, and among them, perhaps, an affection that wanted saying.\n\nDo not strain to hold back what wants to become words. You can still choose when, to whom, and how much. Words released from a place you chose yourself rarely land heavy.",
  },
  "seven-of-swords": {
    ko: "역방향의 소드 7은 주위에 말이 많아진 때를 비춥니다. 귀담아들을 조언과 흘려보낼 소문이 한데 섞여 들어오고, 어느 말이 나를 위한 것인지 가려내기 어려운 상태일 수 있습니다.\n\n말의 내용만큼 말하는 사람을 살펴보세요. 내 사정을 알고 하는 말인지, 자기 이야기를 하고 있는 것인지요. 고른 조언 하나가 열 갈래 소음보다 멀리 데려다줍니다.",
    en: "Reversed, the Seven of Swords reflects a season thick with talk. Genuine counsel and idle chatter are arriving in the same stream, and it may be hard to tell which words are truly meant for you.\n\nWeigh the speaker as much as the words. Does this person know your situation, or are they mostly telling their own story? One piece of well-chosen advice will carry you farther than ten directions of noise.",
  },
  "eight-of-swords": {
    ko: "역방향의 소드 8은 매여 있던 자리가 흔들리기 시작한 때를 비춥니다. 다만 그 흔들림이 예상 밖의 방향에서 와서, 풀려나는 중인지 더 얽히는 중인지 분간이 되지 않는 불안한 상태일 수 있습니다.\n\n모든 변수를 붙들려 하기보다, 지금 확실한 것 몇 가지를 짚어 보세요. 발밑이 어수선할수록 한 번에 한 걸음이 가장 빠른 길입니다.",
    en: "Reversed, the Eight of Swords reflects a bound place beginning to shake. The unsettling part is that the movement comes from unexpected directions, and it is hard to tell whether you are being loosened or tangled further — an unease without one clear source.\n\nRather than trying to hold every variable, take stock of the few things that are certain right now. When the ground is unsteady, one step at a time is the fastest way across.",
  },
  "nine-of-swords": {
    ko: "역방향의 소드 9는 걱정이 안으로 잠겨 버린 상태를 비춥니다. 의심과 부끄러움이 스스로를 가두는 벽이 되었지만, 그 두려움 가운데 일부는 근거 없는 것이 아니라 무언가를 살펴보라고 가리키는 것일 수 있습니다.\n\n두려움을 전부 몰아내려 하기보다, 하나씩 앞에 놓고 물어보세요. 지난 일의 메아리인지, 지금 손볼 수 있는 일인지요. 가려내는 순간 벽은 문이 되기 시작합니다.",
    en: "Reversed, the Nine of Swords reflects worry that has locked itself inward. Doubt and shame have become walls of your own building — yet some of this fear may not be groundless at all, but pointing at something that genuinely asks to be checked.\n\nInstead of trying to banish every fear, set them out one by one and ask: is this an echo of what already happened, or something I can attend to now? The moment you sort them, the wall starts becoming a door.",
  },
  "ten-of-swords": {
    ko: "역방향의 소드 10은 바닥을 지나 형편이 나아지기 시작한 때를 비춥니다. 도움이 닿고 일이 풀리는 기색이 보이지만, 지금의 순풍이 아직 온전히 자리 잡은 것은 아닐 수 있습니다.\n\n좋아지는 흐름은 감사히 타되, 그 위에 모든 것을 세우지는 마세요. 바람이 부는 동안 기초를 다져 두면, 이 회복은 지나가는 운이 아니라 당신의 것이 됩니다.",
    en: "Reversed, the Ten of Swords suggests the low point is behind you and circumstances have begun to lift. Help reaches you, doors give way, favour returns — though this tailwind may not yet be fully settled ground.\n\nRide the improving current gratefully, but do not build everything on it just yet. Use the good wind to strengthen your foundations, and this recovery becomes not passing luck but something that is truly yours.",
  },
  "page-of-swords": {
    ko: "역방향의 소드 페이지는 예리한 호기심이 방향을 잃은 상태를 비춥니다. 질문이 캐물음이 되고 관찰이 의심으로 기울었거나, 지켜보기만 하다가 정작 준비 없이 일을 맞닥뜨리는 때일 수 있습니다. 몸이 보내는 신호를 놓치고 있을 수도 있습니다.\n\n모으기만 한 정보를 한번 정리해 보세요. 무엇을 알고 싶었는지가 분명해지면, 날 선 경계는 다시 쓸모 있는 총명함으로 돌아옵니다.",
    en: "Reversed, the Page of Swords reflects sharp curiosity that has lost its bearing. Questions turn into prying, watching tips into suspicion — or so much energy goes into observing that the actual moment arrives and finds you unprepared. The body's own signals may be going unread as well.\n\nSort through the information you have only been collecting. Once it is clear what you wanted to know in the first place, that edgy alertness returns to being useful brightness.",
  },
  "knight-of-swords": {
    ko: "역방향의 소드 나이트는 속도가 방향을 앞질러 버린 상태를 비춥니다. 밀어붙이는 힘은 넘치는데 준비나 판단이 아직 따라오지 못했거나, 필요 이상으로 세게 나아가며 힘을 흘려보내고 있는 때일 수 있습니다.\n\n달리기 전에 고삐를 한 번 쥐어 보세요. 지금 어디로 가고 있는지, 이 속도를 감당할 준비가 되어 있는지 확인하는 잠깐의 멈춤이 나중의 긴 우회를 줄여 줍니다.",
    en: "Reversed, the Knight of Swords shows speed that has outrun its direction. The drive to charge forward is there, but judgment or preparation has not caught up, and force spent this way tends to scatter rather than land.\n\nBefore the next push, take hold of the reins for a moment. Asking where this is actually going, and whether you have what the pace demands, can save a much longer detour later.",
  },
  "queen-of-swords": {
    ko: "역방향의 소드 퀸은 맑아야 할 시선이 차갑게 굳어 있는 상태를 비춥니다. 상처를 막으려던 날카로움이 어느새 사람을 밀어내는 말이 되었거나, 의심이 판단보다 한발 앞서 움직이고 있는 때일 수 있습니다.\n\n칼끝을 잠시 내려놓고, 그 엄격함이 본래 무엇을 지키려던 것이었는지 떠올려 보세요. 정확함을 잃지 않으면서도, 조금 더 따뜻한 언어를 고를 여유는 아직 남아 있습니다.",
    en: "Reversed, the Queen of Swords reflects a clear eye that has hardened into coldness. The sharpness once meant to protect may now be pushing people away, or suspicion may be speaking before judgment has finished its work.\n\nSet the blade down for a moment and remember what all that strictness was guarding in the first place. It is possible to keep your precision while choosing gentler words to carry it.",
  },
  "king-of-swords": {
    ko: "역방향의 소드 킹은 판단의 힘이 온기를 잃은 상태를 비춥니다. 원칙이 사람을 지키는 대신 누르는 도구가 되었거나, 옳음을 앞세운 말이 상대를 몰아세우고 있는 때일 수 있습니다. 그런 힘 앞에 서 있는 자신을 비추는 경우이기도 합니다.\n\n지금 내리려는 결정이 정말 공정한 것인지, 그저 단호해 보이고 싶은 것인지 한 번 나누어 보세요. 힘은 지킬 것을 지킬 때 가장 단단해집니다.",
    en: "Reversed, the King of Swords points to judgment that has lost its warmth. Principle may have become a tool for pressing down rather than protecting, or being right may have turned into a way of cornering someone. It can also mark such a force standing over you.\n\nTry separating what is truly fair from what merely looks decisive. Authority holds firmest when it remembers what it was meant to protect.",
  },
  "ace-of-wands": {
    ko: "역방향의 완드 에이스는 불씨가 아직 불로 옮겨붙지 못한 상태를 비춥니다. 시작하려던 일이 힘을 잃고 주저앉았거나, 기쁜 일에도 어딘가 흐린 기운이 함께 섞여 있는 때일 수 있습니다.\n\n꺼진 것이 아니라 눌려 있는 것일 수 있습니다. 무엇이 이 불씨를 누르고 있는지 살펴보고, 지금은 크게 벌이기보다 불씨를 지키는 쪽에 마음을 두어 보세요. 바람이 바뀌면 같은 불씨가 다시 타오릅니다.",
    en: "Reversed, the Ace of Wands is a spark that has not yet caught into flame. Something you meant to begin may have lost its force and sunk back down, or a joy that should feel bright carries a faint cloud with it.\n\nThe fire may not be out, only pressed down. Look for what is smothering it, and for now tend the ember rather than trying to build the bonfire. When the wind shifts, the same spark can catch again.",
  },
  "two-of-wands": {
    ko: "역방향의 완드 2는 계획 바깥에서 찾아온 놀라움이 마음을 흔드는 때를 비춥니다. 뜻밖의 일이 경이로움과 설렘을 데려오지만, 그만큼의 동요와 막연한 불안도 함께 딸려 올 수 있습니다.\n\n놀란 마음을 서둘러 결론으로 바꾸지 않아도 됩니다. 이 감정이 무엇을 알려 주려는지 가만히 지켜보세요. 마음의 흔들림이 가라앉은 뒤에 지도를 다시 펼쳐도 결코 늦지 않습니다.",
    en: "Reversed, the Two of Wands marks a surprise arriving from outside the plan. Something unexpected brings wonder and a stir of feeling, but the same jolt can carry unease and a vague fear along with it.\n\nYou do not have to turn a startled heart into a conclusion right away. Watch quietly for what this emotion is trying to tell you, and unfold the map again once the ground has settled.",
  },
  "three-of-wands": {
    ko: "역방향의 완드 3은 길었던 어려움이 서서히 걷혀 가는 자리를 비춥니다. 애쓴 만큼의 결실이 아직 눈에 다 보이지 않아 실망이 남을 수 있지만, 흐름 자체는 이미 풀리는 쪽으로 돌아서고 있는 때입니다.\n\n멀리 내보낸 배가 항구로 돌아오는 데는 시간이 걸립니다. 지금은 성과를 재촉하기보다 지나온 수고를 스스로 인정해 주고, 숨을 고르며 다음 물때를 기다려 보세요.",
    en: "Reversed, the Three of Wands suggests a long stretch of difficulty beginning to lift. The reward for all that effort may not be fully visible yet, and some disappointment can linger, but the current itself seems to be turning in your favour.\n\nShips sent out far take time to come home. Rather than hurrying the results, acknowledge the work already done, catch your breath, and wait for the tide.",
  },
  "four-of-wands": {
    ko: "완드 4는 역방향이 되어도 그 뜻이 크게 어두워지지 않는 드문 카드입니다. 평화와 안정, 함께 이룬 것을 기뻐하는 힘이 여전히 흐르고 있습니다. 다만 그 기쁨이 화려한 잔치보다는 조용하고 소박한 모습으로 찾아올 수 있습니다.\n\n작은 안착도 충분히 축하할 이유가 됩니다. 지금 곁에 있는 안온함을 당연하게 넘기지 말고, 가까운 사람들과 그 온기를 나누어 보세요.",
    en: "The Four of Wands is one of the rare cards whose meaning stays bright even reversed. Peace, stability, and the joy of something built together are still flowing here, though the celebration may arrive in a quieter, homelier form than expected.\n\nA small landing is still worth marking. Do not let the comfort around you pass as ordinary; share its warmth with the people close by.",
  },
  "five-of-wands": {
    ko: "역방향의 완드 5는 가벼운 겨루기였던 것이 진짜 다툼으로 엉켜 버린 상태를 비춥니다. 말이 말을 물고 늘어지거나, 서로 어긋나는 주장 속에서 정작 본래의 쟁점이 흐려져 있는 때일 수 있습니다.\n\n이 싸움에서 정말 얻고 싶은 것이 무엇인지 먼저 스스로에게 물어보세요. 이기는 것보다 푸는 것이 목적이 되는 순간, 엉킨 실타래의 첫 매듭이 비로소 눈에 들어오기 시작합니다.",
    en: "Reversed, the Five of Wands shows friendly sparring that has tangled into a real quarrel. Words keep catching on words, claims contradict each other, and the original point of it all may have gone blurry in the noise.\n\nAsk yourself first what you actually want from this contest. The moment untangling matters more than winning, the first knot in the thread becomes visible.",
  },
  "six-of-wands": {
    ko: "역방향의 완드 6은 기다리던 좋은 소식이 자꾸 미뤄지는 자리를 비춥니다. 이룬 것을 잃을까 하는 불안이 문 앞을 서성이거나, 믿었던 지지가 예전 같지 않게 느껴지는 때일 수 있습니다.\n\n불안은 성문을 지키게도 하지만, 오지 않은 적을 만들어 내기도 합니다. 소식이 늦어지는 지금은 바깥의 인정보다, 스스로 이미 알고 있는 자신의 몫을 하나씩 먼저 세어 보세요.",
    en: "Reversed, the Six of Wands finds the awaited good news postponed again and again. A worry about losing what you have won may be pacing at the gate, or support you counted on may feel less certain than before.\n\nFear can guard the walls, but it can also invent enemies that never arrive. While word is slow in coming, count first what you know you have earned, apart from anyone's applause.",
  },
  "seven-of-wands": {
    ko: "역방향의 완드 7은 지켜야 할 자리에서 마음이 갈피를 잡지 못하는 상태를 비춥니다. 사방에서 요구가 밀려와 어지럽고, 어느 것부터 막아야 할지 몰라 불안만 커져 있는 때일 수 있습니다.\n\n지금 가장 조심해야 할 것은 공격이 아니라 망설임입니다. 전부를 완벽하게 지키려 하기보다, 정말 놓칠 수 없는 한 가지를 먼저 정하고, 그 자리에 단단히 발을 딛어 보세요.",
    en: "Reversed, the Seven of Wands catches the defender losing their footing on the hill. Demands press in from every side, it is hard to tell which to answer first, and the anxiety of it can grow larger than the challenge itself.\n\nWhat needs the most care right now is not the attack but the hesitation. Instead of guarding everything perfectly, choose the one ground you cannot give up and plant your feet there first.",
  },
  "eight-of-wands": {
    ko: "역방향의 완드 8은 멀리 날아가야 할 화살이 가까운 곳에 떨어지는 상태를 비춥니다. 바깥으로 뻗어야 할 기세가 질투나 사소한 다툼, 마음에 걸리는 후회가 되어 가장 가까운 관계 안에서 부딪히고 있는 때일 수 있습니다.\n\n날 선 말이 오가기 전에, 이 조급함이 어디에서 왔는지 먼저 짚어 보세요. 방향을 다시 바깥의 목표로 돌리면 같은 에너지가 다툼 대신 추진력이 됩니다.",
    en: "Reversed, the Eight of Wands shows arrows meant for the distance landing close to home. Momentum that should be flying outward has turned into jealousy, small quarrels, or a nagging conscience, striking inside the nearest relationships.\n\nBefore sharp words fly, trace where this restlessness is coming from. Aimed back at a goal outside, the same energy becomes drive instead of friction.",
  },
  "nine-of-wands": {
    ko: "역방향의 완드 9는 버티는 힘이 바닥을 보이기 시작한 자리를 비춥니다. 장애물이 잇달아 나타나 지치고, 늘 통하던 방어가 이번에는 잘 버텨 주지 않는 것처럼 느껴지는 때일 수 있습니다.\n\n버티는 것만이 강함은 아닙니다. 모든 것을 혼자 막으려 하기보다 잠시 물러나 상처를 돌보고, 도움을 청할 곳을 찾아보세요. 쉬어 가는 것도 싸움을 이어 가는 한 방법입니다.",
    en: "Reversed, the Nine of Wands finds the strength to hold on running low. Obstacles keep arriving one after another, and the defences that always worked before may not seem to be holding this time.\n\nEndurance is not the only form of strength. Rather than blocking everything alone, step back for a moment, tend the bruises, and look for where help can come in. Resting is also a way of staying in the fight.",
  },
  "ten-of-wands": {
    ko: "역방향의 완드 10은 무거운 짐에 얽힌 사정까지 더해진 상태를 비춥니다. 일이 자꾸 어긋나고, 겉으로 드러나지 않는 이해관계나 복잡한 속사정이 걸음을 한층 더 무겁게 만드는 때일 수 있습니다.\n\n짊어진 것을 전부 내려놓을 수는 없어도, 하나씩 꺼내어 볼 수는 있습니다. 이 가운데 정말 내 몫인 짐이 무엇인지 차분히 가려내고, 아닌 것은 본래의 자리로 돌려보내 주세요.",
    en: "Reversed, the Ten of Wands adds tangled circumstances to an already heavy load. Things keep going crosswise, and interests or complications you cannot quite see may be making each step heavier than it needs to be.\n\nYou may not be able to set the whole burden down, but you can take it out piece by piece. Sort out which of these loads is truly yours to carry, and let the rest return to where it belongs.",
  },
  "page-of-wands": {
    ko: "역방향의 완드 페이지는 반갑지 않은 소식이나 어수선한 말들이 마음을 흔드는 때를 비춥니다. 이야기가 이야기를 낳아 어디까지 믿어야 할지 모르겠고, 그 속에서 결정이 자꾸 미뤄지고 있는 상태일 수 있습니다.\n\n모든 말에 일일이 마음을 내어 주지 않아도 됩니다. 확인된 것과 소문을 나누어 보고, 작은 것 하나라도 스스로 정해 보세요. 정한 만큼 흔들림은 줄어듭니다.",
    en: "Reversed, the Page of Wands arrives with unsettling news or a swirl of chatter. Story feeds on story until it is hard to know what to believe, and in the middle of it all, decisions keep getting put off.\n\nNot every word deserves a piece of your attention. Separate what is confirmed from what is only rumour, and settle one small thing for yourself. Each thing decided steadies the ground a little.",
  },
  "knight-of-wands": {
    ko: "역방향의 완드 나이트는 힘차게 달리던 길이 중간에 끊긴 상태를 비춥니다. 진행되던 일이 갑자기 멈추었거나, 함께 가던 사람과의 사이에 균열이 생겨 마음이 들끓고 있는 때일 수 있습니다.\n\n끊긴 자리에서 무리하게 다시 내달리면 같은 곳이 또 끊어지기 쉽습니다. 무엇이 이 단절을 만들었는지 먼저 찬찬히 살피고, 다시 이어 붙일 것과 놓아줄 것을 구분해 보세요.",
    en: "Reversed, the Knight of Wands marks a journey cut off mid-gallop. Something that was moving fast may have stopped without warning, or a rift with a companion on the road has left things simmering.\n\nCharging straight back over a broken place tends to break it again. Look first at what caused the interruption, and sort what is worth mending from what is asking to be released.",
  },
  "queen-of-wands": {
    ko: "역방향의 완드 퀸은 따뜻함이 사라진 것이 아니라, 조금 더 조심스럽고 실속 있는 모습으로 바뀐 상태를 비춥니다. 아끼고 챙기는 마음은 여전하지만, 상황에 따라 질투나 경계심이 그 자리에 섞여 들 수 있는 때이기도 합니다.\n\n베풀던 마음이 서운함으로 바뀌려 할 때는 잠시 멈춰 보세요. 무엇을 바라고 있었는지 솔직하게 들여다보면, 온기는 본래의 자리로 돌아옵니다.",
    en: "Reversed, the Queen of Wands has not lost her warmth; it has turned careful and practical, busy with keeping things running. Yet in this state a thread of jealousy or wariness can slip in among the caretaking, depending on what surrounds her.\n\nWhen generosity starts to curdle into resentment, pause there. Look honestly at what you were hoping to receive in return, and the warmth tends to find its way back.",
  },
  "king-of-wands": {
    ko: "역방향의 완드 킹은 선한 뜻이 엄격한 모습으로 나타나는 상태를 비춥니다. 마음은 너그러운데 겉으로는 딱딱하고 단호하게 보이거나, 자신에게든 곁의 사람에게든 기준을 높이 세워 두고 있는 때일 수 있습니다.\n\n엄격함이 나쁜 것은 아니지만, 그 안의 온기가 전해지지 않으면 거리만 남습니다. 기준을 낮추지 않아도 좋으니, 그 기준이 아끼는 마음에서 나왔다는 것을 말로 표현해 보세요.",
    en: "Reversed, the King of Wands shows good intent wearing a stern face. The heart underneath is generous, but the outside can read as rigid and exacting, holding a high bar for himself and for everyone near him.\n\nSeverity is not itself a fault, but when the warmth inside it goes unspoken, only the distance is felt. Keep the standard if you must; just let it be heard that the standard comes from caring.",
  },
};
