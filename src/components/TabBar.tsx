"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cards, MoonStars } from "@phosphor-icons/react";

export function TabBar() {
  const pathname = usePathname();
  const collectionActive = pathname.startsWith("/collection");
  const item =
    "flex flex-1 flex-col items-center justify-center gap-[3px] text-[11px]";
  return (
    <nav
      aria-label="하단 탭"
      className="mt-auto flex h-[76px] flex-none border-t border-line bg-ink-0 pb-3 lg:hidden"
    >
      <Link
        href="/"
        className={`${item} ${collectionActive ? "text-muted" : "text-gold-soft"}`}
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
    </nav>
  );
}
