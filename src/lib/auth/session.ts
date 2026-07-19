"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

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
  await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

export async function signOut(): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}
