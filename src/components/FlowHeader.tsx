import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";

/** Mobile-only immersive flow header: back link + step indicator. */
export function FlowHeader({
  backHref,
  backLabel,
  step,
}: {
  backHref: string;
  backLabel: string;
  step?: string;
}) {
  return (
    <nav className="flex h-14 flex-none items-center justify-between px-5 lg:hidden">
      <Link
        href={backHref}
        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-cream"
      >
        <CaretLeft size={16} aria-hidden />
        {backLabel}
      </Link>
      {step ? <span className="text-[13px] text-muted">{step}</span> : null}
    </nav>
  );
}
