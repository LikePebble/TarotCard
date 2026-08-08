import { describe, expect, it } from "vitest";
import {
  inquiryEmailText,
  inquiryReplyTo,
  validateInquiry,
} from "@/lib/inquiry";

const requestId = "11111111-1111-4111-8111-111111111111";

describe("validateInquiry", () => {
  it("accepts and trims a valid inquiry", () => {
    expect(
      validateInquiry({ requestId, category: "suggestion", message: "  카드 설명을 개선해 주세요.  " }),
    ).toEqual({
      ok: true,
      value: { requestId, category: "suggestion", message: "카드 설명을 개선해 주세요." },
    });
  });

  it("keeps an optional response contact", () => {
    expect(
      validateInquiry({
        category: "other",
        requestId,
        message: "답변받을 연락처를 함께 보냅니다.",
        responseContact: " 010-1234-5678 ",
      }),
    ).toEqual({
      ok: true,
      value: {
        category: "other",
        requestId,
        message: "답변받을 연락처를 함께 보냅니다.",
        responseContact: "010-1234-5678",
      },
    });
  });

  it("rejects an unknown category", () => {
    expect(validateInquiry({ requestId, category: "billing", message: "문의 내용이 충분합니다." })).toEqual({
      ok: false,
      error: "문의 유형을 선택해 주세요.",
    });
  });

  it("rejects a short message after trimming", () => {
    expect(validateInquiry({ requestId, category: "other", message: "  짧아요  " })).toEqual({
      ok: false,
      error: "문의 내용을 10자 이상 입력해 주세요.",
    });
  });
});

describe("inquiryReplyTo", () => {
  it("uses an optional email address as the reply target", () => {
    expect(
      inquiryReplyTo(
        { requestId, category: "other", message: "문의 내용이 충분합니다.", responseContact: "reply@example.com" },
        "member@example.com",
      ),
    ).toBe("reply@example.com");
  });

  it("keeps the account email when the optional contact is a phone number", () => {
    expect(
      inquiryReplyTo(
        { requestId, category: "other", message: "문의 내용이 충분합니다.", responseContact: "010-1234-5678" },
        "member@example.com",
      ),
    ).toBe("member@example.com");
  });

  it("omits the reply target for a guest without an email contact", () => {
    expect(
      inquiryReplyTo(
        { requestId, category: "suggestion", message: "문의 내용이 충분합니다." },
        null,
      ),
    ).toBeUndefined();
  });
});

describe("inquiryEmailText", () => {
  it("includes the category, account and plain-text message", () => {
    const text = inquiryEmailText(
      {
        requestId,
        category: "account",
        message: "로그인 상태를 확인해 주세요.",
        responseContact: "reply@example.com",
      },
      { id: "user-1", email: "member@example.com" },
      new Date("2026-08-08T01:02:03.000Z"),
    );

    expect(text).toContain("말머리: 회원 관련 문의");
    expect(text).toContain("회원 이메일: member@example.com");
    expect(text).toContain("회원 ID: user-1");
    expect(text).toContain("답변받을 연락처: reply@example.com");
    expect(text).toContain("로그인 상태를 확인해 주세요.");
  });

  it("marks a guest inquiry without inventing account information", () => {
    const text = inquiryEmailText(
      { requestId, category: "suggestion", message: "비회원 개선 의견입니다." },
      null,
      new Date("2026-08-08T01:02:03.000Z"),
    );

    expect(text).toContain("접수 유형: 비회원");
    expect(text).toContain("회원 이메일: 없음");
    expect(text).toContain("회원 ID: 없음");
    expect(text).toContain("답변받을 연락처: 입력 없음");
  });
});
