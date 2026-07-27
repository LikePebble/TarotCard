import { describe, expect, it } from "vitest";
import { releaseTestToolsEnabled } from "@/lib/dev-reset";

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
