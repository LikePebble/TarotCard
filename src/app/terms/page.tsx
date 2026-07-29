import type { Metadata } from "next";
import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { LegalDocumentView } from "@/components/LegalDocumentView";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { TabBar } from "@/components/TabBar";
import { termsDocument } from "@/data/legal";

const TITLE = "이용약관 — 아르카 타로";
const DESCRIPTION =
  "아르카 타로 서비스의 이용약관입니다. 타로 해석의 성격과 한계, 계정과 기록, 콘텐츠 저작권, 광고에 관한 사항을 안내합니다.";

export const metadata: Metadata = {
  // absolute — layout에 title.template이 도입되더라도 접미사가 겹치지 않는다.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/terms" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

export default function TermsPage() {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden lg:h-auto lg:min-h-[100dvh] lg:overflow-visible">
      <DesktopNav active="my" />
      <MobileTopBar />
      <nav className="flex h-12 flex-none items-center px-5 lg:hidden">
        <Link
          href="/my"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
        >
          <CaretLeft size={16} aria-hidden />
          MY
        </Link>
      </nav>

      <main className="mx-auto w-full min-h-0 flex-1 overflow-y-auto px-5 pb-10 pt-1 lg:max-w-[760px] lg:overflow-visible lg:px-12 lg:pb-[88px] lg:pt-8">
        <LegalDocumentView doc={termsDocument} />
        <p className="mt-8 text-[13px] text-muted lg:text-[14px]">
          <Link href="/privacy" className="underline underline-offset-4 hover:text-cream">
            개인정보처리방침 보기
          </Link>
        </p>
      </main>
      <TabBar />
    </div>
  );
}
