"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { markLoginPending } from "@/lib/analytics";
import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { clearLocalEntitlements } from "@/lib/entitlements";
import { clearLocalJournal } from "@/lib/journal";
import { clearLocalStore, loadStore } from "@/lib/store";
import { retainDrawUsageOnSignOut } from "@/lib/draw-guard";
import { flushPendingSync } from "@/lib/sync/pusher";
import { forgetMergedDevice } from "@/lib/sync/first-merge";
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
  // 실제 OAuth와 같은 표식을 남긴다 — 로그인 완료 계측이 한 경로만 보게.
  if (enabled) markLoginPending("development");
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

type AuthSnapshot = { user: SessionUser | null; loading: boolean };

/** SSR·수화 시점의 값. 서버는 세션을 모르므로 항상 게스트에서 출발한다. */
function guestSnapshot(): AuthSnapshot {
  return { user: null, loading: isSupabaseConfigured };
}

/*
 * 세션은 모듈 하나가 들고 훅은 구독만 한다.
 *
 * 훅 인스턴스마다 구독과 조회를 따로 내면 한 화면에서 컴포넌트 수만큼
 * Auth 왕복이 생긴다(카드 상세 한 장에 SyncBridge·CollectHistory·
 * CollectedCardNav·MarkCollectionCardSeen 넷이 동시에 붙는다).
 *
 * useSession은 이 스토어의 React 어댑터일 뿐이라, 스토어 쪽이 이 모듈의
 * 시험 가능한 표면이다(이 리포는 React 컴포넌트를 유닛테스트하지 않는다).
 */
let snapshot: AuthSnapshot = guestSnapshot();
const authSubscribers = new Set<() => void>();
let authStarted = false;

/** 지금까지 확정된 세션. 아직 조회 중이면 loading이 true다. */
export function getAuthSnapshot(): AuthSnapshot {
  return snapshot;
}

/** 세션 변경을 구독한다. 반환값을 호출하면 해지된다. */
export function subscribeAuth(fn: () => void): () => void {
  authSubscribers.add(fn);
  return () => {
    authSubscribers.delete(fn);
  };
}

function emitAuth(): void {
  for (const fn of [...authSubscribers]) {
    try {
      fn();
    } catch (e) {
      console.error("[auth] 구독자 오류:", e);
    }
  }
}

/**
 * 새 세션을 반영한다. 사용자가 그대로면 **이전 객체를 그대로 둔다.**
 *
 * Supabase는 구독 즉시 INITIAL_SESSION을 쏘고 토큰 갱신·다른 탭의 로그인마다
 * 이벤트를 또 보낸다. 그때마다 새 객체를 내려보내면 `[user]`에 걸린 effect가
 * 전부 다시 도는데, SyncBridge의 경우 그것이 setSyncUser 재호출이 되어
 * 진행 중인 서버 병합을 스테일로 만든다.
 */
function setSessionUser(next: SessionUser | null): void {
  const sameUser = (next?.id ?? null) === (snapshot.user?.id ?? null);
  const user = sameUser ? snapshot.user : next;
  if (user === snapshot.user && !snapshot.loading) return;
  snapshot = { user, loading: false };
  emitAuth();
}

/** 세션 구독을 한 번만 시작한다. 클라이언트가 싱글턴이라 해지할 이유가 없다. */
export function startAuth(): void {
  if (authStarted) return;
  authStarted = true;
  const supabase = getBrowserSupabase();
  if (!supabase) {
    setSessionUser(null); // 미설정이면 로그인 자체가 없다. 즉시 게스트로 확정.
    return;
  }
  /*
   * getSession()은 로컬 저장소를 읽어 즉시 답하고, getUser()는 매번 Auth
   * 서버를 왕복한다. 여기서 세션은 화면 표시와 "누구 것을 동기화할지"를
   * 고르는 데만 쓰이고 실제 접근 통제는 서버의 RLS가 JWT로 판정하므로,
   * 위조된 로컬 세션은 요청이 거절될 뿐 남의 데이터를 열지 못한다.
   */
  supabase.auth.getSession().then(({ data }) => {
    setSessionUser(data.session?.user ?? null);
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    setSessionUser(session?.user ?? null);
  });
}

/** 현재 세션 사용자. 미설정이면 항상 게스트(user=null). */
export function useSession(): AuthState {
  const [auth, setAuth] = useState<AuthSnapshot>(guestSnapshot);
  const [devSession, setDevSessionState] = useState(false);

  useEffect(() => {
    if (!isLocalAuthDev) return;
    const refresh = () => setDevSessionState(hasDevSession());
    refresh();
    return subscribeLocal("auth", refresh);
  }, []);

  useEffect(() => {
    startAuth();
    const refresh = () => setAuth(getAuthSnapshot());
    refresh(); // 이미 확정된 세션이 있으면 첫 수화 직후 바로 반영한다.
    return subscribeAuth(refresh);
  }, []);

  return {
    user: devSession ? DEV_USER : auth.user,
    loading: devSession ? false : auth.loading,
    configured: isSupabaseConfigured,
    devSession,
  };
}

/** OAuth 완료 뒤 돌아갈 앱 내부 경로만 callback에 싣는다. */
export function oauthCallbackUrl(origin: string, next?: string | null): string {
  const url = new URL("/auth/callback", origin);
  if (next?.startsWith("/") && !next.startsWith("//")) {
    url.searchParams.set("next", next);
  }
  return url.toString();
}

/** 카카오/구글 OAuth 로그인 시작. 미설정이면 no-op. */
export async function signInWithProvider(
  provider: "google" | "kakao",
  next?: string | null,
): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase) return;
  // OAuth는 외부 사이트를 다녀오는 전체 페이지 이동이라, 이 문서에서 완료를
  // 관측할 수 없다(/auth/callback도 서버 라우트라 gtag가 없다). 시도를
  // sessionStorage에 남겨 두고, 돌아온 문서에서 세션이 확정되는 순간
  // SyncBridge가 표식을 회수하며 login_completed를 보낸다.
  markLoginPending(provider);
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: oauthCallbackUrl(window.location.origin, next) },
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

/** 이 기기에 남은 계정 흔적을 모두 지운다. */
function clearDeviceAccountData(): void {
  clearLocalStore();
  clearLocalJournal();
  clearLocalEntitlements();
  forgetMergedDevice(); // 다음 로그인은 다시 진짜 게스트→계정 병합이다(S3a).
  resetSyncStatus(); // 다음 계정에 이전 사용자의 마지막 동기화 시각이 보이면 안 된다.
}

/**
 * 로그아웃: 대기 중 push를 먼저 올리고, 이 기기의 기록을 지운 뒤 세션을 끊는다.
 *
 * flush가 실패하거나 늦어도 로그아웃은 완주한다. 네트워크가 없다고 계정에
 * 갇히면 안 되고, 유실 범위는 마지막 성공 push 이후의 델타로 한정된다.
 * 로컬을 비우는 이유는 공용 기기에서 남의 기록이 보이거나 다음 계정에
 * 섞이는 것을 막기 위해서다.
 *
 * **`signOut()`이 오류를 돌려줘도 로컬은 비운다.** auth-js는 서버 revoke가
 * 네트워크 오류·5xx로 실패해도 로컬 세션을 지우고 `SIGNED_OUT`을 방출한 뒤
 * 오류를 반환한다(`GoTrueClient._signOut`). 그때 로컬을 남겨 두면 화면은
 * 게스트인데 이전 사용자의 리딩·일기가 그대로 남고, 다음 계정이 로그인하면
 * 로그인 병합이 **그것을 자기 계정으로 올려 버린다.** S5가 막으려던 바로 그
 * 사고다. 반대 방향(불필요하게 비움)은 서버 사본에서 되돌아오므로 복구된다.
 *
 * 반환값은 "서버 revoke까지 성공했는가"이지 "이 기기가 정리됐는가"가 아니다.
 * 정리는 항상 된다.
 */
export async function signOutAndClear(): Promise<boolean> {
  if (hasDevSession()) {
    setDevSession(false);
    retainDrawUsageOnSignOut(loadStore().readings);
    clearDeviceAccountData();
    return true;
  }
  try {
    await flushPendingSync();
  } catch (e) {
    console.error("[sync] 로그아웃 전 flush 실패:", e);
  }

  const signedOut = await signOut();
  retainDrawUsageOnSignOut(loadStore().readings);
  clearDeviceAccountData();
  return signedOut;
}
