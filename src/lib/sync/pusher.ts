import { loadJournal } from "@/lib/journal";
import { loadStore } from "@/lib/store";
import { setSyncState } from "@/lib/sync/status";
import { syncJournalOnLogin, syncOnLogin } from "@/lib/sync/sync";
import { pushLocalJournal } from "@/lib/sync/journal-remote";
import { pushLocalStore } from "@/lib/sync/remote";

const DEBOUNCE_MS = 2000;

/** 로그인 중인 사용자 id. 없으면 push 자체를 하지 않는다(게스트). */
let currentUserId: string | null = null;
/** 이미 병합을 끝낸 사용자 id. 같은 세션에서 두 번 병합하지 않는다. */
let mergedFor: string | null = null;
/** 대기 중인 디바운스 타이머. */
let pendingTimer: ReturnType<typeof setTimeout> | null = null;
/** 동기화가 진행 중인지. 자기 자신이 유발한 알림을 걸러내는 데 쓴다. */
let syncing = false;

function cancelPending() {
  if (pendingTimer !== null) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
}

async function pushNow(): Promise<void> {
  const userId = currentUserId;
  if (!userId) return;
  syncing = true;
  setSyncState("syncing");
  try {
    await pushLocalStore(userId, loadStore());
    await pushLocalJournal(userId, loadJournal());
    setSyncState("ok");
  } catch (e) {
    console.error("[sync] push 중 예외:", e);
    setSyncState("error");
  } finally {
    syncing = false;
  }
}

/** 2초 디바운스 push 예약. 동기화 중이거나 게스트면 아무 일도 하지 않는다. */
export function schedulePush(): void {
  if (!currentUserId || syncing) return;
  cancelPending();
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    void pushNow();
  }, DEBOUNCE_MS);
}

/**
 * 세션 전이를 알린다. 새 사용자로 로그인하면 게스트→계정 병합을 실행한다.
 * null(로그아웃)이면 대기 중 push를 버리고 상태를 초기화한다.
 */
export function setSyncUser(userId: string | null): void {
  if (!userId) {
    currentUserId = null;
    mergedFor = null;
    cancelPending();
    return;
  }
  currentUserId = userId;
  if (mergedFor === userId) return;
  mergedFor = userId;
  void (async () => {
    syncing = true;
    setSyncState("syncing");
    try {
      await syncOnLogin(userId);
      await syncJournalOnLogin(userId);
      setSyncState("ok");
    } catch (e) {
      console.error("[sync] 로그인 병합 실패:", e);
      setSyncState("error");
    } finally {
      syncing = false;
    }
  })();
}

/**
 * 대기 중인 push를 지금 실행한다(로그아웃 직전 등).
 * timeoutMs 안에 끝나지 않으면 그냥 반환한다 — 호출자를 매달지 않는다.
 */
export async function flushPendingSync(timeoutMs = 3000): Promise<void> {
  cancelPending();
  if (!currentUserId) return;
  await Promise.race([
    pushNow(),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}
