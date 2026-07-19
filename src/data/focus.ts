import { koFocusLove } from "./ko-focus-love";
import { koFocusWork } from "./ko-focus-work";
import { koFocusSelf } from "./ko-focus-self";
import { koFocusHealth } from "./ko-focus-health";
import { koFocusMoney } from "./ko-focus-money";
import type { SpreadType } from "@/lib/store";

export type FocusId = "love" | "work" | "self" | "health" | "money" | "day";

export type FocusOption = { id: FocusId; label: string; desc: string };

export const FOCUS_OPTIONS: FocusOption[] = [
  { id: "love", label: "사랑", desc: "마음과 관계의 흐름" },
  { id: "work", label: "일", desc: "일과 성취의 방향" },
  { id: "self", label: "나 자신", desc: "내면의 상태와 균형" },
  { id: "health", label: "건강", desc: "몸과 마음의 컨디션" },
  { id: "money", label: "금전", desc: "돈을 대하는 마음가짐" },
  { id: "day", label: "오늘 하루", desc: "오늘의 전반적인 기운" },
];

/** 오늘 하루는 오늘의 카드 전용. */
export function focusOptionsFor(spread: SpreadType): FocusOption[] {
  return spread === "three"
    ? FOCUS_OPTIONS.filter((option) => option.id !== "day")
    : FOCUS_OPTIONS;
}

/** id -> 표시 라벨. 구버전 세션이 한글 라벨을 저장했어도 그대로 보여준다. */
export function focusLabelOf(id: string): string {
  return FOCUS_OPTIONS.find((option) => option.id === id)?.label ?? id;
}

/** 테마별 카드 해석. day는 기본 해석만 사용하므로 레코드가 없다. */
const KO_FOCUS: Partial<Record<FocusId, Record<string, string>>> = {
  love: koFocusLove,
  work: koFocusWork,
  self: koFocusSelf,
  health: koFocusHealth,
  money: koFocusMoney,
};

export function focusParagraphOf(
  focusId: string,
  slug: string,
): string | null {
  return KO_FOCUS[focusId as FocusId]?.[slug] ?? null;
}
