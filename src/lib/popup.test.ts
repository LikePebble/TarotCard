import { describe, expect, it } from "vitest";
import { isDismissed, withDismissal, type PopupStore } from "@/lib/popup";

describe("popup dismissal", () => {
  const today = "2026-07-28";
  it("forever entry always hides the popup", () => expect(isDismissed({ p: "forever" }, "p", today)).toBe(true));
  it("today entry hides the popup", () => expect(isDismissed({ p: today }, "p", today)).toBe(true));
  it("yesterday entry does not hide it", () => expect(isDismissed({ p: "2026-07-27" }, "p", today)).toBe(false));
  it("missing entry is shown", () => expect(isDismissed({}, "p", today)).toBe(false));
  it("withDismissal preserves another popup", () => {
    const store: PopupStore = { other: "forever" };
    expect(withDismissal(store, "p", "today", today)).toEqual({ other: "forever", p: today });
  });
});
