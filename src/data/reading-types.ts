export type SpreadType = "one" | "three";

export type ReadingTypeId = "ONE_CARD" | "THREE_CARD_PPF";

export type ReadingType = {
  id: ReadingTypeId;
  spread: SpreadType;
  /** 뽑는 카드 수. */
  count: number;
  /** 포지션 의미(순서 고정). */
  positions: string[];
  /** 케이던스 단위: 일 1회 / 주 1회. */
  cadenceUnit: "day" | "week";
};

export const READING_TYPES: Record<SpreadType, ReadingType> = {
  one: {
    id: "ONE_CARD",
    spread: "one",
    count: 1,
    positions: ["today"],
    cadenceUnit: "day",
  },
  three: {
    id: "THREE_CARD_PPF",
    spread: "three",
    count: 3,
    positions: ["past", "present", "future"],
    cadenceUnit: "week",
  },
};

export function readingTypeOf(spread: SpreadType): ReadingType {
  return READING_TYPES[spread];
}
