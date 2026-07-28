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

/**
 * 출시 기념 한정 프로모션: 프리미엄 덱을 열어 드린다(순수 판정).
 *
 * 정확히 "true"일 때만 켠다. 빈 문자열이나 오타("1", "TRUE")로 유료 덱이 통째로
 * 열리는 사고를 막기 위해서다. 판정을 순수 함수로 떼어 두면 process.env를 건드리지
 * 않고 양쪽 상태를 테스트할 수 있다(`releaseTestToolsEnabled`와 같은 방식).
 */
export function launchPromoDecksEnabled(flag: string | undefined): boolean {
  return flag === "true";
}

export const LAUNCH_PROMO_DECKS = launchPromoDecksEnabled(
  process.env.NEXT_PUBLIC_LAUNCH_PROMO_DECKS,
);

/**
 * 소유 판정의 순수 코어. 프로모션이 켜져 있으면 무엇을 회수했든 소유로 본다 —
 * 프로모션은 개발용 지급·회수보다 위에 있는 기간제 정책이므로, 회수 버튼이
 * 프로모션 상태를 뚫고 잠금을 되돌리면 안 된다.
 *
 * 이 코어는 로그인 여부를 모른다. "로그인하신 분께 드린다"는 성격은 화면 쪽
 * `collectionVisibility(signedIn, ...)`가 이미 걸러 주므로, 게스트에게 덱이
 * 열리는 일은 없다.
 */
export function deckOwnedBy(
  deckId: string,
  ent: Entitlements,
  launchPromoDecks: boolean,
): boolean {
  if (launchPromoDecks) return true;
  return deckId === "classic" || ent.ownedDeckIds.includes(deckId);
}

/** 클래식은 모두 소유. 프리미엄은 entitlements에 있을 때만(프로모션 중에는 전부). */
export function ownsDeck(deckId: string, ent: Entitlements): boolean {
  return deckOwnedBy(deckId, ent, LAUNCH_PROMO_DECKS);
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

/** 덱을 더한 새 엔타이틀먼트(순수, 멱등). */
export function grantedWith(ent: Entitlements, deckId: string): Entitlements {
  if (ent.ownedDeckIds.includes(deckId)) return ent;
  return { ...ent, ownedDeckIds: [...ent.ownedDeckIds, deckId] };
}

/** 개발용: 로컬 캐시에 덱을 지급/회수한다(서버 없이 소유 모델 검증). */
export function grantDeckLocal(deckId: string): void {
  setLocalEntitlements(grantedWith(loadEntitlements(), deckId));
}
export function revokeDeckLocal(deckId: string): void {
  const cur = loadEntitlements();
  setLocalEntitlements({
    ...cur,
    ownedDeckIds: cur.ownedDeckIds.filter((id) => id !== deckId),
  });
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

/**
 * 확정 여부까지 알려주는 변형. 마운트 전에는 null이다.
 *
 * `useEntitlements`는 마운트 전 EMPTY를 주므로 "아직 모른다"와 "아무것도 없다"가
 * 구분되지 않는다. 광고 제거 구매자에게 광고를 한 프레임 그렸다가 지우는 일을
 * 막으려면 그 구분이 필요하다(`JournalLink`가 쓰는 "확정 전에는 내보내지 않는다"
 * 패턴과 같다).
 */
export function useResolvedEntitlements(): Entitlements | null {
  const [ent, setEnt] = useState<Entitlements | null>(null);
  const refresh = useCallback(() => setEnt(loadEntitlements()), []);
  useEffect(() => {
    refresh();
    return subscribeLocal("entitlements", refresh);
  }, [refresh]);
  return ent;
}
