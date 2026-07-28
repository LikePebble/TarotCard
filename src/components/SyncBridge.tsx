"use client";

import { useEffect } from "react";
import { takeLoginPending, track } from "@/lib/analytics";
import { useSession } from "@/lib/auth/session";
import { subscribeLocal } from "@/lib/local-events";
import {
  REFRESH_INTERVAL_MS,
  refreshFromRemote,
  schedulePush,
  setSyncUser,
} from "@/lib/sync/pusher";

/**
 * 로컬 변경을 서버로 흘려보내는 다리. UI를 렌더하지 않는다.
 * layout에 한 번만 마운트한다. 게스트(미설정·미로그인)에서는 아무 일도 하지 않는다.
 */
export function SyncBridge() {
  const { user, loading, devSession } = useSession();

  // 세션 전이 → 로그인 병합 또는 정리.
  useEffect(() => {
    setSyncUser(devSession ? null : (user?.id ?? null));
  }, [devSession, user]);

  /*
   * 로그인 완료 계측. 이 다리는 layout에 딱 한 번 마운트되므로 전 화면에서
   * 유일한 관측 지점이 된다.
   *
   * "세션이 생겼다"만으로는 신규 로그인과 이미 로그인된 채 재방문한 경우를
   * 가를 수 없다 — OAuth는 전체 페이지 이동이라 돌아온 문서에서는 둘이
   * 똑같이 "로딩 후 사용자 등장"으로 보인다. 그래서 로그인을 시작할 때
   * 남겨 둔 표식을 회수하고, 표식이 있을 때만 보낸다.
   *
   * 표식 회수는 읽고 지우는 한 동작이라 그 자체가 중복 방지다. 세션이
   * 확정되기 전(loading)에는 회수하지 않는다.
   */
  useEffect(() => {
    if (loading || user === null) return;
    const method = takeLoginPending();
    if (method) track("login_completed", { method });
  }, [loading, user]);

  // 로컬이 바뀌면 디바운스 push.
  useEffect(() => {
    const offStore = subscribeLocal("store", schedulePush);
    const offJournal = subscribeLocal("journal", schedulePush);
    return () => {
      offStore();
      offJournal();
    };
  }, []);

  /*
   * 서버 변경을 내려받는다.
   *
   * 로그인 병합은 페이지 로드당 한 번뿐이라, 그것만으로는 이 다리가 사실상
   * 올리기 전용이 된다 — 다른 기기에서 남긴 기록이 이 기기에 영영 나타나지
   * 않는다. 탭으로 돌아왔을 때와 주기적으로 다시 맞춘다.
   *
   * 화면이 보이지 않는 동안에는 돌리지 않는다. 백그라운드 탭이 조용히
   * 왕복을 쌓아 봐야 볼 사람이 없다.
   */
  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") refreshFromRemote();
    };
    // 네트워크 복귀는 밀린 변경을 올릴 마지막 기회이기도 하다. 갱신이
    // 시작되면 그 안에 push가 들어 있고, 건너뛰었으면 push만 예약한다.
    const onOnline = () => {
      if (!refreshFromRemote({ force: true })) schedulePush();
    };
    const timer = setInterval(refreshIfVisible, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", refreshIfVisible);
    window.addEventListener("focus", refreshIfVisible);
    window.addEventListener("online", onOnline);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshIfVisible);
      window.removeEventListener("focus", refreshIfVisible);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return null;
}
