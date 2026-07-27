import { describe, expect, it } from "vitest";
import {
  deckDetailCtaState,
  deckReadingCtaLabel,
} from "@/lib/deck-detail-cta";

describe("deckDetailCtaState", () => {
  it("게스트는 로컬 소유 캐시와 무관하게 게스트 CTA를 쓴다", () => {
    expect(deckDetailCtaState(false, false)).toBe("guest");
    expect(deckDetailCtaState(false, true)).toBe("guest");
  });

  it("회원은 실제 덱 소유 여부로 CTA가 갈린다", () => {
    expect(deckDetailCtaState(true, false)).toBe("member-unowned");
    expect(deckDetailCtaState(true, true)).toBe("member-owned");
  });
});

describe("deckReadingCtaLabel", () => {
  it("기본 덱 여부에 따라 리딩 CTA 문구를 구분한다", () => {
    expect(deckReadingCtaLabel(true)).toBe("지금 리딩받기");
    expect(deckReadingCtaLabel(false)).toBe("기본 덱 설정하고 리딩받기");
  });
});
