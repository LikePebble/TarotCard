import { afterEach, beforeEach, describe, expect, it } from "vitest";

/** 테스트 환경은 node라 window가 없다. 필요한 만큼만 세운다. */
function installStorage(): Map<string, string> {
  const data = new Map<string, string>();
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    },
  };
  return data;
}

async function load() {
  const { hasMergedWith, rememberMergedWith, forgetMergedDevice } =
    await import("@/lib/sync/first-merge");
  return { hasMergedWith, rememberMergedWith, forgetMergedDevice };
}

describe("first-merge", () => {
  beforeEach(() => {
    installStorage();
  });

  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it("처음 만나는 계정은 아직 병합하지 않은 것으로 본다", async () => {
    const { hasMergedWith } = await load();
    expect(hasMergedWith("u1")).toBe(false);
  });

  it("남긴 뒤에는 병합한 기기로 본다", async () => {
    const { hasMergedWith, rememberMergedWith } = await load();
    rememberMergedWith("u1");
    expect(hasMergedWith("u1")).toBe(true);
  });

  /*
   * 표식이 계정 사이에 새면 다른 계정의 게스트 병합이 LWW로 내려간다.
   * 그 방향은 유실이 아니라 "게스트 글이 계정 글을 이길 수 있음"이라 덜
   * 위험하지만, 어느 쪽이든 계정별로 재는 것이 맞다.
   */
  it("다른 계정에는 적용되지 않는다", async () => {
    const { hasMergedWith, rememberMergedWith } = await load();
    rememberMergedWith("u1");
    expect(hasMergedWith("u2")).toBe(false);
  });

  it("계정을 갈아타면 이전 표식을 대체한다", async () => {
    const { hasMergedWith, rememberMergedWith } = await load();
    rememberMergedWith("u1");
    rememberMergedWith("u2");
    expect(hasMergedWith("u1")).toBe(false);
    expect(hasMergedWith("u2")).toBe(true);
  });

  it("지우면 다시 게스트 병합으로 돌아간다", async () => {
    const { hasMergedWith, rememberMergedWith, forgetMergedDevice } =
      await load();
    rememberMergedWith("u1");
    forgetMergedDevice();
    expect(hasMergedWith("u1")).toBe(false);
  });

  it("저장소가 막혀 있어도 던지지 않고 게스트 병합으로 답한다", async () => {
    (globalThis as { window?: unknown }).window = {
      localStorage: {
        getItem: () => {
          throw new Error("보안 정책으로 차단됨");
        },
        setItem: () => {
          throw new Error("보안 정책으로 차단됨");
        },
        removeItem: () => {
          throw new Error("보안 정책으로 차단됨");
        },
      },
    };
    const { hasMergedWith, rememberMergedWith, forgetMergedDevice } =
      await load();

    expect(() => rememberMergedWith("u1")).not.toThrow();
    expect(() => forgetMergedDevice()).not.toThrow();
    expect(hasMergedWith("u1")).toBe(false);
  });

  it("서버 렌더에서는 항상 게스트 병합으로 답한다", async () => {
    delete (globalThis as { window?: unknown }).window;
    const { hasMergedWith, rememberMergedWith } = await load();
    expect(() => rememberMergedWith("u1")).not.toThrow();
    expect(hasMergedWith("u1")).toBe(false);
  });
});
