"use client";

import { useCallback, useEffect, useState } from "react";
import type { ArcanaStore } from "@/lib/store";
import { notifyLocal, subscribeLocal } from "@/lib/local-events";

const KEY = "arcana.collection.unseen.v1";
type UnseenByDeck = Record<string, string[]>;

function load(): UnseenByDeck {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object") return {};
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).flatMap(([deckId, slugs]) =>
        Array.isArray(slugs)
          ? [[deckId, slugs.filter((slug): slug is string => typeof slug === "string")]]
          : [],
      ),
    );
  } catch {
    return {};
  }
}

function save(value: UnseenByDeck): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // 저장하지 못해도 현재 화면은 이후 store 알림으로 다시 계산한다.
  }
}

export function unreadCollectionSlugs(deckId: string): Set<string> {
  return new Set(load()[deckId] ?? []);
}

/** SSR과 저장 상태가 달라도 hydration이 흔들리지 않도록 마운트 뒤에 읽는다. */
export function useUnreadCollection(deckId: string): Set<string> {
  const [unread, setUnread] = useState<Set<string>>(() => new Set());
  const refresh = useCallback(() => setUnread(unreadCollectionSlugs(deckId)), [deckId]);
  useEffect(() => {
    refresh();
    return subscribeLocal("store", refresh);
  }, [refresh]);
  return unread;
}

export function useUnreadCollections(): UnseenByDeck {
  const [unread, setUnread] = useState<UnseenByDeck>({});
  const refresh = useCallback(() => setUnread(load()), []);
  useEffect(() => {
    refresh();
    return subscribeLocal("store", refresh);
  }, [refresh]);
  return unread;
}

/** 방금 처음 만난 카드만 새 카드로 표시한다. */
export function markNewCollectionCards(deckId: string, slugs: string[]): void {
  if (slugs.length === 0) return;
  const all = load();
  const current = new Set(all[deckId] ?? []);
  for (const slug of slugs) current.add(slug);
  all[deckId] = [...current];
  save(all);
}

/** 상세를 열면 해당 카드의 새 카드 표시만 지운다. */
export function markCollectionCardSeen(deckId: string, slug: string): void {
  const all = load();
  const current = all[deckId] ?? [];
  if (!current.includes(slug)) return;
  const next = current.filter((item) => item !== slug);
  if (next.length > 0) all[deckId] = next;
  else delete all[deckId];
  save(all);
  notifyLocal("store");
}

/** 리딩 삭제·계정 전환 뒤 존재하지 않는 카드의 표시를 정리한다. */
export function pruneUnreadCollection(store: ArcanaStore): void {
  const all = load();
  let changed = false;
  for (const [deckId, slugs] of Object.entries(all)) {
    const encounters = store.collection[deckId] ?? {};
    const next = slugs.filter((slug) => slug in encounters);
    if (next.length === slugs.length) continue;
    changed = true;
    if (next.length > 0) all[deckId] = next;
    else delete all[deckId];
  }
  if (changed) save(all);
}

export function clearUnreadCollection(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // 로그아웃 동작은 읽음 표시 정리 실패로 막지 않는다.
  }
}
