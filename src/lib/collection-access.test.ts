import { describe, expect, it } from "vitest";
import { collectionVisibility } from "@/lib/collection-access";

describe("collectionVisibility", () => {
  const encounters = new Set(["the-fool"]);

  it("게스트의 대기 기록은 수집·해금으로 계산하지 않는다", () => {
    expect(collectionVisibility(false, true, encounters)).toEqual({
      owns: false,
      encounters: new Set(),
    });
  });

  it("로그인하면 기존 만남 기록과 소유 상태를 수집에 반영한다", () => {
    expect(collectionVisibility(true, false, encounters)).toEqual({
      owns: false,
      encounters,
    });
    expect(collectionVisibility(true, true, encounters)).toEqual({
      owns: true,
      encounters,
    });
  });
});
