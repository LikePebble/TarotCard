"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { CheckCircle, CircleNotch, X } from "@phosphor-icons/react";
import {
  INQUIRY_CONTACT_MAX_LENGTH,
  INQUIRY_MAX_LENGTH,
  inquiryCategories,
  validateInquiry,
  type InquiryCategory,
} from "@/lib/inquiry";
import { useSession } from "@/lib/auth/session";
import { useModalBehavior } from "@/lib/use-modal-behavior";

type SubmitState = "idle" | "submitting" | "success";

export function InquiryModal({ onClose }: { onClose: () => void }) {
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
      setError(validation.error);
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
        setError(result?.error ?? "접수 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.");
        setSubmitState("idle");
        return;
      }
      setSubmitState("success");
    } catch {
      setError("네트워크 연결을 확인하고 다시 시도해 주세요.");
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
            문의 및 개선 제안
          </h2>
          <button
            ref={initialFocusRef}
            type="button"
            onClick={onClose}
            aria-label="문의 창 닫기"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted transition-colors hover:text-cream focus-visible:ring-2 focus-visible:ring-gold-soft"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="p-5 lg:p-6">
          {loading ? (
            <div className="flex min-h-40 items-center justify-center" role="status">
              <CircleNotch size={24} className="animate-spin text-gold-soft" aria-hidden />
              <span className="sr-only">로그인 정보를 확인하는 중</span>
            </div>
          ) : !user ? (
            <div className="py-5 text-center">
              <p id="inquiry-modal-description" className="text-[14px] leading-relaxed text-body">
                문의 처리와 답변을 위해 로그인이 필요합니다.
              </p>
              <Link href="/login?next=/my" className="btn btn-gold mt-5 min-h-11 px-6">
                로그인하고 문의하기
              </Link>
            </div>
          ) : submitState === "success" ? (
            <div className="py-5 text-center" role="status">
              <CheckCircle size={42} className="mx-auto text-gold-soft" aria-hidden />
              <p className="mt-4 font-display text-[20px] font-semibold">접수가 완료됐습니다</p>
              <p id="inquiry-modal-description" className="mt-2 text-[13.5px] leading-relaxed text-muted">
                남겨 주신 연락처 또는 로그인 계정 이메일로 답변드리겠습니다.
              </p>
              <button type="button" onClick={onClose} className="btn btn-gold mt-6 min-h-11 px-7">
                확인
              </button>
            </div>
          ) : (
            <form onSubmit={(event) => void submit(event)} noValidate>
              <p id="inquiry-modal-description" className="text-[13.5px] leading-relaxed text-muted">
                더 나은 아르카를 위한 의견과 이용 중 궁금한 점을 남겨 주세요.
              </p>

              <label htmlFor="inquiry-category" className="mt-5 block text-[13px] font-semibold text-body">
                말머리
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
                    {item.label}
                  </option>
                ))}
              </select>

              <label htmlFor="inquiry-message" className="mt-5 block text-[13px] font-semibold text-body">
                문의 내용
              </label>
              <textarea
                id="inquiry-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={INQUIRY_MAX_LENGTH}
                rows={6}
                disabled={submitState === "submitting"}
                placeholder="불편했던 점이나 바라는 점을 자세히 알려 주세요."
                className="mt-2 w-full resize-y rounded-xl border border-line bg-ink-2 px-3.5 py-3 text-[16px] leading-relaxed text-cream outline-none transition-colors placeholder:text-muted/70 focus:border-line-gold focus:ring-2 focus:ring-gold-soft/30 disabled:opacity-60 lg:text-[14px]"
              />
              <p className="mt-1 text-right text-[11.5px] text-muted">
                {message.length.toLocaleString()} / {INQUIRY_MAX_LENGTH.toLocaleString()}
              </p>

              <label htmlFor="inquiry-contact" className="mt-4 block text-[13px] font-semibold text-body">
                답변받을 연락처 또는 이메일 <span className="font-normal text-muted">(선택)</span>
              </label>
              <input
                id="inquiry-contact"
                type="text"
                value={responseContact}
                onChange={(event) => setResponseContact(event.target.value)}
                maxLength={INQUIRY_CONTACT_MAX_LENGTH}
                disabled={submitState === "submitting"}
                autoComplete="email"
                placeholder="휴대전화 번호 또는 이메일"
                className="mt-2 min-h-11 w-full rounded-xl border border-line bg-ink-2 px-3.5 text-[16px] text-cream outline-none transition-colors placeholder:text-muted/70 focus:border-line-gold focus:ring-2 focus:ring-gold-soft/30 disabled:opacity-60 lg:text-[14px]"
              />
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
                비워 두면 로그인 계정 이메일로 답변드립니다.
              </p>

              {error ? (
                <p className="mt-4 text-[12.5px] text-gold-soft" role="alert">
                  {error}
                </p>
              ) : null}

              <p className="mt-4 text-[11.5px] leading-relaxed text-muted">
                접수 정보는 문의 처리와 답변에만 사용됩니다. 자세한 내용은{" "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-cream">
                  개인정보처리방침
                </Link>
                에서 확인할 수 있습니다.
              </p>

              <button
                type="submit"
                disabled={submitState === "submitting"}
                className="btn btn-gold mt-5 flex min-h-11 w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitState === "submitting" ? (
                  <CircleNotch size={17} className="animate-spin" aria-hidden />
                ) : null}
                {submitState === "submitting" ? "접수 중…" : "문의 접수하기"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
