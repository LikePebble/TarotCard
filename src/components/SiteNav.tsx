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
        className="font-display text-[19px] font-semibold tracking-[0.06em]"
      >
        아르카나
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
      <span className="font-display text-[17px] font-semibold tracking-[0.06em]">
        아르카나
      </span>
    </header>
  );
}
