import { describe, expect, it } from "vitest";
import { pickOrientations, secureRand } from "@/lib/orientation";

describe("pickOrientations", () => {
  it("난수가 0.5 미만이면 역방향이다", () => {
    expect(pickOrientations(3, () => 0)).toEqual([
      "reversed",
      "reversed",
      "reversed",
    ]);
    expect(pickOrientations(3, () => 0.49)).toEqual([
      "reversed",
      "reversed",
      "reversed",
    ]);
  });

  it("난수가 0.5 이상이면 정방향이다", () => {
    expect(pickOrientations(3, () => 0.5)).toEqual([
      "upright",
      "upright",
      "upright",
    ]);
    expect(pickOrientations(1, () => 0.99)).toEqual(["upright"]);
  });

  it("카드마다 독립적으로 뽑는다 - 혼합 시퀀스", () => {
    const seq = [0.1, 0.7, 0.3];
    let i = 0;
    expect(pickOrientations(3, () => seq[i++])).toEqual([
      "reversed",
      "upright",
      "reversed",
    ]);
  });

  it("요청한 개수만큼 돌려준다", () => {
    expect(pickOrientations(0, () => 0)).toEqual([]);
    expect(pickOrientations(1, () => 0)).toHaveLength(1);
    expect(pickOrientations(3, () => 0)).toHaveLength(3);
  });
});

describe("secureRand", () => {
  it("[0,1) 범위의 수를 돌려준다", () => {
    for (let i = 0; i < 100; i += 1) {
      const n = secureRand();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});
