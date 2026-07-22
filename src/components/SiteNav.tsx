import Image from "next/image";
import Link from "next/link";

/** 서비스 BI. 전체 엠블럼(3:1)은 휠이 높이의 대부분을 먹어, 네비 높이에서는
 *  명패의 글자가 뭉갠다. 상단 바에는 명패 띠만 잘라낸 워드마크(4.7:1)를 쓴다. */
const LOGO_SRC = "/brand/egg-tarot-wordmark.png";
const LOGO_W = 738;
const LOGO_H = 157;
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
      <Link href="/" aria-label={BRAND} className="flex items-center">
        <Image
          src={LOGO_SRC}
          alt={BRAND}
          width={LOGO_W}
          height={LOGO_H}
          priority
          className="h-8 w-auto"
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
      <Image
        src={LOGO_SRC}
        alt={BRAND}
        width={LOGO_W}
        height={LOGO_H}
        priority
        className="h-7 w-auto"
      />
    </header>
  );
}
