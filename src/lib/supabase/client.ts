import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** env가 없으면 null → 앱은 게스트 모드로 계속 동작한다. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!url || !anon) return null;
  return createBrowserClient(url, anon);
}

export const isSupabaseConfigured = Boolean(url && anon);
