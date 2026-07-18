export type Deck = {
  id: string;
  nameKo: string;
  active: boolean;
  price?: number;
};

export const decks: Deck[] = [{ id: "classic", nameKo: "클래식 덱", active: true }];

export const activeDeck: Deck = decks[0];
