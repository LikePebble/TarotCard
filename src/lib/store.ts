"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_DECK_ID } from "@/data/decks";
import { localDateOf, isoWeekOf } from "@/lib/period";
import {
  readingTypeOf,
  type ReadingTypeId,
  type SpreadType,
} from "@/data/reading-types";

export type { SpreadType };

export type Orientation = "upright" | "reversed";

export type CollectionEntry = { firstAt: string; count: number };

export type ReadingRecord = {
  id: string;
  at: string; // ISO
  localDate: string; // YYYY-MM-DD (로컬)
  isoWeek: string; // YYYY-Www
  spread: SpreadType;
  typeId: ReadingTypeId;
  category: string; // focus id
  deckId: string;
  cards: string[];
  orientations: Orientation[];
};

/** deckId -> slug -> entry (덱별 도감, D9). */
export type ArcanaStore = {
  version: 2;
  collection: Record<string, Record<string, CollectionEntry>>;
  readings: ReadingRecord[];
};

const STORE_KEY = "arcana.v1"; // 저장 키는 유지, 내부 version 필드로 마이그레이션 판별
const SPREAD_KEY = "arcana.reading.spread";
const FOCUS_KEY = "arcana.reading.focus";

export function emptyStore(): ArcanaStore {
  return { version: 2, collection: {}, readings: [] };
}

function migrateReading(rec: unknown, i: number): ReadingRecord {
  const r = (rec ?? {}) as Record<string, unknown>;
  const at = typeof r.at === "string" ? r.at : new Date(0).toISOString();
  const d = new Date(at);
  const spread: SpreadType = r.spread === "three" ? "three" : "one";
  return {
    id: `${at}-${i}`,
    at,
    localDate: localDateOf(d),
    isoWeek: isoWeekOf(d),
    spread,
    typeId: readingTypeOf(spread).id,
    category: typeof r.focus === "string" ? r.focus : "day",
    deckId: DEFAULT_DECK_ID,
    cards: Array.isArray(r.cards) ? (r.cards as string[]) : [],
    orientations: [],
  };
}

/** 저장된 임의 값을 현재(v2) 스토어로 정규화한다. */
export function migrateStore(raw: unknown): ArcanaStore {
  if (!raw || typeof raw !== "object") return emptyStore();
  const r = raw as Record<string, unknown>;
  const readings = Array.isArray(r.readings) ? r.readings : null;
  const collection =
    r.collection && typeof r.collection === "object" ? r.collection : null;

  if (r.version === 2 && collection && readings) {
    return raw as ArcanaStore;
  }
  if (r.version === 1 && collection && readings) {
    return {
      version: 2,
      collection: {
        [DEFAULT_DECK_ID]: collection as Record<string, CollectionEntry>,
      },
      readings: readings.map((rec, i) => migrateReading(rec, i)),
    };
  }
  return emptyStore();
}

export function loadStore(): ArcanaStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    return migrateStore(JSON.parse(raw));
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

export function recordReading(): ArcanaStore {
  // 정식 구현은 Task 5. 이 스텁은 컴파일만 통과시킨다.
  return loadStore();
}

export type SlotState = {
  state: "available" | "completed" | "exhausted";
  readingId?: string;
};

/** 현재 주기에서 (유형, 카테고리)에 해당하는 이미 완료된 리딩을 찾는다. */
export function findReadingFor(
  store: ArcanaStore,
  spread: SpreadType,
  category: string,
  d: Date,
): ReadingRecord | undefined {
  const type = readingTypeOf(spread);
  if (type.cadenceUnit === "week") {
    const wk = isoWeekOf(d);
    return store.readings.find((r) => r.typeId === type.id && r.isoWeek === wk);
  }
  const day = localDateOf(d);
  return store.readings.find(
    (r) => r.typeId === type.id && r.localDate === day && r.category === category,
  );
}

/** 오늘 이 유형으로 소비한 서로 다른 카테고리 수(=슬롯 소비). */
export function dailySlotsUsed(
  store: ArcanaStore,
  spread: SpreadType,
  d: Date,
): number {
  const type = readingTypeOf(spread);
  const day = localDateOf(d);
  const cats = new Set(
    store.readings
      .filter((r) => r.typeId === type.id && r.localDate === day)
      .map((r) => r.category),
  );
  return cats.size;
}

/**
 * (유형, 카테고리)의 현재 상태.
 * - completed: 이번 주기에 이미 뽑음 → readingId로 결과 이동
 * - exhausted: 오늘 슬롯 소진(일 케이던스 한정)
 * - available: 뽑기 가능
 * maxDailySlots 기본 1(무료). ad_free는 3(D15) — P0-a 이후 주입.
 */
export function slotState(
  store: ArcanaStore,
  spread: SpreadType,
  category: string,
  d: Date,
  maxDailySlots = 1,
): SlotState {
  const existing = findReadingFor(store, spread, category, d);
  if (existing) return { state: "completed", readingId: existing.id };
  const type = readingTypeOf(spread);
  if (type.cadenceUnit === "day" && dailySlotsUsed(store, spread, d) >= maxDailySlots) {
    return { state: "exhausted" };
  }
  return { state: "available" };
}

export function collectedCount(store: ArcanaStore, deckId: string): number {
  return Object.keys(store.collection[deckId] ?? {}).length;
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

/* Selected deck (device-local, like the collection). */

const DECK_KEY = "arcana.deck";

export function getSelectedDeckId(): string {
  if (typeof window === "undefined") return "classic";
  return window.localStorage.getItem(DECK_KEY) ?? "classic";
}

export function setSelectedDeckId(id: string) {
  try {
    window.localStorage.setItem(DECK_KEY, id);
  } catch {}
}

/** Client hook: "classic" during SSR, then the persisted selection. */
export function useSelectedDeck() {
  const [deckId, setDeckId] = useState("classic");
  useEffect(() => {
    setDeckId(getSelectedDeckId());
  }, []);
  const select = useCallback((id: string) => {
    setSelectedDeckId(id);
    setDeckId(id);
  }, []);
  return { deckId, select };
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
