import Link from "next/link";
import { DesktopNav, MobileTopBar } from "@/components/SiteNav";
import { TabBar } from "@/components/TabBar";
import { HomeHero } from "./HomeHero";

export default function HomePage() {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden lg:h-auto lg:min-h-[100dvh] lg:overflow-visible">
      <DesktopNav active="reading" />
      <MobileTopBar />
      <main className="mx-auto flex w-full min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-8 pt-5 lg:grid lg:max-w-[1280px] lg:min-h-[620px] lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:overflow-visible lg:px-12 lg:py-[72px]">
        <div>
          <h1 className="mt-3 font-display text-[34px] font-semibold leading-[1.3] lg:mt-0 lg:text-[58px] lg:leading-[1.22] lg:tracking-[-0.01em]">
            하루 한 장,
            <br />
            나를 비추는 <em className="not-italic text-gold-soft">카드</em>
          </h1>
          <p className="mt-3.5 max-w-[300px] text-[15px] text-muted lg:max-w-[560px] lg:text-[17px]">
            카드를 뽑고 해석을 읽으며 78장의 컬렉션을 완성해 보세요.
          </p>
          <div className="mt-6 lg:mt-9 lg:flex lg:gap-3.5">
            <Link href="/reading" className="btn btn-gold w-full lg:w-auto">
              리딩 시작하기
            </Link>
            <Link
              href="/collection"
              className="btn btn-ghost hidden lg:inline-flex"
            >
              컬렉션
            </Link>
          </div>
        </div>
        <HomeHero />
      </main>
      <TabBar />
    </div>
  );
}
