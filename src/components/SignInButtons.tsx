"use client";

import { signInWithProvider } from "@/lib/auth/session";

/** 카카오/구글 로그인 버튼 한 쌍. AccountCard와 /login이 공유한다. */
export function SignInButtons() {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row">
      <button
        type="button"
        onClick={() => void signInWithProvider("kakao")}
        className="btn btn-gold flex-1"
      >
        카카오로 시작
      </button>
      <button
        type="button"
        onClick={() => void signInWithProvider("google")}
        className="btn btn-ghost flex-1"
      >
        구글로 시작
      </button>
    </div>
  );
}
