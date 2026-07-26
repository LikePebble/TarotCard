import Image from "next/image";
import Link from "next/link";

/** Desktop-only top navigation (lg and up). */
export function DesktopNav({
  active,
}: {
  active: "reading" | "collection" | "my";
}) {
  return (
    <nav
      aria-label="주요 메뉴"
      className="hidden h-[68px] flex-none items-center justify-between border-b border-line px-12 lg:flex"
    >
      <Link
        href="/"
        aria-label="아르카 홈"
        className="inline-flex min-h-11 items-center"
      >
        <Image
          src="/brand/arca-logo.webp"
          alt="아르카 타로"
          width={160}
          height={54}
          className="h-auto w-[148px]"
          priority
        />
      </Link>
      <div className="flex items-center gap-7 text-[14.5px]">
        <Link
          href="/"
          className={
            active === "reading" ? "text-cream" : "text-muted hover:text-cream"
          }
        >
          리딩
        </Link>
        <Link
          href="/collection"
          className={
            active === "collection"
              ? "text-cream"
              : "text-muted hover:text-cream"
          }
        >
          컬렉션
        </Link>
        <Link
          href="/my"
          className={
            active === "my" ? "text-cream" : "text-muted hover:text-cream"
          }
        >
          MY
        </Link>
      </div>
    </nav>
  );
}

/** Mobile-only top bar with the wordmark. */
export function MobileTopBar() {
  return (
    <header className="flex h-14 flex-none items-center px-5 lg:hidden">
      <Link
        href="/"
        aria-label="아르카 홈"
        className="inline-flex min-h-11 items-center"
      >
        <Image
          src="/brand/arca-logo.webp"
          alt="아르카 타로"
          width={128}
          height={43}
          className="h-auto w-[124px]"
          priority
        />
      </Link>
    </header>
  );
}
