"use client";

import { cards } from "@/data/cards";
import { useCallback, useEffect, useState } from "react";
import { notifyLocal, subscribeLocal } from "@/lib/local-events";

/** 이 사용자가 가진 것. 클래식은 여기 안 넣는다(암묵 소유). */
export type Entitlements = { ownedDeckIds: string[]; adFree: boolean };

export const EMPTY_ENTITLEMENTS: Entitlements = {
  ownedDeckIds: [],
  adFree: false,
};

/** 78장 전체 슬러그. 소유 덱의 도감 완성도 기준. */
const ALL_SLUGS: ReadonlySet<string> = new Set(cards.map((c) => c.slug));

/** 클래식은 모두 소유. 프리미엄은 entitlements에 있을 때만. */
export function ownsDeck(deckId: string, ent: Entitlements): boolean {
  return deckId === "classic" || ent.ownedDeckIds.includes(deckId);
}

/** 도감 완성도 = 소유면 78, 아니면 0(부분 수집 없음). */
export function collectedCount(deckId: string, ent: Entitlements): number {
  return ownsDeck(deckId, ent) ? ALL_SLUGS.size : 0;
}

/** 소유 덱은 전체 슬러그, 미소유는 빈 집합. */
export function collectedSlugs(deckId: string, ent: Entitlements): Set<string> {
  return ownsDeck(deckId, ent) ? new Set(ALL_SLUGS) : new Set();
}

const KEY = "arcana.entitlements.v1";

/** 임의 값을 안전한 Entitlements로 정규화한다(순수). */
export function parseEntitlements(raw: unknown): Entitlements {
  if (!raw || typeof raw !== "object") return EMPTY_ENTITLEMENTS;
  const r = raw as Record<string, unknown>;
  const owned = Array.isArray(r.ownedDeckIds)
    ? r.ownedDeckIds.filter((x): x is string => typeof x === "string")
    : null;
  if (!owned) return EMPTY_ENTITLEMENTS;
  return { ownedDeckIds: owned, adFree: r.adFree === true };
}

export function loadEntitlements(): Entitlements {
  if (typeof window === "undefined") return EMPTY_ENTITLEMENTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? parseEntitlements(JSON.parse(raw)) : EMPTY_ENTITLEMENTS;
  } catch {
    return EMPTY_ENTITLEMENTS;
  }
}

export function setLocalEntitlements(e: Entitlements): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(e));
    } catch {
      // storage full/unavailable; 인메모리 의도는 아래 알림으로 전파.
    }
  }
  notifyLocal("entitlements");
}

/** 로그아웃 시 로컬 캐시를 비운다(다음 계정에 안 섞이게). */
export function clearLocalEntitlements(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      // 위와 같다.
    }
  }
  notifyLocal("entitlements");
}

/** Client 훅: 마운트 전에는 EMPTY(SSR 안전), 이후 로컬 캐시를 따른다. */
export function useEntitlements(): Entitlements {
  const [ent, setEnt] = useState<Entitlements>(EMPTY_ENTITLEMENTS);
  const refresh = useCallback(() => setEnt(loadEntitlements()), []);
  useEffect(() => {
    refresh();
    return subscribeLocal("entitlements", refresh);
  }, [refresh]);
  return ent;
}
