import { cards } from "@/data/cards";

/** Legacy API compatibility: GET /cards returns all 78 cards in the legacy shape. */
export function GET() {
  return Response.json(
    cards.map((card) => ({
      name: card.nameEn,
      description: card.en.description,
      image: card.image,
    })),
  );
}
