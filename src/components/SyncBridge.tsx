"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth/session";
import { subscribeLocal } from "@/lib/local-events";
import { schedulePush, setSyncUser } from "@/lib/sync/pusher";

/**
 * 로컬 변경을 서버로 흘려보내는 다리. UI를 렌더하지 않는다.
 * layout에 한 번만 마운트한다. 게스트(미설정·미로그인)에서는 아무 일도 하지 않는다.
 */
export function SyncBridge() {
  const { user, devSession } = useSession();

  // 세션 전이 → 로그인 병합 또는 정리.
  useEffect(() => {
    setSyncUser(devSession ? null : (user?.id ?? null));
  }, [devSession, user]);

  // 로컬이 바뀌면 디바운스 push.
  useEffect(() => {
    const offStore = subscribeLocal("store", schedulePush);
    const offJournal = subscribeLocal("journal", schedulePush);
    return () => {
      offStore();
      offJournal();
    };
  }, []);

  // 온라인 복귀 시 밀린 변경을 한 번에 올린다(전체 멱등 upsert라 이걸로 충분).
  useEffect(() => {
    const onOnline = () => schedulePush();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  return null;
}
