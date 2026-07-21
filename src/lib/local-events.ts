/**
 * 로컬 저장(localStorage)이 바뀌었다는 사실을 알리는 채널.
 *
 * 저장 함수가 여기에 알리고, 화면 훅과 SyncBridge가 각각 구독한다.
 * 덕분에 호출부는 "저장"만 하면 되고 UI 갱신·서버 push를 몰라도 된다.
 * 의존성이 없어야 store/journal이 sync·supabase를 import하지 않는다.
 */
export type LocalChannel = "store" | "journal";

const subscribers: Record<LocalChannel, Set<() => void>> = {
  store: new Set(),
  journal: new Set(),
};

/** 채널을 구독한다. 반환값을 호출하면 해지된다. */
export function subscribeLocal(ch: LocalChannel, fn: () => void): () => void {
  subscribers[ch].add(fn);
  return () => {
    subscribers[ch].delete(fn);
  };
}

/** 채널 구독자에게 변경을 알린다. 한 구독자가 던져도 나머지는 계속 받는다. */
export function notifyLocal(ch: LocalChannel): void {
  for (const fn of [...subscribers[ch]]) {
    try {
      fn();
    } catch (e) {
      console.error("[local-events] 구독자 오류:", e);
    }
  }
}
