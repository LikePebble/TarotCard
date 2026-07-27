import { describe, expect, it } from "vitest";
import {
  cardDetailHref,
  validReadingId,
} from "@/lib/card-detail-nav";

describe("card detail navigation", () => {
  it("리딩에서 진입하면 카드 상세 URL에 리딩 맥락을 보존한다", () => {
    expect(cardDetailHref("wolha-biwon", "the-fool", "reading-123", "major")).toBe(
      "/collection/wolha-biwon/the-fool?readingId=reading-123&filter=major",
    );
  });

  it("도감에서 진입하면 카드 상세 URL에 리딩 맥락을 붙이지 않는다", () => {
    expect(cardDetailHref("wolha-biwon", "the-fool", null, "cups")).toBe(
      "/collection/wolha-biwon/the-fool?filter=cups",
    );
  });

  it("UUID와 레거시 리딩 id를 복귀 대상으로 허용한다", () => {
    expect(validReadingId("b8536994-15c5-4f3a-90d8-a93c1dc81ae3")).toBe(
      "b8536994-15c5-4f3a-90d8-a93c1dc81ae3",
    );
    expect(validReadingId("2026-07-25T03:12:45.000Z-0")).toBe(
      "2026-07-25T03:12:45.000Z-0",
    );
  });

  it("외부 경로나 배열 값은 리딩 복귀 대상으로 사용하지 않는다", () => {
    expect(validReadingId("https://example.com")).toBeNull();
    expect(validReadingId("../reading/other")).toBeNull();
    expect(validReadingId(["reading-123"])).toBeNull();
  });
});
