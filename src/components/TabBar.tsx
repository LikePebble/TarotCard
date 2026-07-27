"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cards, MoonStars, User } from "@phosphor-icons/react";

export function TabBar() {
  const pathname = usePathname();
  // 약관·방침은 MY에서 들어가는 문서다. DesktopNav도 MY를 활성으로 표시한다.
  const legalActive =
    pathname.startsWith("/terms") || pathname.startsWith("/privacy");
  const myActive = pathname.startsWith("/my") || legalActive;
  const collectionActive = pathname.startsWith("/collection");
  const readingActive = !myActive && !collectionActive;
  const item =
    "flex flex-1 flex-col items-center justify-center gap-[3px] text-[11px]";
  return (
    <nav
      aria-label="하단 탭"
      className="flex h-[76px] flex-none border-t border-line bg-ink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <Link
        href="/"
        className={`${item} ${readingActive ? "text-gold-soft" : "text-muted"}`}
      >
        <MoonStars size={22} aria-hidden />
        리딩
      </Link>
      <Link
        href="/collection"
        className={`${item} ${collectionActive ? "text-gold-soft" : "text-muted"}`}
      >
        <Cards size={22} aria-hidden />
        컬렉션
      </Link>
      <Link
        href="/my"
        className={`${item} ${myActive ? "text-gold-soft" : "text-muted"}`}
      >
        <User size={22} aria-hidden />
        MY
      </Link>
    </nav>
  );
}
