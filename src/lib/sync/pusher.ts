import { loadJournal } from "@/lib/journal";
import { loadStore } from "@/lib/store";
import { setSyncState } from "@/lib/sync/status";
import { reconcileJournal, reconcileStore } from "@/lib/sync/sync";
import { pullRemoteEntitlements } from "@/lib/sync/entitlements-remote";
import { pushLocalJournal } from "@/lib/sync/journal-remote";
import { pushLocalStore } from "@/lib/sync/remote";

const DEBOUNCE_MS = 2000;

/** 주기 갱신 간격. 탭이 보이는 동안에만 돈다. */
export const REFRESH_INTERVAL_MS = 5 * 60_000;
/**
 * 갱신 최소 간격. 탭을 자주 오가도 왕복이 그만큼 늘지 않게 막는다.
 * 네트워크 복귀처럼 지금 맞춰야 하는 경우는 force로 건너뛴다.
 */
const REFRESH_MIN_INTERVAL_MS = 30_000;

/** 로그인 중인 사용자 id. 없으면 push 자체를 하지 않는다(게스트). */
let currentUserId: string | null = null;
/** 이미 병합을 끝낸 사용자 id. 같은 세션에서 두 번 병합하지 않는다. */
let mergedFor: string | null = null;
/** 대기 중인 디바운스 타이머. */
let pendingTimer: ReturnType<typeof setTimeout> | null = null;
/**
 * 진행 중인 동기화 작업 수. 자기 자신이 유발한 알림을 걸러내는 데 쓴다.
 * 불리언이면 겹친 두 작업 중 먼저 끝난 쪽이 나머지의 플래그까지 내려버린다.
 */
let inFlight = 0;
/**
 * 세션 세대. 진행 중인 서버 병합은 await 중간에 멈출 수 없으므로,
 * 세션이 바뀌면 세대를 올려 뒤늦게 끝난 병합이 로컬을 되살리지 못하게 한다.
 */
let epoch = 0;
/**
 * 동기화 중이라 삼킨 변경이 있는지. 그냥 버리면 그 기록은 다음 변경·재접속·
 * 로그아웃 때까지 서버에 올라가지 못한다.
 */
let dirty = false;
/**
 * 로그인 때 일기 pull이 성공했는지. 실패했으면 서버에 무엇이 있는지 모르므로
 * 이번 세션의 push는 서버 행을 지우면 안 된다.
 */
let journalPullOk = false;
/**
 * 진행 중인 동기화 작업(서버 병합 또는 push). 로그아웃 flush가 push를 겹쳐
 * 띄우는 대신 이것을 기다리게 해서, 병합이 끝난 뒤에 로컬을 비우게 한다.
 */
let activeSync: Promise<void> | null = null;
/** 마지막으로 서버 병합을 시작한 시각. 갱신 간격을 재는 기준. */
let lastReconcileAt = 0;

function cancelPending() {
  if (pendingTimer !== null) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
}

/** 작업이 모두 끝났고 그사이 삼킨 변경이 있으면 다시 예약한다. */
function endSync() {
  // 로그아웃이 카운터를 이미 0으로 되돌렸을 수 있으므로 음수로 내려가지 않게 한다.
  inFlight = Math.max(0, inFlight - 1);
  if (inFlight > 0 || !dirty) return;
  dirty = false;
  schedulePush();
}

/**
 * 이 사용자의 병합 완료 표시를 되돌린다. 중단된 병합은 아무것도 반영하지
 * 못했으므로 다시 시도할 수 있어야 한다. 이미 다른 사용자로 넘어갔다면
 * 그쪽 표시를 지우지 않는다.
 */
function releaseMerge(userId: string): void {
  if (mergedFor === userId) mergedFor = null;
}

async function pushNow(): Promise<void> {
  const userId = currentUserId;
  if (!userId) return;
  inFlight += 1;
  setSyncState("syncing");
  // await 사이에 로그아웃이 로컬을 비울 수 있으므로 두 스냅샷을 먼저 뜬다.
  const store = loadStore();
  const journal = loadJournal();
  try {
    const storePushed = await pushLocalStore(userId, store);
    const journalPushed = await pushLocalJournal(userId, journal, {
      prune: journalPullOk,
    });
    // 원격 계층은 예외 대신 결과를 돌려준다. 실패를 "ok"로 표시하면
    // 하지도 않은 백업을 했다고 말하는 셈이다.
    const failed = storePushed === "failed" || journalPushed === "failed";
    setSyncState(failed ? "error" : "ok");
  } catch (e) {
    console.error("[sync] push 중 예외:", e);
    setSyncState("error");
  } finally {
    endSync();
  }
}

/** pushNow를 "진행 중 작업"으로 등록해 실행한다. */
function startPush(): Promise<void> {
  const p: Promise<void> = pushNow().finally(() => {
    if (activeSync === p) activeSync = null;
  });
  activeSync = p;
  return p;
}

/** 이 병합이 로그인 최초 병합인지, 그 이후의 갱신인지. */
type ReconcileMode = "login" | "refresh";

/**
 * 서버와 로컬을 양방향으로 맞춘다: pull → 병합 → push.
 *
 * 로그인 직후의 게스트 병합과 이후의 주기 갱신이 같은 경로를 쓴다 — 하는
 * 일이 같기 때문이다. 로그인 때만 이걸 돌리면 다른 기기의 기록은 재접속
 * 전까지 이 기기에 나타나지 않는다.
 *
 * 갈리는 것은 일기의 날짜 충돌 규칙 하나뿐이다(S3a).
 */
async function reconcile(
  userId: string,
  isStale: () => boolean,
  mode: ReconcileMode,
): Promise<"ok" | "failed" | "stale"> {
  const storeOutcome = await reconcileStore(userId, isStale);
  if (isStale()) return "stale";
  const journal = await reconcileJournal(userId, isStale, {
    // 로그인 순간에는 계정에 쌓인 기록이 이 기기의 게스트 기록보다 우선한다.
    // 이후 갱신에서까지 그러면, 방금 이 기기에서 쓰고 아직 올라가지 못한
    // 글을 주기 갱신이 서버의 옛 사본으로 되돌린다.
    conflict: mode === "login" ? "remote" : "newer",
  });
  if (isStale()) return "stale";
  await pullRemoteEntitlements(isStale); // 엔타이틀먼트는 서버 권위 → pull만
  if (isStale()) return "stale";
  journalPullOk = journal.pullOk;
  return storeOutcome === "failed" || journal.outcome === "failed"
    ? "failed"
    : "ok";
}

/**
 * reconcile을 "진행 중 작업"으로 등록해 실행한다.
 * onIncomplete는 중단(스테일)·예외로 아무것도 반영하지 못했을 때 불린다.
 */
function runReconcile(
  userId: string,
  mode: ReconcileMode,
  onIncomplete: () => void,
): Promise<void> {
  const myEpoch = epoch;
  const isStale = () => epoch !== myEpoch;
  lastReconcileAt = Date.now();
  // 이 병합이 로컬 스냅샷을 다시 읽어 올리므로 대기 중인 push는 중복이다.
  cancelPending();
  inFlight += 1;
  setSyncState("syncing");
  const task = (async () => {
    try {
      const result = await reconcile(userId, isStale, mode);
      if (result === "stale") {
        onIncomplete();
        return;
      }
      setSyncState(result === "failed" ? "error" : "ok");
    } catch (e) {
      console.error("[sync] 서버 병합 실패:", e);
      onIncomplete();
      setSyncState("error");
    } finally {
      endSync();
    }
  })();
  const tracked: Promise<void> = task.finally(() => {
    if (activeSync === tracked) activeSync = null;
  });
  activeSync = tracked;
  return tracked;
}

/** 2초 디바운스 push 예약. 게스트면 아무 일도 하지 않는다. */
export function schedulePush(): void {
  const userId = currentUserId;
  if (!userId) return;
  if (inFlight > 0) {
    // 동기화가 끝난 뒤 다시 예약한다. 여기서 버리면 이 변경이 유실된다.
    dirty = true;
    return;
  }
  cancelPending();
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    // 예약과 발화 사이에 세션이 바뀌었으면 남의 계정에 올리지 않는다.
    if (currentUserId !== userId) return;
    void startPush();
  }, DEBOUNCE_MS);
}

/**
 * 서버 변경을 내려받아 로컬에 반영한다(탭 복귀·주기 갱신·네트워크 복귀).
 * 실제로 시작했는지 돌려준다 — 호출자가 대안(예: push만)을 고를 수 있게.
 *
 * 진행 중인 동기화가 있으면 건너뛴다. 갱신은 놓치면 유실되는 변경이 아니라
 * 다음 차례에 다시 하면 되는 일이다.
 */
export function refreshFromRemote(options: { force?: boolean } = {}): boolean {
  const userId = currentUserId;
  if (!userId || inFlight > 0) return false;
  const now = Date.now();
  if (!options.force && now - lastReconcileAt < REFRESH_MIN_INTERVAL_MS) {
    return false;
  }
  void runReconcile(userId, "refresh", () => {});
  return true;
}

/**
 * 세션 전이를 알린다. 새 사용자로 로그인하면 게스트→계정 병합을 실행한다.
 * null(로그아웃)이면 대기 중 push를 버리고 상태를 초기화한다.
 *
 * 같은 사용자로 다시 알려오는 것은 전이가 아니다. Supabase는 구독 즉시
 * INITIAL_SESSION을 쏘고 토큰 갱신마다 이벤트를 또 보내므로 한 로그인에
 * 여러 번 불린다. 그때마다 세대를 올리면 진행 중인 병합이 자기 자신 때문에
 * 스테일이 되어 pull 결과를 통째로 버린다.
 */
export function setSyncUser(userId: string | null): void {
  const changed = userId !== currentUserId;
  if (changed) epoch += 1;

  if (!userId) {
    currentUserId = null;
    mergedFor = null;
    journalPullOk = false;
    dirty = false;
    // 끝내 응답하지 않는 요청이 카운터를 붙들고 있으면 다음 세션이 통째로
    // 막힌다. 로그아웃은 항상 완전한 초기화여야 한다(S5).
    inFlight = 0;
    activeSync = null;
    cancelPending();
    return;
  }
  // 다른 계정으로 갈아탔다면 이전 계정 앞으로 잡아둔 예약은 버린다.
  if (changed) cancelPending();
  currentUserId = userId;
  if (mergedFor === userId) return;
  mergedFor = userId;
  void runReconcile(userId, "login", () => releaseMerge(userId));
}

/**
 * 대기 중인 push를 지금 실행한다(로그아웃 직전 등).
 * timeoutMs 안에 끝나지 않으면 그냥 반환한다 — 호출자를 매달지 않는다.
 *
 * 반환 직후 호출자가 로컬을 비우므로, 아직 도는 병합이 있으면 세대를 올려
 * 무효화한다. 그러지 않으면 늦게 끝난 병합이 지운 기록을 되살린다.
 */
export async function flushPendingSync(timeoutMs = 3000): Promise<void> {
  cancelPending();
  if (!currentUserId) return;
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    await Promise.race([
      activeSync ?? startPush(),
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, timeoutMs);
      }),
    ]);
  } finally {
    // 빠르게 끝났으면 진 쪽 타이머를 3초 동안 붙들고 있지 않는다.
    if (timer !== null) clearTimeout(timer);
    epoch += 1;
  }
}
