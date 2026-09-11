import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), options: null as any }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: (_url: string, _key: string, options: unknown) => {
    mocks.options = options;
    return { auth: { getUser: mocks.getUser } };
  },
}));

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-key");
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const request = () => new NextRequest("https://arca.realm.ai.kr/", {
  headers: { cookie: "session=existing", "x-vercel-ip-country": "KR" },
});

describe("middleware auth availability", () => {
  it("returns within five seconds, aborts fetch and ignores late cookie writes", async () => {
    let settle!: () => void;
    mocks.getUser.mockImplementation(() => new Promise<void>((resolve) => { settle = resolve; }));
    const fetchMock = vi.fn().mockResolvedValue(new Response());
    vi.stubGlobal("fetch", fetchMock);
    const { middleware } = await import("./middleware");
    const req = request();
    const pending = middleware(req);
    await mocks.options.global.fetch("https://example.supabase.co/auth/v1/user");
    const signal = fetchMock.mock.calls[0][1].signal;
    expect(signal.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(5_000);
    const response = await pending;
    expect(response.status).toBe(200);
    expect(signal.aborted).toBe(true);
    mocks.options.cookies.setAll([{ name: "session", value: "", options: { maxAge: 0 } }]);
    expect(req.cookies.get("session")?.value).toBe("existing");
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get("Vary")).toBe("X-Vercel-IP-Country");
    settle();
  });

  it("preserves successful refresh cookies and clears the timeout", async () => {
    mocks.getUser.mockImplementation(async () => {
      mocks.options.cookies.setAll([{ name: "session", value: "refreshed", options: { httpOnly: true } }]);
    });
    const { middleware } = await import("./middleware");
    const req = request();
    const response = await middleware(req);
    expect(req.cookies.get("session")?.value).toBe("refreshed");
    expect(response.cookies.get("session")?.value).toBe("refreshed");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps the page and existing cookie on an unexpected auth failure", async () => {
    mocks.getUser.mockRejectedValue(new Error("network unavailable"));
    const { middleware } = await import("./middleware");
    const req = request();
    const response = await middleware(req);
    expect(response.status).toBe(200);
    expect(req.cookies.get("session")?.value).toBe("existing");
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
});
