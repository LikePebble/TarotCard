// Premium personalized readings via the Claude API.
// Grounding: the drawn cards' A.E. Waite (1911) source text + our Korean
// dictionary (general + theme) are injected into the prompt so the model
// interprets from the same canon as the free tier.
const Anthropic = require("@anthropic-ai/sdk");

const { THEMES, byCardId } = require("../data/themes");

const MODEL = "claude-opus-4-8";

const hasApiKey = () =>
  Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
const mockMode = () => process.env.PREMIUM_MOCK === "1" || !hasApiKey();

const ORIENT_KO = { upright: "정방향", reversed: "역방향" };

const describeDraw = (draw, themeKey) => {
  const themed =
    themeKey !== "general" ? byCardId[draw.card.id]?.[themeKey]?.[draw.orientation] : null;
  return [
    `### ${draw.position.label.ko} 자리: ${draw.card.name.ko} (${draw.card.name.en}) — ${ORIENT_KO[draw.orientation]}`,
    `- Waite 원전 의미(영문): ${draw.card.meanings[draw.orientation].en}`,
    `- 종합 해석(한국어): ${draw.card.meanings[draw.orientation].ko}`,
    themed ? `- 테마별 해석(한국어): ${themed.ko}` : null,
    `- 키워드: ${draw.card.keywords[draw.orientation].ko.join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");
};

const SYSTEM_PROMPT = `당신은 따뜻하고 통찰력 있는 전문 타로 리더입니다. 사용자가 직접 뽑은 카드와 질문을 바탕으로 개인화된 리딩을 제공합니다.

원칙:
- 제공된 카드 자료(Waite 원전 의미, 한국어 사전 해석, 키워드)에 근거해 해석하되, 사용자의 질문 맥락에 맞게 자연스럽게 엮어냅니다.
- 스프레드가 과거·현재·미래라면 세 카드를 하나의 이야기 흐름으로 연결합니다.
- 부드러운 경어체("~합니다", "~해 보세요")를 사용합니다.
- 단정적 예언이 아니라 성찰과 실천을 돕는 조언으로 마무리합니다. 두려움을 주는 표현은 피합니다.
- 건강·법률·재정 관련 질문에는 전문가 상담을 대체하지 않는다는 점을 자연스럽게 한 문장으로 언급합니다.
- 답변 구성: (1) 질문에 대한 한 문장 핵심 응답 → (2) 카드별 해석을 질문과 연결 → (3) 흐름 전체의 종합과 실천 조언. 400~700자 내외.`;

const buildUserPrompt = ({ themeKey, spreadLabel, question, draws }) => {
  const themeLabel = THEMES[themeKey]?.label.ko ?? themeKey;
  return [
    `## 리딩 정보`,
    `- 테마: ${themeLabel}`,
    `- 스프레드: ${spreadLabel}`,
    `- 사용자의 질문: ${question}`,
    ``,
    `## 뽑힌 카드`,
    ...draws.map((d) => describeDraw(d, themeKey)),
    ``,
    `위 카드들을 바탕으로 사용자의 질문에 대한 개인화된 리딩을 작성해 주세요.`,
  ].join("\n");
};

// Deterministic dictionary-stitched reading for environments without an API
// key (and for PREMIUM_MOCK=1 testing). Mirrors the real response shape.
const mockReading = ({ themeKey, question, draws }) => {
  const lines = draws.map((d) => {
    const themed =
      themeKey !== "general" ? byCardId[d.card.id]?.[themeKey]?.[d.orientation] : null;
    const text = themed ? themed.ko : d.card.meanings[d.orientation].ko;
    return `[${d.position.label.ko}] ${d.card.name.ko} ${ORIENT_KO[d.orientation]} — ${text}`;
  });
  return [
    `"${question}"라는 질문에 대해 뽑으신 카드를 살펴보면 다음과 같습니다.`,
    ...lines,
    `카드들이 전하는 흐름을 마음에 두고, 지금 할 수 있는 작은 한 걸음부터 시작해 보세요.`,
  ].join("\n\n");
};

let client = null;
const getClient = () => {
  if (!client) client = new Anthropic();
  return client;
};

async function generateReading(input) {
  if (mockMode()) {
    return { reading: mockReading(input), mock: true };
  }
  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: buildUserPrompt(input) }],
  });
  if (response.stop_reason === "refusal") {
    return { error: "이 질문에는 리딩을 제공할 수 없습니다. 질문을 바꿔 시도해 주세요." };
  }
  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return { reading: text, mock: false };
}

module.exports = { generateReading };
