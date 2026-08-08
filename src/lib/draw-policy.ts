import { retainedDrawUsageAt, type RetainedDrawUsage } from "@/lib/draw-guard";
import { localDateOf } from "@/lib/period";
import { slotState, type ArcanaStore, type SpreadType } from "@/lib/store";
import { dailyTicketsFor } from "@/lib/tickets";

export type DrawGate =
  | { state: "available" }
  | { state: "redirect"; href: string };

/** 진입 시점과 저장 직전이 반드시 같은 케이던스 판정을 쓰게 한다. */
export function drawGate(
  store: ArcanaStore,
  spread: SpreadType,
  category: string,
  at: Date,
  signedIn: boolean,
  retainedUsage: RetainedDrawUsage,
): DrawGate {
  if (spread === "three" && !signedIn && retainedUsage.threeUsed) {
    return { state: "redirect", href: "/reading" };
  }

  const slot = slotState(
    store,
    spread,
    category,
    at,
    spread === "one" ? dailyTicketsFor(signedIn) : 1,
    spread === "one" && !signedIn ? retainedUsage.oneSlotsUsed : 0,
  );
  if (slot.state === "completed" && slot.readingId) {
    return { state: "redirect", href: `/reading/${slot.readingId}` };
  }
  if (slot.state === "exhausted") {
    return { state: "redirect", href: `/my/journal/${localDateOf(at)}` };
  }
  return { state: "available" };
}

export function currentDrawGate(
  store: ArcanaStore,
  spread: SpreadType,
  category: string,
  at: Date,
  signedIn: boolean,
): DrawGate {
  return drawGate(store, spread, category, at, signedIn, retainedDrawUsageAt(at));
}
