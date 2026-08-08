import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabase/server";
import { POST } from "./route";

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabase: vi.fn(),
  getServiceSupabase: vi.fn(),
}));

const mockedServerSupabase = vi.mocked(getServerSupabase);
const mockedServiceSupabase = vi.mocked(getServiceSupabase);
const REQUEST_ID = "11111111-1111-4111-8111-111111111111";

function request(body: unknown) {
  return new Request("http://localhost/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function authenticatedClient(options: {
  rpcData?: { request_id: string; status: "pending" | "sent" | "failed" };
  rpcError?: { message: string } | null;
} = {}) {
  const single = vi.fn().mockResolvedValue({
    data: options.rpcData ?? { request_id: REQUEST_ID, status: "pending" },
    error: options.rpcError ?? null,
  });
  const rpc = vi.fn(() => ({ single }));
  return {
    rpc,
    client: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "member@example.com" } },
          error: null,
        }),
      },
      rpc,
    },
  };
}

describe("POST /api/inquiries", () => {
  let update: ReturnType<typeof vi.fn>;
  let updateEq: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.INQUIRY_FROM_EMAIL = "Arca <contact@example.com>";
    process.env.INQUIRY_RECIPIENT_EMAIL = "operator@example.com";
    updateEq = vi.fn().mockResolvedValue({ error: null });
    update = vi.fn(() => ({ eq: updateEq }));
    mockedServiceSupabase.mockReturnValue({
      from: vi.fn(() => ({ update })),
    } as never);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.RESEND_API_KEY;
    delete process.env.INQUIRY_FROM_EMAIL;
    delete process.env.INQUIRY_RECIPIENT_EMAIL;
  });

  it("rejects a request without an authenticated user", async () => {
    mockedServerSupabase.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    } as never);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request({ category: "other", message: "충분히 긴 문의 내용입니다." }));

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stores the inquiry and sends a deterministic plain-text email", async () => {
    const { client, rpc } = authenticatedClient();
    mockedServerSupabase.mockResolvedValue(client as never);
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ id: "email-1" }, { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request({
      requestId: REQUEST_ID,
      category: "account",
      message: "회원 정보를 확인해 주세요.",
      responseContact: "010-1234-5678",
    }));

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("create_inquiry", expect.objectContaining({
      p_request_id: REQUEST_ID,
      p_category: "account",
    }));
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(options.body));
    expect(options.headers).toMatchObject({
      "Idempotency-Key": `arca-inquiry-${REQUEST_ID}`,
    });
    expect(payload).toMatchObject({
      from: "Arca <contact@example.com>",
      to: ["operator@example.com"],
      reply_to: "member@example.com",
      subject: "[아르카 문의] 회원 관련 문의",
    });
    expect(payload.text).toContain("답변받을 연락처: 010-1234-5678");
    expect(payload.html).toBeUndefined();
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      status: "sent",
      provider_id: "email-1",
    }));
  });

  it("does not expose a mail provider failure and records failed delivery", async () => {
    mockedServerSupabase.mockResolvedValue(authenticatedClient().client as never);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(request({
      requestId: REQUEST_ID,
      category: "suggestion",
      message: "화면을 개선해 주세요.",
    }));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toEqual({ error: "접수 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요." });
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ status: "failed" }));
  });

  it("returns success without resending an already sent request", async () => {
    mockedServerSupabase.mockResolvedValue(
      authenticatedClient({ rpcData: { request_id: REQUEST_ID, status: "sent" } }).client as never,
    );
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request({
      requestId: REQUEST_ID,
      category: "other",
      message: "이미 접수한 문의입니다.",
    }));

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 429 for the database rate limit", async () => {
    mockedServerSupabase.mockResolvedValue(
      authenticatedClient({ rpcError: { message: "inquiry_rate_limited" } }).client as never,
    );
    vi.stubGlobal("fetch", vi.fn());

    const response = await POST(request({
      requestId: REQUEST_ID,
      category: "other",
      message: "연속으로 접수한 문의입니다.",
    }));

    expect(response.status).toBe(429);
  });

  it("uses an optional email address as the reply target", async () => {
    mockedServerSupabase.mockResolvedValue(authenticatedClient().client as never);
    const fetchMock = vi.fn().mockResolvedValue(Response.json({}, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await POST(request({
      requestId: REQUEST_ID,
      category: "other",
      message: "이 이메일로 답변해 주세요.",
      responseContact: "reply@example.com",
    }));

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(options.body)).reply_to).toBe("reply@example.com");
  });
});
