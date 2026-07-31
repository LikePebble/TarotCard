import { describe, expect, it } from "vitest";
import { resolveDeckOnLogin } from "@/lib/deck-selection";

describe("resolveDeckOnLogin", () => {
  it("서버가 비-기본값이면 계정에 쌓인 선택이 이긴다", () => {
    expect(resolveDeckOnLogin("classic", "wolha-biwon")).toBe("wolha-biwon");
    expect(resolveDeckOnLogin("k-pop-museverse", "wolha-biwon")).toBe(
      "wolha-biwon",
    );
  });

  /*
   * 컬럼 기본값이 'classic'이라 서버의 'classic'은 "명시적 선택"과 "한 번도
   * 고른 적 없음"을 구분하지 못한다. 의견으로 취급하면 손댄 적 없는 프로필이
   * 방금 게스트로 고른 덱을 조용히 되돌린다.
   */
  it("서버가 기본값이면 의견 없음으로 읽고 게스트 선택을 보존한다", () => {
    expect(resolveDeckOnLogin("wolha-biwon", "classic")).toBe("wolha-biwon");
  });

  it("양쪽이 같으면 그대로 둔다", () => {
    expect(resolveDeckOnLogin("classic", "classic")).toBe("classic");
    expect(resolveDeckOnLogin("wolha-biwon", "wolha-biwon")).toBe(
      "wolha-biwon",
    );
  });
});
