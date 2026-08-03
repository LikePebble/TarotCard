"use client";

import { useCallback, useEffect, useState } from "react";
import { notifyLocal, subscribeLocal } from "@/lib/local-events";
import { localDateOf } from "@/lib/period";

export type PopupStore = Record<string, "forever" | string>;
export type PopupRecord = {
  id: string;
  imageUrl: string;
  imageAlt: string;
  linkUrl: string | null;
};

const KEY = "arcana.popup.v1";

export function loadPopup(): PopupStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as PopupStore) : {};
  } catch {
    return {};
  }
}

function savePopup(store: PopupStore) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(store));
    } catch {
      // storage unavailable; current UI state remains usable for this session
    }
  }
  notifyLocal("popup");
}

export function isDismissed(store: PopupStore, popupId: string, todayIso: string): boolean {
  const value = store[popupId];
  return value === "forever" || value === todayIso;
}

export function withDismissal(
  store: PopupStore,
  popupId: string,
  mode: "forever" | "today",
  todayIso: string,
): PopupStore {
  return { ...store, [popupId]: mode === "forever" ? "forever" : todayIso };
}

/** 앱 내부 경로는 현재 탭에서, 외부 URL은 새 탭에서 연다. */
export function popupLinkTarget(linkUrl: string): "_blank" | undefined {
  return linkUrl.startsWith("/") ? undefined : "_blank";
}

export function dismissPopup(popupId: string, mode: "forever" | "today", todayIso = localDateOf(new Date())) {
  const next = withDismissal(loadPopup(), popupId, mode, todayIso);
  savePopup(next);
  return next;
}

export function usePopup() {
  const [store, setStore] = useState<PopupStore | null>(null);
  const refresh = useCallback(() => setStore(loadPopup()), []);
  useEffect(() => {
    refresh();
    return subscribeLocal("popup", refresh);
  }, [refresh]);
  return { store, refresh };
}
