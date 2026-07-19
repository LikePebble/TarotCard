import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

/** OAuth 리다이렉트 콜백: 코드를 세션으로 교환하고 MY로 보낸다. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/my";

  if (code) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/my`);
}
