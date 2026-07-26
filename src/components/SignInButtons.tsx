"use client";

import { useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";
import { signInWithProvider } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { GoogleIcon, KakaoIcon } from "@/components/icons/OAuthLogos";

interface SignInButtonsProps {
  /** 버튼 세로 정렬 여부 (기본: flex-col gap-3) */
  className?: string;
}

/**
 * 카카오/구글 브랜드 가이드라인 준수 로그인 버튼 세트.
 * - Kakao: #FEE500 배경, #191919 텍스트 & 카카오 말풍선 심볼
 * - Google: #FFFFFF 배경, #1F1F1F 텍스트, #DADCE0 테두리 & 4컬러 G 심볼
 */
export function SignInButtons({
  className = "flex w-full flex-col gap-3",
}: SignInButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<
    "kakao" | "google" | null
  >(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSignIn = async (provider: "kakao" | "google") => {
    if (!isSupabaseConfigured) {
      setNotice(
        "현재 Supabase 환경 변수가 설정되지 않아 데모 모드로 동작 중입니다. .env.local 파일에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 추가하면 실제 소셜 로그인이 진행됩니다.",
      );
      return;
    }

    setLoadingProvider(provider);
    setNotice(null);
    try {
      await signInWithProvider(provider);
    } catch (err) {
      console.error(`${provider} 로그인 오류:`, err);
      setNotice("로그인 요청 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setLoadingProvider(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {notice && (
        <div className="rounded-xl border border-gold-soft/30 bg-ink-2/80 p-3.5 text-xs leading-relaxed text-gold-soft backdrop-blur-sm animate-in fade-in">
          {notice}
        </div>
      )}

      <div className={className}>
        {/* 카카오 로그인 버튼 (공식 가이드라인 준수) */}
        <button
          type="button"
          onClick={() => void handleSignIn("kakao")}
          disabled={loadingProvider !== null}
          className="relative flex h-[52px] w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-[#FEE500] px-5 font-sans text-[15px] font-semibold text-[#191919] shadow-sm transition-all duration-200 hover:bg-[#fada0a] hover:shadow-md active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="카카오계정으로 로그인"
        >
          {loadingProvider === "kakao" ? (
            <CircleNotch size={20} className="animate-spin text-[#191919]" />
          ) : (
            <KakaoIcon className="text-[#191919] flex-shrink-0" />
          )}
          <span>카카오로 시작하기</span>
        </button>

        {/* 구글 로그인 버튼 (공식 Branding Guidelines 준수) */}
        <button
          type="button"
          onClick={() => void handleSignIn("google")}
          disabled={loadingProvider !== null}
          className="relative flex h-[52px] w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#DADCE0] bg-white px-5 font-sans text-[15px] font-medium text-[#1F1F1F] shadow-sm transition-all duration-200 hover:border-[#D2D5D9] hover:bg-[#F8F9FA] hover:shadow-md active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Google 계정으로 로그인"
        >
          {loadingProvider === "google" ? (
            <CircleNotch size={20} className="animate-spin text-[#1F1F1F]" />
          ) : (
            <GoogleIcon className="flex-shrink-0" />
          )}
          <span>Google로 시작하기</span>
        </button>
      </div>
    </div>
  );
}
