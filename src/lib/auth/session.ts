"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { clearLocalEntitlements } from "@/lib/entitlements";
import { clearLocalJournal } from "@/lib/journal";
import { clearLocalStore } from "@/lib/store";
import { flushPendingSync } from "@/lib/sync/pusher";
import { resetSyncStatus } from "@/lib/sync/status";
import { notifyLocal, subscribeLocal } from "@/lib/local-events";

export type SessionUser = Pick<User, "id" | "email" | "app_metadata">;

const DEV_SESSION_KEY = "arcana.dev.session";
export const isLocalAuthDev = process.env.NODE_ENV !== "production";
const DEV_USER: SessionUser = {
  id: "arca-local-dev-user",
  email: "local-dev@arca.test",
  app_metadata: { provider: "development" },
};

function hasDevSession(): boolean {
  if (!isLocalAuthDev || typeof window === "undefined") return false;
  return window.localStorage.getItem(DEV_SESSION_KEY) === "true";
}

/** 로컬 개발 전용 로그인 상태. 실제 Supabase 세션·동기화에는 관여하지 않는다. */
export function setDevSession(enabled: boolean): void {
  if (!isLocalAuthDev || typeof window === "undefined") return;
  try {
    if (enabled) window.localStorage.setItem(DEV_SESSION_KEY, "true");
    else window.localStorage.removeItem(DEV_SESSION_KEY);
  } catch {
    // storage가 막혀도 실제 로그인 흐름은 영향을 받지 않는다.
  }
  notifyLocal("auth");
}

export type AuthState = {
  user: SessionUser | null;
  /** 세션 조회 중. 미설정이면 즉시 false. */
  loading: boolean;
  /** Supabase env가 설정돼 로그인이 가능한지. */
  configured: boolean;
  /** 로컬 개발 모드의 가상 로그인 여부. */
  devSession: boolean;
};

/** 현재 세션 사용자. 미설정이면 항상 게스트(user=null). */
export function useSession(): AuthState {
  const [remoteUser, setRemoteUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [devSession, setDevSessionState] = useState(false);

  useEffect(() => {
    if (!isLocalAuthDev) return;
    const refresh = () => setDevSessionState(hasDevSession());
    refresh();
    return subscribeLocal("auth", refresh);
  }, []);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setRemoteUser(data.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setRemoteUser(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    user: devSession ? DEV_USER : remoteUser,
    loading: devSession ? false : loading,
    configured: isSupabaseConfigured,
    devSession,
  };
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

export async function signOut(): Promise<boolean> {
  const supabase = getBrowserSupabase();
  if (!supabase) return false;
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[auth] 로그아웃 실패:", error);
    return false;
  }
  return true;
}

/**
 * 로그아웃: 대기 중 push를 먼저 올리고, 이 기기의 기록을 지운 뒤 세션을 끊는다.
 *
 * flush가 실패하거나 늦어도 로그아웃은 완주한다. 네트워크가 없다고 계정에
 * 갇히면 안 되고, 유실 범위는 마지막 성공 push 이후의 델타로 한정된다.
 * 로컬을 비우는 이유는 공용 기기에서 남의 기록이 보이거나 다음 계정에
 * 섞이는 것을 막기 위해서다.
 */
export async function signOutAndClear(): Promise<boolean> {
  if (hasDevSession()) {
    setDevSession(false);
    clearLocalStore();
    clearLocalJournal();
    clearLocalEntitlements();
    resetSyncStatus();
    return true;
  }
  try {
    await flushPendingSync();
  } catch (e) {
    console.error("[sync] 로그아웃 전 flush 실패:", e);
  }

  const signedOut = await signOut();
  if (!signedOut) return false;

  clearLocalStore();
  clearLocalJournal();
  clearLocalEntitlements();
  resetSyncStatus(); // 다음 계정에 이전 사용자의 마지막 동기화 시각이 보이면 안 된다.
  return true;
}
