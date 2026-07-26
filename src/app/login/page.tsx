"use client";

import Link from "next/link";
import {
  CaretLeft,
  Sparkle,
  UserCircle,
  Cards,
  ArrowsClockwise,
  CheckCircle,
} from "@phosphor-icons/react";
import { SignInButtons } from "@/components/SignInButtons";
import { signOutAndClear, useSession } from "@/lib/auth/session";

/** 로그인 페이지: 구글 및 카카오톡 소셜 로그인 지원 및 계정 상태 안내 */
export default function LoginPage() {
  const { user, loading } = useSession();

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-ink-0 text-cream selection:bg-gold-soft/30">
      {/* 배경 은은한 신비로운 빛 효과 */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(224, 192, 120, 0.4) 0%, rgba(201, 162, 75, 0.1) 60%, transparent 80%)",
        }}
        aria-hidden
      />

      {/* 상단 네비게이션 */}
      <nav className="flex h-16 flex-none items-center justify-between px-5 lg:px-8">
        <Link
          href="/my"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted transition-colors hover:text-cream focus-visible:text-cream"
        >
          <CaretLeft size={18} aria-hidden />
          <span>돌아가기</span>
        </Link>
        <span className="font-display text-xs tracking-wider text-gold-soft/60 uppercase">
          Arca Account
        </span>
      </nav>

      {/* 본문 콘텐츠 */}
      <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center px-6 pb-20 pt-4">
        {/* 아르카나 모티프 상단 카드 엠블럼 */}
        <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-line-gold bg-ink-1/90 shadow-xl shadow-black/40 backdrop-blur-md">
          <div className="absolute inset-1 rounded-xl border border-gold-soft/20" />
          <Sparkle size={28} className="text-gold-soft" aria-hidden />
        </div>

        <div className="mb-8 text-center">
          <h1 className="font-display text-[28px] font-bold tracking-tight text-cream sm:text-[30px]">
            {user ? "반갑습니다!" : "소셜 로그인"}
          </h1>
          <p className="mx-auto mt-2 max-w-[340px] text-sm leading-relaxed text-muted">
            {user
              ? "계정이 연결되어 기록과 수집 카드가 안전하게 보관됩니다."
              : "카카오 및 Google 계정으로 간편하게 시작하고, 나만의 리딩 기록을 기기 간에 자유롭게 이어가세요."}
          </p>
        </div>

        {/* 메인 카드 영역 */}
        <div className="relative overflow-hidden rounded-2xl border border-line-gold/40 bg-ink-1/80 p-6 shadow-2xl backdrop-blur-xl">
          {/* 금빛 상단 라인 포인트 */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

          {loading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-soft border-t-transparent" />
              <p className="text-xs text-muted">계정 정보를 불러오는 중…</p>
            </div>
          ) : user ? (
            <div className="flex flex-col gap-6 py-2">
              <div className="flex items-center gap-4 rounded-xl border border-line bg-ink-2/60 p-4">
                <UserCircle size={40} className="text-gold-soft flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="block text-xs text-muted">현재 로그인된 계정</span>
                  <span className="block truncate font-medium text-cream text-[15px]">
                    {user.email ?? user.id}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/my"
                  className="btn btn-gold w-full text-center shadow-lg shadow-gold/10"
                >
                  마이페이지(MY)로 이동
                </Link>
                <button
                  type="button"
                  onClick={() => void signOutAndClear()}
                  className="w-full py-3 text-center text-xs text-muted underline underline-offset-4 hover:text-cream transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* 카카오톡 & 구글 로그인 버튼 세트 */}
              <SignInButtons />

              {/* 로그인 혜택 안내 */}
              <div className="border-t border-line/60 pt-5">
                <h2 className="text-xs font-semibold text-gold-soft tracking-wider uppercase mb-3 flex items-center gap-1.5">
                  <CheckCircle size={14} aria-hidden />
                  로그인 시 혜택
                </h2>
                <ul className="space-y-2.5 text-[13px] text-body">
                  <li className="flex items-start gap-2.5">
                    <ArrowsClockwise size={16} className="text-gold-soft flex-shrink-0 mt-0.5" aria-hidden />
                    <span>기기 변경 시에도 타로 일지 및 뽑은 카드 자동 동기화</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Cards size={16} className="text-gold-soft flex-shrink-0 mt-0.5" aria-hidden />
                    <span>78장 타로 카드 도감 컬렉션 영구 보관</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 하단 캡션 */}
        {!user && (
          <p className="mt-6 text-center text-[12.5px] text-muted/80 leading-relaxed px-2">
            로그인 없이도 기본 타로 리딩을 이용할 수 있으며, 모든 기록은
            현재 기기에 안전하게 저장됩니다.
          </p>
        )}
      </main>
    </div>
  );
}
