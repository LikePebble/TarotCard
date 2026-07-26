import { describe, expect, it } from "vitest";
import {
  deckAfterReleaseRevoke,
  releaseTestToolsEnabled,
} from "@/lib/dev-reset";

describe("releaseTestToolsEnabled", () => {
  it("개발 환경에서는 별도 설정 없이 도구를 노출한다", () => {
    expect(releaseTestToolsEnabled("development", undefined)).toBe(true);
  });

  it("운영 환경에서는 명시적으로 켠 경우에만 노출한다", () => {
    expect(releaseTestToolsEnabled("production", "true")).toBe(true);
    expect(releaseTestToolsEnabled("production", undefined)).toBe(false);
    expect(releaseTestToolsEnabled("production", "false")).toBe(false);
  });
});

describe("deckAfterReleaseRevoke", () => {
  it("현재 기본 덱을 회수하면 클래식으로 되돌린다", () => {
    expect(deckAfterReleaseRevoke("wolha-biwon", "wolha-biwon")).toBe(
      "classic",
    );
  });

  it("다른 덱 회수는 현재 기본 덱을 유지한다", () => {
    expect(deckAfterReleaseRevoke("classic", "wolha-biwon")).toBe("classic");
    expect(deckAfterReleaseRevoke("k-pop-museverse", "wolha-biwon")).toBe(
      "k-pop-museverse",
    );
  });
});
