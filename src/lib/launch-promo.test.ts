import { describe, expect, it } from "vitest";
import type { Deck } from "@/data/decks";
import { decks } from "@/data/decks";
import {
  hasFinalConsonant,
  joinDeckNames,
  launchPromoVariant,
  promoDeckNames,
} from "@/lib/launch-promo";

const deck = (id: string, nameKo: string, active = true): Deck => ({
  id,
  nameKo,
  active,
  info: { description: [] },
});

describe("promoDeckNames", () => {
  it("클래식과 비활성 덱을 뺀 이름만 남긴다", () => {
    expect(
      promoDeckNames([
        deck("classic", "클래식 덱"),
        deck("wolha-biwon", "월하비원"),
        deck("hidden", "준비 중인 덱", false),
      ]),
    ).toEqual(["월하비원"]);
  });

  it("실제 덱 목록에서도 클래식만 빠진다", () => {
    // 무료 덱이 늘어나도 문구가 따라오는지 확인하는 자리.
    const names = promoDeckNames(decks);
    expect(names).not.toContain("클래식 덱");
    expect(names.length).toBe(decks.filter((d) => d.active).length - 1);
  });
});

describe("hasFinalConsonant", () => {
  it("받침이 있으면 true, 없으면 false", () => {
    expect(hasFinalConsonant("월하비원")).toBe(true);
    expect(hasFinalConsonant("뮤즈버스")).toBe(false);
  });
  it("한글 음절이 아니면 판정하지 않는다", () => {
    expect(hasFinalConsonant("K-POP")).toBe(null);
    expect(hasFinalConsonant("")).toBe(null);
  });
});

describe("joinDeckNames", () => {
  it("둘이면 받침에 맞는 접속조사를 붙인다", () => {
    expect(joinDeckNames(["월하비원", "K-POP 뮤즈버스"])).toBe(
      "월하비원과 K-POP 뮤즈버스",
    );
    expect(joinDeckNames(["뮤즈버스", "월하비원"])).toBe("뮤즈버스와 월하비원");
  });
  it("셋 이상이면 쉼표로 나열한다", () => {
    expect(joinDeckNames(["가", "나", "다"])).toBe("가, 나, 다");
  });
  it("하나면 그대로, 비면 빈 문자열", () => {
    expect(joinDeckNames(["월하비원"])).toBe("월하비원");
    expect(joinDeckNames([])).toBe("");
  });
  it("판정할 수 없는 이름으로 끝나면 '와'로 떨어진다", () => {
    expect(joinDeckNames(["K-POP", "월하비원"])).toBe("K-POP와 월하비원");
  });
});

describe("launchPromoVariant", () => {
  it("플래그가 꺼지면 어떤 상태에서도 렌더하지 않는다", () => {
    expect(launchPromoVariant(false, false, false, 2)).toBe(null);
    expect(launchPromoVariant(false, false, true, 2)).toBe(null);
    expect(launchPromoVariant(false, true, true, 2)).toBe(null);
  });
  it("세션 확정 전에는 렌더하지 않는다", () => {
    expect(launchPromoVariant(true, true, false, 2)).toBe(null);
    expect(launchPromoVariant(true, true, true, 2)).toBe(null);
  });
  it("드릴 덱이 없으면 렌더하지 않는다", () => {
    expect(launchPromoVariant(true, false, false, 0)).toBe(null);
    expect(launchPromoVariant(true, false, true, 0)).toBe(null);
  });
  it("확정 뒤에는 로그인 여부로 문구가 갈린다", () => {
    expect(launchPromoVariant(true, false, false, 2)).toBe("guest");
    expect(launchPromoVariant(true, false, true, 2)).toBe("member");
  });
});
