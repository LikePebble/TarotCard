import { FlowHeader } from "@/components/FlowHeader";
import { DesktopNav } from "@/components/SiteNav";
import { ReadingChoice } from "./ReadingChoice";

export default function ReadingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <DesktopNav active="reading" />
      <FlowHeader backHref="/" backLabel="홈" step="1 / 3" />
      <main className="mx-auto w-full max-w-[1060px] px-6 pb-8 pt-3 lg:px-12 lg:pb-24 lg:pt-[88px]">
        <h1 className="font-display text-[27px] font-semibold leading-[1.35] lg:text-[40px] lg:leading-[1.3]">
          어떤 리딩을{" "}
          <br className="lg:hidden" />
          할까요
        </h1>
        <ReadingChoice />
      </main>
    </div>
  );
}
