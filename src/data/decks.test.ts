import { describe, expect, it } from "vitest";
import { decks, deckById, decksByDefaultFirst } from "@/data/decks";

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

describe("decks info", () => {
  it("모든 활성 덱은 소개 문구를 가진다", () => {
    for (const deck of decks.filter((d) => d.active)) {
      expect(deck.info.description.length, `${deck.id} description`).toBeGreaterThan(0);
      for (const p of deck.info.description) expect(p.trim()).not.toBe("");
    }
  });
});

describe("decksByDefaultFirst", () => {
  it("기본 덱을 맨 앞에 놓는다", () => {
    const sorted = decksByDefaultFirst("k-pop-museverse");
    expect(sorted[0].id).toBe("k-pop-museverse");
  });

  it("나머지는 원래 순서를 유지한다", () => {
    const original = decks.filter((d) => d.active).map((d) => d.id);
    const sorted = decksByDefaultFirst("k-pop-museverse").map((d) => d.id);
    expect(sorted.slice(1)).toEqual(
      original.filter((id) => id !== "k-pop-museverse"),
    );
  });

  it("모르는 id면 원래 순서를 그대로 돌려준다", () => {
    const original = decks.filter((d) => d.active).map((d) => d.id);
    expect(decksByDefaultFirst("없는-덱").map((d) => d.id)).toEqual(original);
  });

  it("활성 덱만 담는다", () => {
    expect(decksByDefaultFirst("classic").every((d) => d.active)).toBe(true);
  });
});
