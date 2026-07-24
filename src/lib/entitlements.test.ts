import { describe, expect, it } from "vitest";
import {
  EMPTY_ENTITLEMENTS,
  parseEntitlements,
  ownsDeck,
  collectedCount,
  collectedSlugs,
} from "@/lib/entitlements";

const NONE = EMPTY_ENTITLEMENTS;
const OWNS_WOLHA = { ownedDeckIds: ["wolha-biwon"], adFree: false };

describe("parseEntitlements", () => {
  it("정상 객체를 그대로 정규화", () => {
    expect(parseEntitlements({ ownedDeckIds: ["wolha-biwon"], adFree: true }))
      .toEqual({ ownedDeckIds: ["wolha-biwon"], adFree: true });
  });
  it("깨진 값은 EMPTY로", () => {
    expect(parseEntitlements(null)).toEqual(EMPTY_ENTITLEMENTS);
    expect(parseEntitlements({ ownedDeckIds: "x" })).toEqual(EMPTY_ENTITLEMENTS);
    expect(parseEntitlements({})).toEqual(EMPTY_ENTITLEMENTS);
  });
  it("ownedDeckIds의 비문자열 원소는 걸러낸다", () => {
    expect(parseEntitlements({ ownedDeckIds: ["a", 1, null], adFree: 0 }))
      .toEqual({ ownedDeckIds: ["a"], adFree: false });
  });
});

describe("ownsDeck", () => {
  it("클래식은 항상 소유(행 없이도)", () => {
    expect(ownsDeck("classic", NONE)).toBe(true);
  });
  it("프리미엄은 목록에 있을 때만 소유", () => {
    expect(ownsDeck("wolha-biwon", NONE)).toBe(false);
    expect(ownsDeck("wolha-biwon", OWNS_WOLHA)).toBe(true);
    expect(ownsDeck("k-pop-museverse", OWNS_WOLHA)).toBe(false);
  });
});

describe("collectedCount", () => {
  it("소유 덱은 78, 미소유는 0", () => {
    expect(collectedCount("classic", NONE)).toBe(78);
    expect(collectedCount("wolha-biwon", NONE)).toBe(0);
    expect(collectedCount("wolha-biwon", OWNS_WOLHA)).toBe(78);
  });
});

describe("collectedSlugs", () => {
  it("소유 덱은 78개 슬러그, 미소유는 빈 집합", () => {
    expect(collectedSlugs("classic", NONE).size).toBe(78);
    expect(collectedSlugs("wolha-biwon", NONE).size).toBe(0);
    expect(collectedSlugs("classic", NONE).has("the-fool")).toBe(true);
  });
});
