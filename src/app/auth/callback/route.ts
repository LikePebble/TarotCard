import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

/** OAuth 리다이렉트 콜백: 코드를 세션으로 교환하고 MY로 보낸다. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  // 오픈 리다이렉트 방지: 같은 오리진의 절대 경로만 허용.
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/my";

  if (code) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/my`);
}
