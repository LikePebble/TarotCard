"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { clearLocalEntitlements } from "@/lib/entitlements";
import { clearLocalJournal } from "@/lib/journal";
import { clearLocalStore } from "@/lib/store";
import { flushPendingSync } from "@/lib/sync/pusher";
import { resetSyncStatus } from "@/lib/sync/status";

export type AuthState = {
  user: User | null;
  /** 세션 조회 중. 미설정이면 즉시 false. */
  loading: boolean;
  /** Supabase env가 설정돼 로그인이 가능한지. */
  configured: boolean;
};

/** 현재 세션 사용자. 미설정이면 항상 게스트(user=null). */
export function useSession(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading, configured: isSupabaseConfigured };
}

/** 카카오/구글 OAuth 로그인 시작. 미설정이면 no-op. */
export async function signInWithProvider(
  provider: "google" | "kakao",
): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase) return;
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * 로그아웃: 대기 중 push를 먼저 올리고, 이 기기의 기록을 지운 뒤 세션을 끊는다.
 *
 * flush가 실패하거나 늦어도 로그아웃은 완주한다. 네트워크가 없다고 계정에
 * 갇히면 안 되고, 유실 범위는 마지막 성공 push 이후의 델타로 한정된다.
 * 로컬을 비우는 이유는 공용 기기에서 남의 기록이 보이거나 다음 계정에
 * 섞이는 것을 막기 위해서다.
 */
export async function signOutAndClear(): Promise<void> {
  try {
    await flushPendingSync();
  } catch (e) {
    console.error("[sync] 로그아웃 전 flush 실패:", e);
  }
  clearLocalStore();
  clearLocalJournal();
  clearLocalEntitlements();
  resetSyncStatus(); // 다음 계정에 이전 사용자의 마지막 동기화 시각이 보이면 안 된다.
  await signOut();
}
