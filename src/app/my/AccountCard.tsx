"use client";

import { useEffect, useRef } from "react";
import { UserCircle } from "@phosphor-icons/react";
import {
  signInWithProvider,
  signOut,
  useSession,
} from "@/lib/auth/session";
import { syncOnLogin } from "@/lib/sync/sync";

const card =
  "rounded-2xl border border-line bg-ink-1 p-5 lg:rounded-[14px] lg:p-6";

export function AccountCard() {
  const { user, loading, configured } = useSession();
  const syncedFor = useRef<string | null>(null);

  // 로그인되면 한 번 게스트→계정 병합을 실행한다.
  useEffect(() => {
    if (!user) {
      syncedFor.current = null;
      return;
    }
    if (syncedFor.current !== user.id) {
      syncedFor.current = user.id;
      void syncOnLogin(user.id);
    }
  }, [user]);

  // Supabase 미설정 → 준비 중(현행 게스트 모드).
  if (!configured) {
    return (
      <div className={`${card} opacity-60`}>
        <span className="flex items-center gap-3.5">
          <UserCircle size={22} className="text-muted" aria-hidden />
          <span>
            <span className="block font-serif text-[17px] font-semibold lg:text-[19px]">
              로그인 · 계정
            </span>
            <span className="text-[13px] text-muted lg:text-[14px]">
              기기 간 보관 · 카카오/구글 로그인 · 준비 중
            </span>
          </span>
        </span>
      </div>
    );
  }

  if (loading) {
    return <div className={`${card} min-h-[68px]`} aria-hidden />;
  }

  if (user) {
    return (
      <div className={card}>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-3.5">
            <UserCircle size={22} className="text-gold-soft" aria-hidden />
            <span>
              <span className="block font-serif text-[16px] font-semibold lg:text-[18px]">
                로그인됨
              </span>
              <span className="text-[13px] text-muted lg:text-[14px]">
                {user.email ?? user.id}
              </span>
            </span>
          </span>
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-[13px] text-muted underline underline-offset-4 hover:text-cream"
          >
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={card}>
      <span className="flex items-center gap-3.5">
        <UserCircle size={22} className="text-gold-soft" aria-hidden />
        <span>
          <span className="block font-serif text-[17px] font-semibold lg:text-[19px]">
            로그인
          </span>
          <span className="text-[13px] text-muted lg:text-[14px]">
            기록을 기기 간에 안전하게 보관합니다.
          </span>
        </span>
      </span>
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
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
    </div>
  );
}
