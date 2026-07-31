import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";

/** 리딩 흐름의 뒤로가기와 단계 표시. 데스크톱에서도 본문 폭에 맞춰 둔다. */
export function FlowHeader({
  backHref,
  backLabel,
  step,
  contentClassName = "max-w-[1060px]",
}: {
  backHref: string;
  backLabel: string;
  step?: string;
  contentClassName?: string;
}) {
  return (
    <nav className="flex h-14 flex-none items-center lg:h-16">
      <div
        className={`mx-auto flex w-full items-center justify-between px-5 lg:px-12 ${contentClassName}`}
      >
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
        >
          <CaretLeft size={16} aria-hidden />
          {backLabel}
        </Link>
        {step ? <span className="text-[13px] text-muted">{step}</span> : null}
      </div>
    </nav>
  );
}
