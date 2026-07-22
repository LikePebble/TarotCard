import { describe, expect, it } from "vitest";
import { neighborSlugs } from "@/lib/collection-nav";

const ORDER = ["a", "b", "c", "d", "e"];

describe("neighborSlugs", () => {
  it("수집이 0장이면 둘 다 null", () => {
    expect(neighborSlugs(ORDER, new Set(), "c")).toEqual({
      prev: null,
      next: null,
    });
  });

  it("수집이 1장이고 그게 현재 카드면 둘 다 null(자기 자신으로 도는 링크 없음)", () => {
    expect(neighborSlugs(ORDER, new Set(["c"]), "c")).toEqual({
      prev: null,
      next: null,
    });
  });

  it("현재 카드가 수집 목록에 있으면 그 목록 안에서 앞뒤로 오간다", () => {
    const collected = new Set(["a", "c", "e"]);
    expect(neighborSlugs(ORDER, collected, "c")).toEqual({
      prev: "a",
      next: "e",
    });
  });

  it("수집 목록의 양 끝은 순환한다(첫 카드의 prev는 마지막 수집 카드)", () => {
    const collected = new Set(["a", "c", "e"]);
    expect(neighborSlugs(ORDER, collected, "a")).toEqual({
      prev: "e",
      next: "c",
    });
    expect(neighborSlugs(ORDER, collected, "e")).toEqual({
      prev: "c",
      next: "a",
    });
  });

  it("현재 카드가 수집 목록에 없으면(URL 직접 진입) 앞쪽 마지막·뒤쪽 첫 수집 카드를 고른다", () => {
    // b(미수집)에서: 전체 순서상 앞쪽엔 수집 카드가 없어 뒤로 순환해 e를 찾고,
    // 뒤쪽은 바로 다음의 수집 카드 d를 찾는다.
    const collected = new Set(["d", "e"]);
    expect(neighborSlugs(ORDER, collected, "b")).toEqual({
      prev: "e",
      next: "d",
    });
  });

  it("미수집 카드 기준으로 앞뒤 모두 같은 유일한 수집 카드를 가리킬 수 있다", () => {
    const collected = new Set(["a"]);
    expect(neighborSlugs(ORDER, collected, "c")).toEqual({
      prev: "a",
      next: "a",
    });
  });

  it("미수집 카드 바로 옆에 수집 카드가 있으면 그 카드를 고른다", () => {
    const collected = new Set(["b", "d"]);
    expect(neighborSlugs(ORDER, collected, "c")).toEqual({
      prev: "b",
      next: "d",
    });
  });
});
