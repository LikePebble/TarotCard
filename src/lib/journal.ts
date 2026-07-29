"use client";

import { useCallback, useEffect, useState } from "react";
import { notifyLocal, subscribeLocal } from "@/lib/local-events";

/**
 * 하루치 일기. date("YYYY-MM-DD") 별로 하나.
 *
 * **본문이 빈 문자열이면 톰스톤이다** — "이날 일기를 지웠다"는 사실과 그 시각.
 * 항목을 통째로 지우지 않는 이유(S4a 개정): 지워 버리면 다른 기기가 그것을
 * "서버에 아직 안 올린 새 글"과 구분할 수 없다. 병합은 한쪽에만 있는 날짜를
 * 그대로 채택하므로, 삭제가 그 기기에서 되살아나고 다시 서버로 올라간다.
 * 톰스톤이 있으면 삭제도 하나의 기록이 되어 일기와 같은 LWW 규칙으로 겨룬다.
 */
export type JournalEntry = { body: string; updatedAt: string };

/** date -> entry. 리딩/도감 스토어(ArcanaStore)와 분리된 별도 저장소. */
export type JournalStore = Record<string, JournalEntry>;

/**
 * 실제로 쓴 글인가(톰스톤이 아닌가).
 *
 * 화면은 톰스톤을 "없는 날"로 봐야 하고 동기화는 "지운 기록"으로 봐야 한다.
 * 화면 쪽 판정은 전부 이 함수와 아래 두 개를 지나게 해서, 새 화면이 생겼을 때
 * `store[date]`를 그냥 진위 판정하다가 지운 날을 보여주는 일이 없게 한다.
 */
export function isWritten(entry: JournalEntry | undefined): boolean {
  return entry !== undefined && entry.body !== "";
}

/** 그날의 일기. 없거나 지운 날이면 null. */
export function entryOf(
  store: JournalStore,
  date: string,
): JournalEntry | null {
  const entry = store[date];
  return isWritten(entry) ? entry : null;
}

/** 실제로 글이 있는 날짜들(톰스톤 제외). */
export function writtenDates(store: JournalStore): string[] {
  return Object.keys(store).filter((date) => isWritten(store[date]));
}

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
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(store));
    } catch {
      // storage full/unavailable; in-memory value still usable this session
    }
  }
  // 저장 실패와 무관하게 알린다: 인메모리 의도는 이미 바뀌었다.
  notifyLocal("journal");
}

/**
 * 일기 본문을 반영한 새 스토어(순수).
 * 빈 본문은 그날을 **톰스톤으로 바꾼다**(항목을 지우지 않는다 — 위 주석 참조).
 * 원래 아무것도 없던 날에 빈 본문을 저장하면 톰스톤도 만들지 않는다.
 */
export function withEntry(
  store: JournalStore,
  date: string,
  body: string,
  at: string,
): JournalStore {
  if (body.trim() === "") {
    if (store[date] === undefined) return store; // 지울 것이 없다
    return { ...store, [date]: { body: "", updatedAt: at } };
  }
  return { ...store, [date]: { body, updatedAt: at } };
}

/** 일기를 저장한다(부작용 래퍼). 반환은 갱신된 스토어. */
export function setEntry(date: string, body: string): JournalStore {
  const next = withEntry(loadJournal(), date, body, new Date().toISOString());
  saveJournal(next);
  return next;
}

/** 병합/동기화 결과를 로컬 일기에 반영한다(부작용). */
export function setLocalJournal(store: JournalStore): void {
  saveJournal(store);
}

/** 이 기기의 일기를 지운다(로그아웃). 서버 사본은 건드리지 않는다. */
export function clearLocalJournal(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // 위와 같다.
    }
  }
  notifyLocal("journal");
}

/** Client hook: null until mounted (SSR-safe), then the live journal.
 *  일기가 저장되거나 로그인 병합이 끝나면 자동으로 다시 읽는다. */
export function useJournal() {
  const [store, setStore] = useState<JournalStore | null>(null);
  const refresh = useCallback(() => setStore(loadJournal()), []);
  useEffect(() => {
    refresh();
    return subscribeLocal("journal", refresh);
  }, [refresh]);
  return { store, refresh };
}
