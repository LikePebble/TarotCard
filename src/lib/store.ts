"use client";

import { useCallback, useEffect, useState } from "react";

export type SpreadType = "one" | "three";

export type CollectionEntry = { firstAt: string; count: number };

export type ReadingRecord = {
  at: string;
  spread: SpreadType;
  focus: string;
  cards: string[];
};

export type ArcanaStore = {
  version: 1;
  collection: Record<string, CollectionEntry>;
  readings: ReadingRecord[];
};

const STORE_KEY = "arcana.v1";
const SPREAD_KEY = "arcana.reading.spread";
const FOCUS_KEY = "arcana.reading.focus";

function emptyStore(): ArcanaStore {
  return { version: 1, collection: {}, readings: [] };
}

export function loadStore(): ArcanaStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ArcanaStore;
    if (
      parsed &&
      parsed.version === 1 &&
      typeof parsed.collection === "object" &&
      parsed.collection !== null &&
      Array.isArray(parsed.readings)
    ) {
      return parsed;
    }
    return emptyStore();
  } catch {
    return emptyStore();
  }
}

function saveStore(store: ArcanaStore) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // storage full or unavailable; reading still works for the session
  }
}

/** Records a finished reading: increments collection counts and appends history. */
export function recordReading(
  spread: SpreadType,
  focus: string,
  slugs: string[],
): ArcanaStore {
  const store = loadStore();
  const at = new Date().toISOString();
  for (const slug of slugs) {
    const entry = store.collection[slug];
    store.collection[slug] = entry
      ? { firstAt: entry.firstAt, count: entry.count + 1 }
      : { firstAt: at, count: 1 };
  }
  store.readings.push({ at, spread, focus, cards: slugs });
  saveStore(store);
  return store;
}

export function collectedCount(store: ArcanaStore): number {
  return Object.keys(store.collection).length;
}

/** Client hook: null until mounted (SSR-safe), then the live store. */
export function useArcanaStore() {
  const [store, setStore] = useState<ArcanaStore | null>(null);
  useEffect(() => {
    setStore(loadStore());
  }, []);
  const refresh = useCallback(() => setStore(loadStore()), []);
  return { store, refresh };
}

/* Reading flow state (spread + focus) lives in sessionStorage. */

export function setPendingSpread(spread: SpreadType) {
  try {
    window.sessionStorage.setItem(SPREAD_KEY, spread);
  } catch {}
}

export function setPendingFocus(focus: string) {
  try {
    window.sessionStorage.setItem(FOCUS_KEY, focus);
  } catch {}
}

export function getPendingSpread(): SpreadType | null {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(SPREAD_KEY);
  return value === "one" || value === "three" ? value : null;
}

export function getPendingFocus(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(FOCUS_KEY);
}
