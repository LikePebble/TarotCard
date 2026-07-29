import {
  REFRESH_INTERVAL_MS,
  refreshFromRemote,
  schedulePush,
} from "@/lib/sync/pusher";

/** 배선에 필요한 만큼만. 테스트가 가짜를 넘길 수 있게 좁게 잡는다. */
type RefreshDoc = {
  visibilityState: DocumentVisibilityState;
  addEventListener: (type: string, fn: () => void) => void;
  removeEventListener: (type: string, fn: () => void) => void;
};
type RefreshWin = {
  addEventListener: (type: string, fn: () => void) => void;
  removeEventListener: (type: string, fn: () => void) => void;
  setInterval: (fn: () => void, ms: number) => ReturnType<typeof setInterval>;
  clearInterval: (id: ReturnType<typeof setInterval>) => void;
};

/**
 * 서버 변경을 내려받을 시점들을 건다(S9). 해제 함수를 돌려준다.
 *
 * 컴포넌트가 아니라 여기 있는 이유: 이 배선이 틀리면 주기 갱신이 통째로
 * 죽는데 화면에는 아무 증상이 없다. 리포 규약상 React 컴포넌트는
 * 유닛테스트하지 않으므로, 시험할 수 있는 자리로 옮겨 둔다.
 *
 * 화면이 보이지 않는 동안에는 돌리지 않는다 — 백그라운드 탭이 조용히
 * 왕복을 쌓아 봐야 볼 사람이 없다.
 */
export function wireRefreshTriggers(
  doc: RefreshDoc,
  win: RefreshWin,
): () => void {
  const refreshIfVisible = () => {
    if (doc.visibilityState === "visible") refreshFromRemote();
  };
  // 네트워크 복귀는 밀린 변경을 올릴 마지막 기회이기도 하다. 갱신이
  // 시작되면 그 안에 push가 들어 있고, 건너뛰었으면 push만 예약한다.
  const onOnline = () => {
    if (!refreshFromRemote({ force: true })) schedulePush();
  };

  const timer = win.setInterval(refreshIfVisible, REFRESH_INTERVAL_MS);
  doc.addEventListener("visibilitychange", refreshIfVisible);
  win.addEventListener("focus", refreshIfVisible);
  win.addEventListener("online", onOnline);

  return () => {
    win.clearInterval(timer);
    doc.removeEventListener("visibilitychange", refreshIfVisible);
    win.removeEventListener("focus", refreshIfVisible);
    win.removeEventListener("online", onOnline);
  };
}
