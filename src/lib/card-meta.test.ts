import { describe, expect, it } from "vitest";
import {
  DESCRIPTION_LIMIT,
  cardMetaDescription,
  cardMetaTitle,
  truncateForMeta,
} from "@/lib/card-meta";
import { cards } from "@/data/cards";
import { koCards } from "@/data/ko";
import { reversedCards } from "@/data/reversed";

describe("truncateForMeta", () => {
  it("짧으면 그대로 둔다", () => {
    expect(truncateForMeta("짧은 글.", 100)).toBe("짧은 글.");
  });

  it("줄바꿈과 연속 공백을 한 칸으로 편다", () => {
    expect(truncateForMeta("앞\n\n뒤   끝", 100)).toBe("앞 뒤 끝");
  });

  it("문장 끝에서 자른다", () => {
    const text = "첫 문장입니다. 둘째 문장입니다. 셋째 문장입니다.";
    const out = truncateForMeta(text, 30);
    expect(out.endsWith(".")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(30);
  });

  it("문장 끝이 없으면 어절 경계에서 자르고 말줄임을 붙인다", () => {
    const out = truncateForMeta("가나다 라마바 사아자 차카타 파하가 나다라", 20);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(21);
  });
});

describe("cardMetaDescription", () => {
  it("검색어 형태를 앞머리에 담는다", () => {
    const d = cardMetaDescription("바보", "The Fool", "새로 시작하는 마음입니다.");
    expect(d.startsWith("바보(The Fool) 타로 카드의 정방향·역방향 의미.")).toBe(true);
  });

  it("카드 해석의 첫 문장이 뒤따라 카드마다 달라진다", () => {
    const a = cardMetaDescription("바보", "The Fool", "새로 시작하는 마음입니다.");
    const b = cardMetaDescription("탑", "The Tower", "무너짐이 곧 정리입니다.");
    expect(a).not.toBe(b);
    expect(a).toContain("새로 시작하는 마음입니다.");
  });
});

/*
 * 78장을 실제 데이터로 돌려 본다. 설명이 잘리거나 서로 겹치면 검색 결과에서
 * 통째로 묶이므로, 눈으로 볼 것이 아니라 여기서 막는다.
 */
describe("실제 78장", () => {
  const nameOf = (slug: string, fallback: string) =>
    koCards[slug]?.nameKo ?? fallback;

  it("설명 길이가 상한을 넘지 않는다", () => {
    for (const card of cards) {
      const d = cardMetaDescription(
        nameOf(card.slug, card.nameEn),
        card.nameEn,
        koCards[card.slug]?.description || card.en.description,
      );
      expect(d.length, `${card.slug}: ${d.length}자`).toBeLessThanOrEqual(
        DESCRIPTION_LIMIT + 1, // 말줄임 한 글자까지 허용
      );
    }
  });

  it("설명이 서로 겹치지 않는다", () => {
    const seen = cards.map((card) =>
      cardMetaDescription(
        nameOf(card.slug, card.nameEn),
        card.nameEn,
        koCards[card.slug]?.description || card.en.description,
      ),
    );
    expect(new Set(seen).size).toBe(cards.length);
  });

  it("제목이 서로 겹치지 않는다", () => {
    const seen = cards.map((card) =>
      cardMetaTitle(nameOf(card.slug, card.nameEn), card.nameEn, "클래식 덱"),
    );
    expect(new Set(seen).size).toBe(cards.length);
  });

  /*
   * 제목이 "정방향 역방향 해석"이라고 말하려면 실제로 78장 전부에 역방향
   * 해석이 있어야 한다. 하나라도 비면 그 페이지의 제목이 거짓이 된다.
   */
  it("78장 모두 역방향 해석을 갖고 있다", () => {
    const missing = cards.filter((c) => !reversedCards[c.slug]?.ko?.trim());
    expect(missing.map((c) => c.slug)).toEqual([]);
  });
});
