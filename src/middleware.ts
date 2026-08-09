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

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: CookieToSet[]) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = next();
        response.headers.set("Vary", "X-Vercel-IP-Country");
        for (const { name, value, options } of list) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|woff2)$).*)"],
};
