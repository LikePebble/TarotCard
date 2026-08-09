"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { CheckCircle, CircleNotch, X } from "@phosphor-icons/react";
import {
  INQUIRY_CONTACT_MAX_LENGTH,
  INQUIRY_MAX_LENGTH,
  INQUIRY_MIN_LENGTH,
  inquiryCategories,
  validateInquiry,
  type InquiryCategory,
} from "@/lib/inquiry";
import { useSession } from "@/lib/auth/session";
import { useModalBehavior } from "@/lib/use-modal-behavior";
import { useLocale } from "@/components/LocaleProvider";

type SubmitState = "idle" | "submitting" | "success";

const INQUIRY_CATEGORY_LABEL_EN: Record<InquiryCategory, string> = {
  suggestion: "Suggestions and improvements",
  account: "Account question",
  other: "Other question",
};

function inquiryErrorForLocale(error: string, english: boolean): string {
  if (!english) return error;
  if (error.includes(`${INQUIRY_MAX_LENGTH}자까지`)) {
    return `Your message can be up to ${INQUIRY_MAX_LENGTH.toLocaleString("en-US")} characters.`;
  }
  if (error.includes(`${INQUIRY_CONTACT_MAX_LENGTH}자까지`)) {
    return `Your contact information can be up to ${INQUIRY_CONTACT_MAX_LENGTH.toLocaleString("en-US")} characters.`;
  }
  if (error.includes("자 이상")) {
    return `Please enter at least ${INQUIRY_MIN_LENGTH} characters.`;
  }
  if (error.includes("문의 유형")) return "Please choose a category.";
  if (error.includes("연락처")) return "Please check your contact information.";
  return "Please check your message and try again.";
}

export function InquiryModal({ onClose }: { onClose: () => void }) {
  const english = useLocale() === "en";
  const { user, loading } = useSession();
  const requestIdRef = useRef<string | null>(null);
  const { dialogRef, initialFocusRef } = useModalBehavior({ onClose });
  const [category, setCategory] = useState<InquiryCategory>("suggestion");
  const [message, setMessage] = useState("");
  const [responseContact, setResponseContact] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    requestIdRef.current ??= crypto.randomUUID();
    const validation = validateInquiry({
      requestId: requestIdRef.current,
      category,
      message,
      responseContact,
    });
    if (!validation.ok) {
      setError(inquiryErrorForLocale(validation.error, english));
      return;
    }

    setSubmitState("submitting");
    setError(null);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.value),
      });
      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!response.ok) {
        setError(
          english
            ? "We couldn't submit your inquiry. Please try again shortly."
            : result?.error ?? "접수 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.",
        );
        setSubmitState("idle");
        return;
      }
      setSubmitState("success");
    } catch {
      setError(
        english
          ? "Please check your network connection and try again."
          : "네트워크 연결을 확인하고 다시 시도해 주세요.",
      );
      setSubmitState("idle");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 lg:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-modal-title"
        aria-describedby="inquiry-modal-description"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl border border-line bg-ink-1 lg:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ink-1 px-5 py-3.5">
          <h2 id="inquiry-modal-title" className="font-display text-[18px] font-semibold">
            {english ? "Contact and feedback" : "문의 및 개선 제안"}
          </h2>
          <button
            ref={initialFocusRef}
            type="button"
            onClick={onClose}
            aria-label={english ? "Close inquiry form" : "문의 창 닫기"}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted transition-colors hover:text-cream focus-visible:ring-2 focus-visible:ring-gold-soft"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="p-5 lg:p-6">
          {loading ? (
            <div className="flex min-h-40 items-center justify-center" role="status">
              <CircleNotch size={24} className="animate-spin text-gold-soft" aria-hidden />
              <span className="sr-only">{english ? "Checking sign-in status" : "로그인 정보를 확인하는 중"}</span>
            </div>
          ) : submitState === "success" ? (
            <div className="py-5 text-center" role="status">
              <CheckCircle size={42} className="mx-auto text-gold-soft" aria-hidden />
              <p className="mt-4 font-display text-[20px] font-semibold">
                {english ? "Your inquiry has been submitted" : "접수가 완료됐습니다"}
              </p>
              <p id="inquiry-modal-description" className="mt-2 text-[13.5px] leading-relaxed text-muted">
                {user
                  ? english
                    ? "We'll reply using the contact information you provided or your account email."
                    : "남겨 주신 연락처 또는 로그인 계정 이메일로 답변드리겠습니다."
                  : responseContact
                    ? english
                      ? "We'll reply using the contact information you provided."
                      : "남겨 주신 연락처로 답변드리겠습니다."
                    : english
                      ? "Your feedback has been received."
                      : "남겨 주신 의견이 정상적으로 접수되었습니다."}
              </p>
              <button type="button" onClick={onClose} className="btn btn-gold mt-6 min-h-11 px-7">
                {english ? "Done" : "확인"}
              </button>
            </div>
          ) : (
            <form onSubmit={(event) => void submit(event)} noValidate>
              <p id="inquiry-modal-description" className="text-[13.5px] leading-relaxed text-muted">
                {english
                  ? "Share your ideas for improving Arca or ask us about the service."
                  : "더 나은 아르카를 위한 의견과 이용 중 궁금한 점을 남겨 주세요."}
              </p>

              <label htmlFor="inquiry-category" className="mt-5 block text-[13px] font-semibold text-body">
                {english ? "Category" : "말머리"}
              </label>
              <select
                id="inquiry-category"
                value={category}
                onChange={(event) => setCategory(event.target.value as InquiryCategory)}
                disabled={submitState === "submitting"}
                className="mt-2 min-h-11 w-full rounded-xl border border-line bg-ink-2 px-3.5 text-[16px] text-cream outline-none transition-colors focus:border-line-gold focus:ring-2 focus:ring-gold-soft/30 disabled:opacity-60 lg:text-[14px]"
              >
                {inquiryCategories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {english ? INQUIRY_CATEGORY_LABEL_EN[item.value] : item.label}
                  </option>
                ))}
              </select>

              <label htmlFor="inquiry-message" className="mt-5 block text-[13px] font-semibold text-body">
                {english ? "Message" : "문의 내용"}
              </label>
              <textarea
                id="inquiry-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={INQUIRY_MAX_LENGTH}
                rows={6}
                disabled={submitState === "submitting"}
                placeholder={english ? "Tell us what happened or what you would like to see." : "불편했던 점이나 바라는 점을 자세히 알려 주세요."}
                className="mt-2 w-full resize-y rounded-xl border border-line bg-ink-2 px-3.5 py-3 text-[16px] leading-relaxed text-cream outline-none transition-colors placeholder:text-muted/70 focus:border-line-gold focus:ring-2 focus:ring-gold-soft/30 disabled:opacity-60 lg:text-[14px]"
              />
              <p className="mt-1 text-right text-[11.5px] text-muted">
                {message.length.toLocaleString()} / {INQUIRY_MAX_LENGTH.toLocaleString()}
              </p>

              <label htmlFor="inquiry-contact" className="mt-4 block text-[13px] font-semibold text-body">
                {english ? "Contact information or email" : "답변받을 연락처 또는 이메일"}{" "}
                <span className="font-normal text-muted">{english ? "(optional)" : "(선택)"}</span>
              </label>
              <input
                id="inquiry-contact"
                type="text"
                value={responseContact}
                onChange={(event) => setResponseContact(event.target.value)}
                maxLength={INQUIRY_CONTACT_MAX_LENGTH}
                disabled={submitState === "submitting"}
                autoComplete="email"
                placeholder={english ? "Phone number or email" : "휴대전화 번호 또는 이메일"}
                className="mt-2 min-h-11 w-full rounded-xl border border-line bg-ink-2 px-3.5 text-[16px] text-cream outline-none transition-colors placeholder:text-muted/70 focus:border-line-gold focus:ring-2 focus:ring-gold-soft/30 disabled:opacity-60 lg:text-[14px]"
              />
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
                {user
                  ? english
                    ? "Leave this blank to receive a reply at your account email."
                    : "비워 두면 로그인 계정 이메일로 답변드립니다."
                  : english
                    ? "Leave this blank to submit feedback without a reply."
                    : "비워 두면 답변 없이 의견만 접수됩니다."}
              </p>

              {error ? (
                <p className="mt-4 text-[12.5px] text-gold-soft" role="alert">
                  {error}
                </p>
              ) : null}

              <p className="mt-4 text-[11.5px] leading-relaxed text-muted">
                {english
                  ? "Submission details are used only to handle and reply to your inquiry. See our "
                  : "접수 정보는 문의 처리와 답변에만 사용됩니다. 자세한 내용은 "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-cream">
                  {english ? "Privacy Policy" : "개인정보처리방침"}
                </Link>
                {english ? " for details." : "에서 확인할 수 있습니다."}
              </p>

              <button
                type="submit"
                disabled={submitState === "submitting"}
                className="btn btn-gold mt-5 flex min-h-11 w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitState === "submitting" ? (
                  <CircleNotch size={17} className="animate-spin" aria-hidden />
                ) : null}
                {submitState === "submitting"
                  ? english ? "Submitting…" : "접수 중…"
                  : english ? "Submit inquiry" : "문의 접수하기"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
