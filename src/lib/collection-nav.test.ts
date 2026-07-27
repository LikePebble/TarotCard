import { describe, expect, it } from "vitest";
import { neighborSlugs } from "@/lib/collection-nav";

const ORDER = ["a", "b", "c", "d", "e"];

describe("neighborSlugs", () => {
  it("현재 카드가 필터 목록에 없으면 둘 다 null", () => {
    expect(neighborSlugs(ORDER, "z")).toEqual({
      prev: null,
      next: null,
    });
  });

  it("필터가 한 장이면 둘 다 null", () => {
    expect(neighborSlugs(["c"], "c")).toEqual({
      prev: null,
      next: null,
    });
  });

  it("현재 필터 안에서 앞뒤로 순서대로 이동한다", () => {
    expect(neighborSlugs(ORDER, "c")).toEqual({
      prev: "b",
      next: "d",
    });
  });

  it("필터의 양 끝에서는 순환하지 않는다", () => {
    expect(neighborSlugs(ORDER, "a")).toEqual({
      prev: null,
      next: "b",
    });
    expect(neighborSlugs(ORDER, "e")).toEqual({
      prev: "d",
      next: null,
    });
  });
});
