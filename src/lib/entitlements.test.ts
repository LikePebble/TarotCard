import { describe, expect, it } from "vitest";
import {
  EMPTY_ENTITLEMENTS,
  LAUNCH_PROMO_DECKS,
  launchPromoDecksEnabled,
  deckOwnedBy,
  grantedWith,
  parseEntitlements,
  ownsDeck,
  collectedCount,
  collectedSlugs,
} from "@/lib/entitlements";

const NONE = EMPTY_ENTITLEMENTS;
const OWNS_WOLHA = { ownedDeckIds: ["wolha-biwon"], adFree: false };

describe("grantedWith", () => {
  it("덱을 추가한다(중복 없이)", () => {
    const a = grantedWith(EMPTY_ENTITLEMENTS, "wolha-biwon");
    expect(a.ownedDeckIds).toEqual(["wolha-biwon"]);
    const b = grantedWith(a, "wolha-biwon");
    expect(b.ownedDeckIds).toEqual(["wolha-biwon"]);
  });
});

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

describe("launchPromoDecksEnabled", () => {
  it('정확히 "true"일 때만 켠다', () => {
    expect(launchPromoDecksEnabled("true")).toBe(true);
  });
  it("빈 값이나 비슷한 값으로는 열리지 않는다", () => {
    expect(launchPromoDecksEnabled(undefined)).toBe(false);
    expect(launchPromoDecksEnabled("")).toBe(false);
    expect(launchPromoDecksEnabled("false")).toBe(false);
    expect(launchPromoDecksEnabled("1")).toBe(false);
    expect(launchPromoDecksEnabled("TRUE")).toBe(false);
    expect(launchPromoDecksEnabled(" true ")).toBe(false);
  });
});

describe("deckOwnedBy", () => {
  it("프로모션이 꺼지면 기존 판정 그대로", () => {
    expect(deckOwnedBy("classic", NONE, false)).toBe(true);
    expect(deckOwnedBy("wolha-biwon", NONE, false)).toBe(false);
    expect(deckOwnedBy("wolha-biwon", OWNS_WOLHA, false)).toBe(true);
    expect(deckOwnedBy("k-pop-museverse", OWNS_WOLHA, false)).toBe(false);
  });
  it("프로모션이 켜지면 미소유 덱도 소유", () => {
    expect(deckOwnedBy("wolha-biwon", NONE, true)).toBe(true);
    expect(deckOwnedBy("k-pop-museverse", NONE, true)).toBe(true);
  });
  it("프로모션은 개발용 회수보다 위에 있다", () => {
    // grantDeckLocal/revokeDeckLocal로 목록을 비워도 프로모션 중에는 열려 있다.
    expect(deckOwnedBy("wolha-biwon", { ownedDeckIds: [], adFree: false }, true))
      .toBe(true);
  });
});

describe("ownsDeck의 기본 상태", () => {
  it("플래그가 없는 환경에서는 프로모션이 꺼져 있다", () => {
    // 이 파일의 나머지 ownsDeck 기대값이 성립하는 전제를 못 박아 둔다.
    expect(LAUNCH_PROMO_DECKS).toBe(false);
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
