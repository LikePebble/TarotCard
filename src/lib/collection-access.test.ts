import { describe, expect, it } from "vitest";
import {
  collectionVisibility,
  shouldPromptGuestCollection,
} from "@/lib/collection-access";

describe("collectionVisibility", () => {
  const encounters = new Set(["the-fool"]);

  it("게스트의 프리미엄 덱 대기 기록은 수집·해금으로 계산하지 않는다", () => {
    expect(collectionVisibility(false, true, encounters, "wolha-biwon")).toEqual({
      owns: false,
      encounters: new Set(),
    });
  });

  it("클래식은 게스트도 전 카드 소유 상태로 본다", () => {
    expect(collectionVisibility(false, true, encounters, "classic")).toEqual({
      owns: true,
      encounters,
    });
  });

  it("로그인하면 기존 만남 기록과 소유 상태를 수집에 반영한다", () => {
    expect(collectionVisibility(true, false, encounters, "wolha-biwon")).toEqual({
      owns: false,
      encounters,
    });
    expect(collectionVisibility(true, true, encounters, "wolha-biwon")).toEqual({
      owns: true,
      encounters,
    });
  });
});

describe("shouldPromptGuestCollection", () => {
  it("게스트에게도 항상 열려 있는 클래식은 수집 로그인을 권하지 않는다", () => {
    expect(shouldPromptGuestCollection(false, "classic")).toBe(false);
  });

  it("게스트에게 잠긴 프리미엄 덱만 수집 로그인을 권한다", () => {
    expect(shouldPromptGuestCollection(false, "wolha-biwon")).toBe(true);
    expect(shouldPromptGuestCollection(true, "wolha-biwon")).toBe(false);
  });
});
