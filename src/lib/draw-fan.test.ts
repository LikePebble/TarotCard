import { describe, expect, it } from "vitest";
import { fanStackOrder } from "./draw-fan";

describe("fanStackOrder", () => {
  it("중앙 카드부터 바깥 카드 순서로 겹침과 클릭 우선순위를 준다", () => {
    expect(Array.from({ length: 7 }, (_, i) => fanStackOrder(i, 7))).toEqual([
      4, 5, 6, 7, 6, 5, 4,
    ]);
  });
});
