"use client";

import { UserCircle } from "@phosphor-icons/react";
import {
  signInWithProvider,
  signOutAndClear,
  useSession,
} from "@/lib/auth/session";
import { useSyncStatus, type SyncState } from "@/lib/sync/status";

const card =
  "rounded-2xl border border-line bg-ink-1 p-5 lg:rounded-[14px] lg:p-6";

/** 계정 카드 아래에 한 줄로 붙이는 동기화 상태 문구. */
function syncLine(state: SyncState, lastSyncedAt: string | null): string {
  if (state === "syncing") return "동기화 중…";
  if (state === "error") return "동기화 대기 중 · 연결되면 자동으로 올라갑니다";
  if (lastSyncedAt) {
    const d = new Date(lastSyncedAt);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `마지막 동기화 ${hh}:${mm}`;
  }
  return "기록이 계정에 보관됩니다";
}

export function AccountCard() {
  const { user, loading, configured } = useSession();
  const { state, lastSyncedAt } = useSyncStatus();

  // Supabase 미설정 → 준비 중(현행 게스트 모드).
  if (!configured) {
    return (
      <div className={`${card} opacity-60`}>
        <span className="flex items-center gap-3.5">
          <UserCircle size={22} className="text-muted" aria-hidden />
          <span>
            <span className="block font-display text-[17px] font-semibold lg:text-[19px]">
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
              <span className="block font-display text-[16px] font-semibold lg:text-[18px]">
                로그인됨
              </span>
              <span className="block text-[13px] text-muted lg:text-[14px]">
                {user.email ?? user.id}
              </span>
              <span className="block text-[12px] text-muted lg:text-[13px]">
                {syncLine(state, lastSyncedAt)}
              </span>
            </span>
          </span>
          <button
            type="button"
            onClick={() => void signOutAndClear()}
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
          <span className="block font-display text-[17px] font-semibold lg:text-[19px]">
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
