export const inquiryCategories = [
  { value: "suggestion", label: "제안 및 개선 사항" },
  { value: "account", label: "회원 관련 문의" },
  { value: "other", label: "기타 문의" },
] as const;

export type InquiryCategory = (typeof inquiryCategories)[number]["value"];

export const INQUIRY_MIN_LENGTH = 10;
export const INQUIRY_MAX_LENGTH = 2000;
export const INQUIRY_CONTACT_MAX_LENGTH = 200;

export type InquiryInput = {
  requestId: string;
  category: InquiryCategory;
  message: string;
  responseContact?: string;
};

export type InquiryValidation =
  | { ok: true; value: InquiryInput }
  | { ok: false; error: string };

export function inquiryCategoryLabel(category: InquiryCategory): string {
  return inquiryCategories.find((item) => item.value === category)?.label ?? "기타 문의";
}

export function validateInquiry(input: unknown): InquiryValidation {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "문의 내용을 확인해 주세요." };
  }

  const category = (input as { category?: unknown }).category;
  const message = (input as { message?: unknown }).message;
  const responseContact = (input as { responseContact?: unknown }).responseContact;
  const requestId = (input as { requestId?: unknown }).requestId;
  const isCategory = inquiryCategories.some((item) => item.value === category);

  if (
    typeof requestId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)
  ) {
    return { ok: false, error: "문의 요청 정보를 확인해 주세요." };
  }

  if (!isCategory) {
    return { ok: false, error: "문의 유형을 선택해 주세요." };
  }
  if (typeof message !== "string") {
    return { ok: false, error: "문의 내용을 입력해 주세요." };
  }

  const trimmed = message.trim();
  if (trimmed.length < INQUIRY_MIN_LENGTH) {
    return { ok: false, error: `문의 내용을 ${INQUIRY_MIN_LENGTH}자 이상 입력해 주세요.` };
  }
  if (trimmed.length > INQUIRY_MAX_LENGTH) {
    return { ok: false, error: `문의 내용은 ${INQUIRY_MAX_LENGTH}자까지 입력할 수 있습니다.` };
  }
  if (responseContact !== undefined && typeof responseContact !== "string") {
    return { ok: false, error: "답변받을 연락처를 확인해 주세요." };
  }

  const trimmedContact = responseContact?.trim();
  if (trimmedContact && trimmedContact.length > INQUIRY_CONTACT_MAX_LENGTH) {
    return {
      ok: false,
      error: `답변받을 연락처는 ${INQUIRY_CONTACT_MAX_LENGTH}자까지 입력할 수 있습니다.`,
    };
  }

  return {
    ok: true,
    value: {
      requestId,
      category: category as InquiryCategory,
      message: trimmed,
      ...(trimmedContact ? { responseContact: trimmedContact } : {}),
    },
  };
}

export function inquiryEmailText(
  inquiry: InquiryInput,
  user: { id: string; email: string },
  submittedAt: Date,
): string {
  return [
    `말머리: ${inquiryCategoryLabel(inquiry.category)}`,
    `접수 시각: ${submittedAt.toISOString()}`,
    `회원 이메일: ${user.email}`,
    `회원 ID: ${user.id}`,
    `답변받을 연락처: ${inquiry.responseContact ?? "로그인 계정 이메일"}`,
    "",
    inquiry.message,
  ].join("\n");
}

export function inquiryReplyTo(inquiry: InquiryInput, accountEmail: string): string {
  const contact = inquiry.responseContact;
  if (contact && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) return contact;
  return accountEmail;
}
