import { describe, expect, it, vi } from "vitest";
import {
  clearLocalJournal,
  entryOf,
  isWritten,
  setEntry,
  withEntry,
  writtenDates,
  type JournalStore,
} from "@/lib/journal";
import { subscribeLocal } from "@/lib/local-events";

describe("withEntry", () => {
  it("본문을 그날 항목으로 저장한다", () => {
    const next = withEntry({}, "2026-07-19", "오늘의 메모", "2026-07-19T14:00:00.000Z");
    expect(next["2026-07-19"]).toEqual({
      body: "오늘의 메모",
      updatedAt: "2026-07-19T14:00:00.000Z",
    });
  });

  /*
   * 항목을 통째로 지우면 다른 기기가 그것을 "서버에 아직 안 올린 새 글"과
   * 구분할 수 없다. 병합이 한쪽에만 있는 날짜를 그대로 채택하므로 삭제가
   * 그 기기에서 되살아나 다시 서버로 올라간다. 톰스톤은 그 구분을 만든다.
   */
  it("빈 본문은 그날을 톰스톤으로 남긴다(지우지 않는다)", () => {
    const store: JournalStore = {
      "2026-07-19": { body: "지울 메모", updatedAt: "2026-07-19T00:00:00.000Z" },
    };
    const next = withEntry(store, "2026-07-19", "   ", "2026-07-20T00:00:00.000Z");
    expect(next["2026-07-19"]).toEqual({
      body: "",
      updatedAt: "2026-07-20T00:00:00.000Z", // 삭제 시각이 남아야 LWW로 겨룰 수 있다
    });
  });

  it("원래 없던 날에 빈 본문을 저장하면 톰스톤도 만들지 않는다", () => {
    const next = withEntry({}, "2026-07-19", "", "2026-07-20T00:00:00.000Z");
    expect(next["2026-07-19"]).toBeUndefined();
  });

  it("톰스톤에 다시 쓰면 일반 항목으로 돌아온다", () => {
    const store = withEntry(
      { "2026-07-19": { body: "옛 메모", updatedAt: "2026-07-19T00:00:00.000Z" } },
      "2026-07-19",
      "",
      "2026-07-20T00:00:00.000Z",
    );
    const next = withEntry(store, "2026-07-19", "다시 씀", "2026-07-21T00:00:00.000Z");
    expect(next["2026-07-19"]).toEqual({
      body: "다시 씀",
      updatedAt: "2026-07-21T00:00:00.000Z",
    });
  });

  it("입력 스토어를 변형하지 않는다(순수)", () => {
    const store: JournalStore = {
      "2026-07-19": { body: "메모", updatedAt: "2026-07-19T00:00:00.000Z" },
    };
    withEntry(store, "2026-07-19", "", "2026-07-20T00:00:00.000Z");
    expect(store["2026-07-19"].body).toBe("메모");
  });
});

/*
 * 화면은 톰스톤을 "없는 날"로 봐야 하고 동기화는 "지운 기록"으로 봐야 한다.
 * 화면 쪽 판정을 전부 이 세 함수로 모아, 새 화면이 store[date]를 그냥 진위
 * 판정하다가 지운 날을 보여주는 일이 없게 한다.
 */
describe("톰스톤 걸러내기", () => {
  const store: JournalStore = {
    "2026-07-19": { body: "쓴 글", updatedAt: "2026-07-19T00:00:00.000Z" },
    "2026-07-20": { body: "", updatedAt: "2026-07-20T00:00:00.000Z" },
  };

  it("isWritten은 톰스톤과 없는 날을 모두 거짓으로 본다", () => {
    expect(isWritten(store["2026-07-19"])).toBe(true);
    expect(isWritten(store["2026-07-20"])).toBe(false);
    expect(isWritten(undefined)).toBe(false);
  });

  it("entryOf는 톰스톤에 null을 준다", () => {
    expect(entryOf(store, "2026-07-19")?.body).toBe("쓴 글");
    expect(entryOf(store, "2026-07-20")).toBeNull();
    expect(entryOf(store, "2026-07-21")).toBeNull();
  });

  it("writtenDates는 톰스톤을 세지 않는다", () => {
    expect(writtenDates(store)).toEqual(["2026-07-19"]);
  });
});

describe("setEntry", () => {
  it("journal 채널로 변경을 알린다", () => {
    const fn = vi.fn();
    const off = subscribeLocal("journal", fn);
    setEntry("2026-07-22", "메모");
    off();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("store 채널은 건드리지 않는다", () => {
    const fn = vi.fn();
    const off = subscribeLocal("store", fn);
    setEntry("2026-07-22", "메모");
    off();
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("clearLocalJournal", () => {
  it("journal 채널로 변경을 알린다", () => {
    const fn = vi.fn();
    const off = subscribeLocal("journal", fn);
    clearLocalJournal();
    off();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
