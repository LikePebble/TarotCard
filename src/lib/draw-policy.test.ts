import { describe, expect, it } from "vitest";
import { drawGate } from "@/lib/draw-policy";
import { emptyStore, newReadingRecord, withReadingRecorded } from "@/lib/store";

const at = new Date(2026, 7, 8, 12);
const none = { oneSlotsUsed: 0, threeUsed: false };

function recorded(spread: "one" | "three", category = "love") {
  return withReadingRecorded(
    emptyStore(),
    newReadingRecord({
      id: spread === "one" ? "today" : "week",
      at,
      spread,
      category,
      deckId: "classic",
      cards: spread === "one" ? ["thefool"] : ["thefool", "themoon", "thestar"],
      orientations: spread === "one" ? ["upright"] : ["upright", "reversed", "upright"],
    }),
  );
}

describe("drawGate", () => {
  it("allows an unused draw", () => {
    expect(drawGate(emptyStore(), "one", "love", at, false, none)).toEqual({ state: "available" });
  });

  it("returns the existing result for the same daily category", () => {
    expect(drawGate(recorded("one"), "one", "love", at, true, none)).toEqual({
      state: "redirect",
      href: "/reading/today",
    });
  });

  it("routes an exhausted daily draw to that day's journal", () => {
    expect(drawGate(recorded("one"), "one", "work", at, false, { oneSlotsUsed: 2, threeUsed: false })).toEqual({
      state: "redirect",
      href: "/my/journal/2026-08-08",
    });
  });

  it("keeps guest three-card usage after sign-out", () => {
    expect(drawGate(emptyStore(), "three", "love", at, false, { oneSlotsUsed: 0, threeUsed: true })).toEqual({
      state: "redirect",
      href: "/reading",
    });
  });

  it("returns this week's existing three-card result", () => {
    expect(drawGate(recorded("three"), "three", "work", at, true, none)).toEqual({
      state: "redirect",
      href: "/reading/week",
    });
  });
});
