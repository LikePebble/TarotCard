import { describe, expect, it } from "vitest";
import { fanRotation, fanStackOrder } from "./draw-fan";

describe("fanStackOrder", () => {
  it("중앙 카드부터 바깥 카드 순서로 겹침과 클릭 우선순위를 준다", () => {
    expect(Array.from({ length: 7 }, (_, i) => fanStackOrder(i, 7))).toEqual([
      4, 5, 6, 7, 6, 5, 4,
    ]);
  });
});

describe("fanRotation", () => {
  it("기존 모바일 부채꼴의 1·3카드 각도를 보존한다", () => {
    expect(fanRotation(-3, "one")).toBe("-36deg");
    expect(fanRotation(0, "one")).toBe("0deg");
    expect(fanRotation(3, "three")).toBe("27deg");
  });

  it("기존 데스크톱 부채꼴의 공통 각도를 보존한다", () => {
    expect(fanRotation(-3, "one", true)).toBe("-24deg");
    expect(fanRotation(3, "three", true)).toBe("24deg");
  });
});
