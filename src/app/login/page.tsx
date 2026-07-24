"use client";

import Link from "next/link";
import { CaretLeft, UserCircle } from "@phosphor-icons/react";
import { SignInButtons } from "@/components/SignInButtons";
import { useSession } from "@/lib/auth/session";

/** 로그인 랜딩. 유도 지점(미수집 칩, 수집됨 필터 빈 상태 등)이 이곳으로 보낸다. */
export default function LoginPage() {
  const { user, loading, configured } = useSession();

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <nav className="flex h-14 flex-none items-center px-5">
        <Link
          href="/my"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
        >
          <CaretLeft size={16} aria-hidden />
          돌아가기
        </Link>
      </nav>
      <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center px-6 pb-24">
        <UserCircle size={30} className="text-gold-soft" aria-hidden />
        <h1 className="mt-3 font-display text-[27px] font-semibold">로그인</h1>
        {loading ? (
          <p className="mt-2 min-h-[120px]" aria-hidden />
        ) : user ? (
          <>
            <p className="mt-2 text-[14.5px] text-muted">
              이미 로그인되어 있습니다. {user.email ?? user.id}
            </p>
            <Link href="/my" className="btn btn-gold mt-6">
              MY로 가기
            </Link>
          </>
        ) : configured ? (
          <>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
              기록을 기기 간에 안전하게 보관하고, 뽑은 카드를 도감에
              수집합니다.
            </p>
            <div className="mt-6">
              <SignInButtons />
            </div>
          </>
        ) : (
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
            로그인 준비 중입니다. 카카오·구글 로그인이 곧 열립니다 — 그때까지
            기록은 이 기기에 안전하게 보관됩니다.
          </p>
        )}
      </main>
    </div>
  );
}
