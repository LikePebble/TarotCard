"use client";

import Link from "next/link";
import { useState } from "react";
import { CircleNotch, UserCircle } from "@phosphor-icons/react";
import { signOutAndClear, useSession } from "@/lib/auth/session";
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

function accountProviderLabel(provider: unknown): string {
  if (provider === "google") return "Google 계정";
  if (provider === "kakao") return "카카오 계정";
  return "소셜 계정";
}

export function AccountCard() {
  const { user, loading, configured } = useSession();
  const { state, lastSyncedAt } = useSyncStatus();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className={`${card} min-h-[92px]`} role="status">
        <span className="sr-only">계정 정보를 불러오는 중</span>
      </div>
    );
  }

  if (user) {
    const providerLabel = accountProviderLabel(user.app_metadata.provider);

    const handleSignOut = async () => {
      setSigningOut(true);
      setLogoutError(null);
      const success = await signOutAndClear();
      if (!success) {
        setLogoutError(
          "로그아웃하지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.",
        );
        setSigningOut(false);
      }
    };

    return (
      <div className={card}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex min-w-0 items-center gap-3.5">
            <UserCircle size={22} className="text-gold-soft" aria-hidden />
            <span className="min-w-0">
              <span className="block font-display text-[16px] font-semibold lg:text-[18px]">
                계정 정보
              </span>
              <span className="block truncate text-[13px] text-body lg:text-[14px]">
                {user.email ?? "이메일 정보 없음"}
              </span>
              <span className="block text-[12px] text-muted lg:text-[13px]">
                {providerLabel}
              </span>
              <span className="block text-[12px] text-muted lg:text-[13px]">
                {syncLine(state, lastSyncedAt)}
              </span>
            </span>
          </span>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-line px-4 text-[13px] text-muted transition-colors hover:border-line-gold hover:text-cream disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? (
              <CircleNotch size={16} className="animate-spin" aria-hidden />
            ) : null}
            {signingOut ? "로그아웃 중…" : "로그아웃"}
          </button>
        </div>
        {logoutError ? (
          <p className="mt-3 text-[12.5px] text-gold-soft" role="alert">
            {logoutError}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={card}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-3.5">
          <UserCircle size={22} className="text-gold-soft" aria-hidden />
          <span>
            <span className="block font-display text-[17px] font-semibold lg:text-[19px]">
              계정 연결
            </span>
            <span className="text-[13px] text-muted lg:text-[14px]">
              {configured
                ? "로그인하고 기록을 기기 간에 안전하게 보관하세요."
                : "로그인 설정 상태를 확인할 수 있습니다."}
            </span>
          </span>
        </span>
        <Link
          href="/login"
          className="btn btn-gold min-h-11 shrink-0 px-5 text-center"
        >
          로그인하러 가기
        </Link>
      </div>
    </div>
  );
}
