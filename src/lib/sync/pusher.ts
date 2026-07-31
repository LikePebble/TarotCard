import { loadJournal } from "@/lib/journal";
import { loadStore } from "@/lib/store";
import type { SyncOutcome } from "@/lib/sync/outcome";
import { setSyncState } from "@/lib/sync/status";
import { reconcileJournal, reconcileStore } from "@/lib/sync/sync";
import { pullRemoteEntitlements } from "@/lib/sync/entitlements-remote";
import {
  forgetPushedDeck,
  pushLocalDeck,
  reconcileSelectedDeck,
} from "@/lib/sync/deck-remote";
import { pushLocalJournal } from "@/lib/sync/journal-remote";
import { pushLocalStore } from "@/lib/sync/remote";
import { forgetServerKnowledge } from "@/lib/sync/server-knowledge";
import { hasMergedWith, rememberMergedWith } from "@/lib/sync/first-merge";

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
 * 가장 최근 병합에서 일기 pull이 성공했는지. 실패했으면 서버에 무엇이 있는지
 * 모르므로 그 뒤의 push는 서버 행을 지우면 안 된다. 병합마다 갱신된다.
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

/**
 * 이 결과를 상태 표시에 반영해도 되는지. 로그아웃이 끝난 뒤 뒤늦게 도착한
 * push가 이전 계정의 "마지막 동기화 시각"을 되살리면, 다음 사용자가 남의
 * 동기화 시각을 보게 된다 — 로그아웃이 지운 바로 그 표시다.
 */
function stillCurrent(userId: string): boolean {
  return currentUserId === userId;
}

async function pushNow(userId: string): Promise<void> {
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
    await pushLocalDeck(userId);
    // 원격 계층은 예외 대신 결과를 돌려준다. 실패를 "ok"로 표시하면
    // 하지도 않은 백업을 했다고 말하는 셈이다.
    //
    // 덱 결과는 일부러 여기 넣지 않는다. 동기화 배지가 답하는 질문은 "내 기록이
    // 서버에 있는가"이고, 덱은 선호값이라 그 답을 바꾸지 않는다. 실패는 로그로
    // 남고 다음 push가 다시 시도한다.
    const failed = storePushed === "failed" || journalPushed === "failed";
    if (stillCurrent(userId)) setSyncState(failed ? "error" : "ok");
  } catch (e) {
    console.error("[sync] push 중 예외:", e);
    if (stillCurrent(userId)) setSyncState("error");
  } finally {
    endSync();
  }
}

/**
 * pushNow를 "진행 중 작업"으로 등록해 실행한다.
 * userId를 인자로 받는 이유: 로그아웃 flush는 세션을 내려놓은 뒤에도 마지막
 * push를 마저 올려야 한다.
 */
function startPush(userId: string): Promise<void> {
  const p: Promise<void> = pushNow(userId).finally(() => {
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
 * 모드로 갈리는 것은 둘뿐이다: 일기의 날짜 충돌 규칙(S3a)과, 최초 병합에서만
 * 도는 덱 선택.
 */
async function reconcile(
  userId: string,
  isStale: () => boolean,
  mode: ReconcileMode,
): Promise<"ok" | "failed" | "stale"> {
  // 리딩·일기·엔타이틀먼트·덱은 서로 독립이다. 직렬로 돌리면 왕복이 그대로
  // 더해진다 — 로그인 병합이 왕복 6~7회였던 이유가 이것이다. 각 갈래 안에서는
  // pull이 push보다 먼저라는 순서가 그대로 지켜진다.
  const [storeOutcome, journal] = await Promise.all([
    reconcileStore(userId, isStale),
    reconcileJournal(userId, isStale, {
      // 로그인 순간에는 계정에 쌓인 기록이 이 기기의 게스트 기록보다 우선한다.
      // 이후 갱신에서까지 그러면, 방금 이 기기에서 쓰고 아직 올라가지 못한
      // 글을 주기 갱신이 서버의 옛 사본으로 되돌린다.
      conflict: mode === "login" ? "remote" : "newer",
    }),
    pullRemoteEntitlements(userId, isStale), // 엔타이틀먼트는 서버 권위 → pull만
    // 덱 선택은 **최초 병합에서만** 서버를 당겨온다. 이 값에는 타임스탬프가
    // 없어 LWW로 물러설 수단이 없으므로, 갱신마다 pull하면 방금 이 기기에서
    // 고르고 아직 못 올린 선택을 서버의 옛 값이 되돌린다(일기가 refresh에서
    // "remote"를 쓰지 않는 것과 같은 이유). 대가는 다른 기기의 덱 변경이 이
    // 기기의 다음 최초 병합 전까지 보이지 않는다는 것이고, 기기별 선호값으로서
    // 수용한다.
    mode === "login"
      ? reconcileSelectedDeck(userId, isStale)
      : Promise.resolve<SyncOutcome>("skipped"),
  ]);
  if (isStale()) return "stale";
  journalPullOk = journal.pullOk;
  // 서버 일기를 실제로 본 순간이 "게스트→계정 첫 만남"이 끝난 시점이다.
  // 여기를 지나면 이 기기의 재로드는 LWW로 돌아간다(S3a).
  if (mode === "login" && journal.pullOk) rememberMergedWith(userId);
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
      if (!isStale()) setSyncState("error");
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
    void startPush(userId);
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
    // 다음 세션은 서버에 무엇이 있는지 모르는 데서 출발해야 한다. 남겨 두면
    // 이미 올렸다고 착각한 기록이 영영 올라가지 않는다.
    forgetServerKnowledge();
    // 덱도 같다: 다음 세션은 서버에 무엇이 있는지 모르는 데서 출발해야 한다.
    forgetPushedDeck();
    cancelPending();
    return;
  }
  // 다른 계정으로 갈아탔다면 이전 계정 앞으로 잡아둔 예약은 버린다.
  if (changed) cancelPending();
  currentUserId = userId;
  if (mergedFor === userId) return;
  mergedFor = userId;
  // "최초"는 이 기기가 이 계정과 처음 만나는 것이지, 페이지를 새로 여는
  // 것이 아니다. mergedFor는 모듈 상태라 새로고침마다 비므로 여기서
  // 재지 않는다 — 그러면 세션 복원마다 서버 우선이 되어, 아직 올라가지
  // 못한 이 계정 본인의 수정이 서버의 옛 사본으로 덮인다(S3a).
  const mode: ReconcileMode = hasMergedWith(userId) ? "refresh" : "login";
  void runReconcile(userId, mode, () => releaseMerge(userId));
}

/** work가 끝나거나 남은 시간이 다하거나, 둘 중 먼저. 호출자를 매달지 않는다. */
async function raceTimeout(work: Promise<void>, ms: number): Promise<void> {
  if (ms <= 0) return;
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    await Promise.race([
      work,
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      }),
    ]);
  } finally {
    // 빠르게 끝났으면 진 쪽 타이머를 남은 시간 내내 붙들고 있지 않는다.
    if (timer !== null) clearTimeout(timer);
  }
}

/**
 * 대기 중인 push를 지금 실행한다(로그아웃 직전).
 * timeoutMs 안에 끝나지 않으면 그냥 반환한다 — 호출자를 매달지 않는다.
 *
 * **반환 시점에 이 세션은 끝난 것으로 친다.** 호출자가 곧 로컬을 비우는데,
 * 세대만 올리고 `currentUserId`를 남겨 두면 이어지는 `signOut()` 왕복 중에
 * 주기 갱신이 **새 세대로** reconcile을 띄울 수 있다. 그 pull은 스테일이
 * 아니므로 방금 비운 로컬에 이전 계정의 서버 데이터를 되살린다.
 */
export async function flushPendingSync(timeoutMs = 3000): Promise<void> {
  cancelPending();
  const userId = currentUserId;
  if (!userId) return;

  const startedAt = Date.now();
  const remaining = () => timeoutMs - (Date.now() - startedAt);

  try {
    await raceTimeout(activeSync ?? startPush(userId), remaining());

    /*
     * 진행 중이던 작업 도중에 들어온 저장은 그 작업의 스냅샷에 없다. S6a대로
     * dirty로 기억됐다가 endSync가 2초 디바운스로 재예약하는데, 곧 도착할
     * setSyncUser(null)이 그 타이머를 죽인다. 그러면 flush는 **알면서 빠뜨리고**
     * 성공 반환한 셈이 된다 — S5a가 수용한 것은 "flush 실패 시의 델타"까지다.
     * 남은 시간이 있으면 한 번 더 올린다.
     */
    if (inFlight === 0 && (dirty || pendingTimer !== null)) {
      dirty = false;
      cancelPending();
      await raceTimeout(startPush(userId), remaining());
    }
  } finally {
    // 이 뒤로 새 병합·push가 시작되지 않게 세션을 내려놓는다. 뒤늦게 끝나는
    // 작업은 세대가 올라가 무효화된다. setSyncUser(null)이 곧 도착하지만
    // 그것은 React effect라 다음 렌더 틱까지 늦을 수 있다.
    currentUserId = null;
    epoch += 1;
  }
}
