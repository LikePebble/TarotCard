import { describe, expect, it } from "vitest";
import { decks, deckById } from "@/data/decks";

describe("decks", () => {
  it("id는 서로 겹치지 않고, deckById는 각 id의 덱을 돌려준다", () => {
    const ids = decks.map((deck) => deck.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const deck of decks) {
      expect(deckById(deck.id)).toBe(deck);
    }
  });

  it("모르는 id는 클래식으로 떨어지고, 클래식만 뒷면 아트가 없다", () => {
    expect(deckById("없는-덱").id).toBe("classic");
    expect(deckById("classic").cardBack).toBeUndefined();
    for (const deck of decks.filter((d) => d.id !== "classic")) {
      expect(deck.cardBack).toBe(`/decks/${deck.id}/card-back.webp`);
    }
  });
});
