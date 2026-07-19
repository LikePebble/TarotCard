import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** App Router 쿠키 기반 서버 클라이언트. env 없으면 null. */
export async function getServerSupabase(): Promise<SupabaseClient | null> {
  if (!url || !anon) return null;
  const store = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list: CookieToSet[]) => {
        try {
          for (const { name, value, options } of list) {
            store.set(name, value, options);
          }
        } catch {
          // Server Component에서 호출된 경우 — 미들웨어가 세션을 갱신하므로 무시 가능.
        }
      },
    },
  });
}
