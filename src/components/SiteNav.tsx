import Link from "next/link";

// 로고 이미지는 제거됨(브랜드 리뉴얼 대기). 새 로고를 받으면 이 텍스트 워드마크를
// <Image>로 교체한다. 임시로 서비스명 텍스트를 둔다.
const BRAND = "에그타로트";

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
        {BRAND}
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
        {BRAND}
      </span>
    </header>
  );
}
