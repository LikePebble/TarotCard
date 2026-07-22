import { describe, expect, it } from "vitest";
import { journalPruneFilter } from "@/lib/sync/journal-remote";

describe("journalPruneFilter", () => {
  it("PostgREST in-리스트 형식으로 조립한다", () => {
    expect(journalPruneFilter(["2026-07-21", "2026-07-22"])).toBe(
      '("2026-07-21","2026-07-22")',
    );
  });

  it("한 개짜리도 괄호와 따옴표를 유지한다", () => {
    expect(journalPruneFilter(["2026-01-01"])).toBe('("2026-01-01")');
  });
});
