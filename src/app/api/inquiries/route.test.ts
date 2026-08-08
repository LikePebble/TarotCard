import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getServerSupabase } from "@/lib/supabase/server";
import { POST } from "./route";

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabase: vi.fn(),
}));

const mockedServerSupabase = vi.mocked(getServerSupabase);
const REQUEST_ID = "11111111-1111-4111-8111-111111111111";

function request(body: unknown) {
  return new Request("http://localhost/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function authenticatedClient() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-1", email: "member@example.com" } },
        error: null,
      }),
    },
  };
}

function guestClient() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  };
}

describe("POST /api/inquiries", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-key";
    process.env.INQUIRY_FROM_EMAIL = "Arca <contact@example.com>";
    process.env.INQUIRY_RECIPIENT_EMAIL = "operator@example.com";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.RESEND_API_KEY;
    delete process.env.INQUIRY_FROM_EMAIL;
    delete process.env.INQUIRY_RECIPIENT_EMAIL;
  });

  it("sends a guest inquiry directly by email", async () => {
    mockedServerSupabase.mockResolvedValue(guestClient() as never);
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ id: "email-guest" }, { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request({
      requestId: REQUEST_ID,
      category: "other",
      message: "비회원으로 남기는 충분히 긴 문의입니다.",
      responseContact: "guest@example.com",
    }));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(options.body));
    expect(options.headers).toMatchObject({
      "Idempotency-Key": `arca-inquiry-${REQUEST_ID}`,
      "User-Agent": "arca-inquiry/1.0",
    });
    expect(payload.reply_to).toBe("guest@example.com");
    expect(payload.text).toContain("접수 유형: 비회원");
  });

  it("allows guest feedback without a response contact", async () => {
    mockedServerSupabase.mockResolvedValue(guestClient() as never);
    const fetchMock = vi.fn().mockResolvedValue(Response.json({}, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request({
      requestId: REQUEST_ID,
      category: "suggestion",
      message: "답변 없이 개선 의견만 전달합니다.",
    }));

    expect(response.status).toBe(200);
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(options.body))).not.toHaveProperty("reply_to");
  });

  it("uses the account email for a member inquiry", async () => {
    mockedServerSupabase.mockResolvedValue(authenticatedClient() as never);
    const fetchMock = vi.fn().mockResolvedValue(Response.json({}, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(request({
      requestId: REQUEST_ID,
      category: "account",
      message: "회원 정보를 확인해 주세요.",
      responseContact: "010-1234-5678",
    }));

    expect(response.status).toBe(200);
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(options.body));
    expect(payload).toMatchObject({
      from: "Arca <contact@example.com>",
      to: ["operator@example.com"],
      reply_to: "member@example.com",
      subject: "[아르카 문의] 회원 관련 문의",
    });
    expect(payload.text).toContain("답변받을 연락처: 010-1234-5678");
    expect(payload.html).toBeUndefined();
  });

  it("does not expose a mail provider failure", async () => {
    mockedServerSupabase.mockResolvedValue(guestClient() as never);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(request({
      requestId: REQUEST_ID,
      category: "suggestion",
      message: "화면을 개선해 주세요.",
    }));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "접수 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.",
    });
  });

  it("uses an optional email address before the account email", async () => {
    mockedServerSupabase.mockResolvedValue(authenticatedClient() as never);
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
