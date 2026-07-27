import { cards } from "@/data/cards";

/**
 * Legacy API compatibility: GET /cards returns all 78 cards in the legacy shape.
 * 외부 소비자가 남아 있을 수 있어 유지하되, 검색엔진에는 색인시키지 않는다
 * (영문 해석 전문이 통째로 노출되어 카드 상세 페이지와 경쟁한다).
 */
export function GET() {
  return Response.json(
    cards.map((card) => ({
      name: card.nameEn,
      description: card.en.description,
      image: card.image,
    })),
    { headers: { "X-Robots-Tag": "noindex" } },
  );
}
