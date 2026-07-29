import { beforeEach, describe, expect, it } from "vitest";
import {
  forgetServerKnowledge,
  knownJournal,
  knownReadingIds,
  rememberJournal,
  rememberReadings,
} from "@/lib/sync/server-knowledge";

describe("server-knowledge", () => {
  beforeEach(() => {
    forgetServerKnowledge();
  });

  it("아무것도 모르는 상태에서 출발한다", () => {
    expect(knownReadingIds("u1")).toBeNull();
    expect(knownJournal("u1")).toBeNull();
  });

  it("기억한 것을 그대로 돌려준다", () => {
    rememberReadings("u1", ["r1", "r2"]);
    rememberJournal("u1", [["2026-07-28", "2026-07-28T01:00:00.000Z"]]);

    expect([...knownReadingIds("u1")!]).toEqual(["r1", "r2"]);
    expect(knownJournal("u1")!.get("2026-07-28")).toBe(
      "2026-07-28T01:00:00.000Z",
    );
  });

  it("더하지 않고 통째로 교체한다", () => {
    rememberReadings("u1", ["r1", "r2"]);
    rememberReadings("u1", ["r3"]);
    expect([...knownReadingIds("u1")!]).toEqual(["r3"]);
  });

  /*
   * 앎이 다른 계정으로 새면 남의 기록을 "이미 올렸다"고 판단해 이 계정
   * 것을 영영 올리지 않는다. 모르는 쪽(null)으로 틀리는 것만 안전하다.
   */
  it("다른 사용자에게는 앎을 내주지 않는다", () => {
    rememberReadings("u1", ["r1"]);
    expect(knownReadingIds("u2")).toBeNull();
  });

  it("계정이 바뀌면 이전 앎을 버린다", () => {
    rememberReadings("u1", ["r1"]);
    rememberJournal("u1", [["2026-07-28", "t"]]);

    rememberReadings("u2", ["r9"]);
    expect([...knownReadingIds("u2")!]).toEqual(["r9"]);
    expect(knownJournal("u2")).toBeNull(); // u1의 일기 앎이 넘어오지 않는다
    expect(knownReadingIds("u1")).toBeNull();
  });

  it("로그아웃하면 전부 잊는다", () => {
    rememberReadings("u1", ["r1"]);
    rememberJournal("u1", [["2026-07-28", "t"]]);

    forgetServerKnowledge();

    expect(knownReadingIds("u1")).toBeNull();
    expect(knownJournal("u1")).toBeNull();
  });
});
