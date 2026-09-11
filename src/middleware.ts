import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { LOCALE_HEADER, localeFromCountry } from "@/lib/locale";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Supabase 세션 토큰을 갱신한다. env 미설정이면 그대로 통과. */
export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    LOCALE_HEADER,
    localeFromCountry(request.headers.get("x-vercel-ip-country")),
  );
  const next = () => NextResponse.next({ request: { headers: requestHeaders } });
  let response = next();
  response.headers.set("Vary", "X-Vercel-IP-Country");
  if (!url || !anon) return response;

  // 토큰 갱신의 재시도까지 포함해 페이지 응답의 대기 시간을 제한한다.
  const controller = new AbortController();
  let finished = false;
  const supabase = createServerClient(url, anon, {
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, signal: controller.signal }),
    },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: CookieToSet[]) => {
        if (finished) return;
        for (const { name, value } of list) request.cookies.set(name, value);
        response = next();
        response.headers.set("Vary", "X-Vercel-IP-Country");
        for (const { name, value, options } of list) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      supabase.auth.getUser(),
      new Promise<void>((resolve) => {
        timer = setTimeout(() => {
          finished = true;
          controller.abort();
          console.warn("Middleware auth refresh timed out");
          resolve();
        }, 5_000);
      }),
    ]);
  } catch {
    // 인증 여부는 보호된 API에서 별도로 검증한다. 일시 오류로 쿠키를 지우지 않는다.
    console.warn("Middleware auth refresh failed");
  } finally {
    finished = true;
    clearTimeout(timer);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|woff2)$).*)"],
};
