import { NextResponse } from "next/server";
import { operator } from "@/data/legal/operator";
import {
  inquiryCategoryLabel,
  inquiryEmailText,
  inquiryReplyTo,
  validateInquiry,
} from "@/lib/inquiry";
import { getServerSupabase, getServiceSupabase } from "@/lib/supabase/server";

type InquiryRow = {
  request_id: string;
  status: "pending" | "sent" | "failed";
};

async function updateDelivery(
  requestId: string,
  status: "sent" | "failed",
  providerId?: string,
): Promise<void> {
  const service = getServiceSupabase();
  if (!service) {
    console.error("[inquiry] service role 설정이 없어 발송 상태를 기록하지 못했습니다.");
    return;
  }
  const { error } = await service
    .from("inquiries")
    .update({
      status,
      provider_id: providerId ?? null,
      sent_at: status === "sent" ? new Date().toISOString() : null,
    })
    .eq("request_id", requestId);
  if (error) console.error(`[inquiry] 발송 상태 저장 실패: ${error.message}`);
}

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "로그인 설정을 확인해 주세요." }, { status: 503 });
  }

  const { data, error: authError } = await supabase.auth.getUser();
  const user = data.user;
  if (authError || !user) {
    return NextResponse.json({ error: "로그인 후 문의를 접수해 주세요." }, { status: 401 });
  }
  if (!user.email) {
    return NextResponse.json({ error: "로그인 계정의 이메일을 확인할 수 없습니다." }, { status: 422 });
  }

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
  if (!apiKey || !from || !getServiceSupabase()) {
    return NextResponse.json({ error: "문의 접수 기능을 준비하고 있습니다." }, { status: 503 });
  }

  const inquiry = validation.value;
  const { data: created, error: createError } = await supabase
    .rpc("create_inquiry", {
      p_request_id: inquiry.requestId,
      p_category: inquiry.category,
      p_message: inquiry.message,
      p_response_contact: inquiry.responseContact ?? "",
      p_account_email: user.email,
    })
    .single();
  if (createError) {
    if (createError.message.includes("inquiry_rate_limited")) {
      return NextResponse.json(
        { error: "문의는 1분에 한 번 접수할 수 있습니다." },
        { status: 429 },
      );
    }
    console.error(`[inquiry] 접수 저장 실패: ${createError.message}`);
    return NextResponse.json({ error: "접수 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }
  const row = created as InquiryRow | null;
  if (row?.status === "sent") return NextResponse.json({ ok: true });

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `arca-inquiry-${inquiry.requestId}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: inquiryReplyTo(inquiry, user.email),
        subject: `[아르카 문의] ${inquiryCategoryLabel(inquiry.category)}`,
        text: inquiryEmailText(
          inquiry,
          { id: user.id, email: user.email },
          new Date(),
        ),
      }),
    });
  } catch {
    await updateDelivery(inquiry.requestId, "failed");
    return NextResponse.json(
      { error: "접수 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }

  if (!response.ok) {
    console.error(`[inquiry] 메일 발송 실패: ${response.status}`);
    await updateDelivery(inquiry.requestId, "failed");
    return NextResponse.json({ error: "접수 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }

  const payload = (await response.json().catch(() => null)) as { id?: string } | null;
  await updateDelivery(inquiry.requestId, "sent", payload?.id);

  return NextResponse.json({ ok: true });
}
