import { cards } from "@/data/cards";

export const dynamic = "force-dynamic";

/** Legacy API compatibility: GET /cards/onecard returns one random card. */
export function GET() {
  const card = cards[Math.floor(Math.random() * cards.length)];
  return Response.json({
    name: card.nameEn,
    description: card.en.description,
    image: card.image,
  });
}
