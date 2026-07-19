"use client";

import { useCallback, useEffect, useState } from "react";

/** 하루치 일기. date("YYYY-MM-DD") 별로 하나. */
export type JournalEntry = { body: string; updatedAt: string };

/** date -> entry. 리딩/도감 스토어(ArcanaStore)와 분리된 별도 저장소. */
export type JournalStore = Record<string, JournalEntry>;

const KEY = "arcana.journal.v1";

export function loadJournal(): JournalStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as JournalStore) : {};
  } catch {
    return {};
  }
}

function saveJournal(store: JournalStore) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // storage full/unavailable; in-memory value still usable this session
  }
}

/** 일기 본문을 반영한 새 스토어(순수). 빈 본문은 그날 항목을 삭제한다. */
export function withEntry(
  store: JournalStore,
  date: string,
  body: string,
  at: string,
): JournalStore {
  const next = { ...store };
  if (body.trim() === "") {
    delete next[date];
  } else {
    next[date] = { body, updatedAt: at };
  }
  return next;
}

/** 일기를 저장한다(부작용 래퍼). 반환은 갱신된 스토어. */
export function setEntry(date: string, body: string): JournalStore {
  const next = withEntry(loadJournal(), date, body, new Date().toISOString());
  saveJournal(next);
  return next;
}

/** Client hook: null until mounted (SSR-safe), then the live journal. */
export function useJournal() {
  const [store, setStore] = useState<JournalStore | null>(null);
  useEffect(() => {
    setStore(loadJournal());
  }, []);
  const refresh = useCallback(() => setStore(loadJournal()), []);
  return { store, refresh };
}
