"use client";

import { useEffect } from "react";
import { takeLoginPending, track } from "@/lib/analytics";
import { useSession } from "@/lib/auth/session";
import { subscribeLocal } from "@/lib/local-events";
import { schedulePush, setSyncUser } from "@/lib/sync/pusher";
import { recordVisit } from "@/lib/visit-streak";
import { wireRefreshTriggers } from "@/lib/sync/refresh-triggers";

/**
 * 로컬과 서버를 잇는 다리. UI를 렌더하지 않는다.
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

  /*
   * 오늘 첫 방문을 기록하고 한 번만 계측한다. 이 다리가 layout에 딱 하나뿐이라
   * 화면을 옮겨 다녀도 하루에 한 번으로 유지된다.
   *
   * 세션을 기다리지 않는다. 재방문은 게스트에게도 일어나고, 오히려 지금
   * 알아야 할 것이 게스트의 재방문이다. `recordVisit`이 같은 날 두 번째
   * 호출에서 아무것도 쓰지 않으므로 StrictMode의 이중 실행도 안전하다.
   */
  useEffect(() => {
    const { isFirstToday, dayGap, state } = recordVisit();
    if (!isFirstToday) return;
    // GA4 파라미터는 null을 받지 않는다. 첫 방문은 -1로 구분한다.
    track("daily_return", { day_gap: dayGap ?? -1, streak: state.streak });
  }, []);

  // 로컬이 바뀌면 디바운스 push.
  useEffect(() => {
    const offStore = subscribeLocal("store", schedulePush);
    const offJournal = subscribeLocal("journal", schedulePush);
    // 덱 선택도 여기로 잇는다. store.ts가 sync·supabase를 import하지 않는다는
    // 층 분리를 지키려면 통지 채널이 유일한 연결 수단이다.
    const offDeck = subscribeLocal("deck", schedulePush);
    return () => {
      offStore();
      offJournal();
      offDeck();
    };
  }, []);

  /*
   * 서버 변경을 내려받을 시점들. 로그인 병합은 페이지 로드당 한 번뿐이라
   * 그것만으로는 이 다리가 사실상 올리기 전용이 된다 — 다른 기기에서 남긴
   * 기록이 이 기기에 영영 나타나지 않는다.
   *
   * 배선 자체는 refresh-triggers.ts에 있다. 틀려도 화면에 증상이 없어서
   * 시험 가능한 자리에 두어야 하는 코드다.
   */
  useEffect(() => wireRefreshTriggers(document, window), []);

  return null;
}
