import { describe, expect, it } from "vitest";
import { msUntilNextLocalDay } from "@/lib/use-period-clock";

describe("msUntilNextLocalDay", () => {
  it("정오에는 다음 자정까지 12시간", () => {
    expect(msUntilNextLocalDay(new Date(2026, 7, 8, 12, 0, 0))).toBe(
      12 * 60 * 60 * 1000,
    );
  });

  it("자정 직전에도 최소 양수를 돌려준다", () => {
    expect(msUntilNextLocalDay(new Date(2026, 7, 8, 23, 59, 59, 999))).toBe(1);
  });
});
