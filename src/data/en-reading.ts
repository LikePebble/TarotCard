import {
  enUprightFocusParagraphOf,
  enUprightPositionParagraphOf,
} from "./en-upright-reading";
import {
  enReversedFocusParagraphOf,
  enReversedPositionParagraphOf,
} from "./en-reversed-reading";
import type { EnUprightPositionId } from "./en-upright-reading";

/** Public selector for the complete English focus and position corpora. */
export function enFocusParagraphOf(focus: string, slug: string, reversed = false): string | null {
  return reversed
    ? enReversedFocusParagraphOf(focus, slug)
    : enUprightFocusParagraphOf(focus, slug);
}

export function enPositionParagraphOf(
  position: EnUprightPositionId,
  slug: string,
  reversed = false,
): string {
  return (
    (reversed
      ? enReversedPositionParagraphOf(position, slug)
      : enUprightPositionParagraphOf(position, slug)) ?? ""
  );
}
