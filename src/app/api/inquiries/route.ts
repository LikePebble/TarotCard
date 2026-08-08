import { NextResponse } from "next/server";
import { operator } from "@/data/legal/operator";
import {
  inquiryCategoryLabel,
  inquiryEmailText,
  inquiryReplyTo,
  validateInquiry,
} from "@/lib/inquiry";
import { getServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const { data } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };
  const user = data.user;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "문의 내용을 확인해 주세요." }, { status: 400 });
  }

  const validation = validateInquiry(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM_EMAIL;
  const to = process.env.INQUIRY_RECIPIENT_EMAIL ?? operator.contactEmail;
  if (!apiKey || !from) {
    return NextResponse.json({ error: "문의 접수 기능을 준비하고 있습니다." }, { status: 503 });
  }

  const inquiry = validation.value;
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `arca-inquiry-${inquiry.requestId}`,
        "User-Agent": "arca-inquiry/1.0",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: inquiryReplyTo(inquiry, user?.email),
        subject: `[아르카 문의] ${inquiryCategoryLabel(inquiry.category)}`,
        text: inquiryEmailText(
          inquiry,
          user ? { id: user.id, email: user.email ?? null } : null,
          new Date(),
        ),
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "접수 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const error: { name?: unknown; message?: unknown } = await response
      .json()
      .then((value: unknown) =>
        value && typeof value === "object"
          ? (value as { name?: unknown; message?: unknown })
          : {},
      )
      .catch(() => ({}));
    const errorName = typeof error.name === "string" ? error.name : "unknown";
    const errorMessage = typeof error.message === "string" ? error.message : "unknown";
    console.error(
      `[inquiry] 메일 발송 실패: ${response.status} ${errorName} ${errorMessage}`,
    );
    return NextResponse.json(
      { error: "접수 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
