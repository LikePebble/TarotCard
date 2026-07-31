import { DEFAULT_DECK_ID } from "@/data/decks";
import { resolveDeckOnLogin } from "@/lib/deck-selection";
import { getStoredDeckId, setSelectedDeckId } from "@/lib/store";
import { getBrowserSupabase } from "@/lib/supabase/client";
import type { PullResult, SyncOutcome } from "@/lib/sync/outcome";

/**
 * 선택한 기본 덱의 원격 사본(`profiles.selected_deck_id`).
 *
 * 리딩·일기와 달리 이것은 프로필에 붙은 **스칼라 한 칸**이라 병합이랄 것이
 * 없다. 그래서 규칙은 `deck-selection.ts`에 순수 함수로 두고, 여기서는 왕복과
 * "무엇을 이미 올렸는지"만 다룬다.
 *
 * `profiles` 행은 가입 트리거가 만들어 두고 `authenticated`에는 insert 권한이
 * 없다. **upsert가 아니라 update를 쓴다** — upsert는 없는 행을 만들려다 권한
 * 오류로 떨어진다.
 *
 * 이 모듈은 **어떤 경우에도 throw하지 않는다.** 덱 선택은 선호값이고, 그것
 * 때문에 리딩이 막히면 안 된다. 미설정(게스트)이면 전부 "skipped"이고 로컬은
 * 그대로 둔다.
 */

/**
 * 이 사용자 앞으로 방금 올렸다고 아는 값. `server-knowledge.ts`와 같은 이유로
 * **메모리에만** 둔다 — 저장하면 서버와 어긋난 표식이 살아남아 "이미 올렸다"고
 * 착각한 선택이 영영 올라가지 않는다. 앎이 없어지는 쪽으로 틀리면 왕복 한 번을
 * 더 할 뿐이라 안전하다.
 *
 * 사용자 id로 키를 잡아 계정 전환 때 자동으로 무효가 되게 한다.
 */
let pushedFor: string | null = null;
let pushedDeck: string | null = null;

/** 서버의 선택을 읽는다. 미설정이면 skipped, 실패면 failed(로컬은 그대로). */
export async function pullRemoteDeck(
  userId: string,
): Promise<PullResult<string>> {
  const supabase = getBrowserSupabase();
  if (!supabase) return { outcome: "skipped" };
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("selected_deck_id")
      .eq("id", userId)
      .single();
    if (error || !data) {
      if (error) console.error("[sync] 덱 선택 pull 실패:", error.message);
      return { outcome: "failed" };
    }
    // 컬럼은 not null이지만 파손·스키마 변경에 대비해 값 쪽에서 한 번 더 막는다.
    const raw = (data as { selected_deck_id?: unknown }).selected_deck_id;
    const deckId = typeof raw === "string" && raw ? raw : DEFAULT_DECK_ID;
    return { outcome: "ok", data: deckId };
  } catch (e) {
    // 클라이언트가 결과 대신 던지는 경우(네트워크 계층의 예외)까지 여기서 막는다.
    // 이 호출은 reconcile의 Promise.all 안에 있어서, 새어 나간 예외 하나가 이미
    // 성공한 리딩·일기 병합까지 "중단됨"으로 되돌린다.
    console.error("[sync] 덱 선택 pull 중 예외:", e);
    return { outcome: "failed" };
  }
}

/** 이 값을 서버에 쓴다. 성공했을 때만 "올렸다"고 기억한다. */
async function pushSelectedDeck(
  userId: string,
  deckId: string,
): Promise<SyncOutcome> {
  const supabase = getBrowserSupabase();
  if (!supabase) return "skipped";
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ selected_deck_id: deckId })
      .eq("id", userId);
    if (error) {
      console.error("[sync] 덱 선택 push 실패:", error.message);
      return "failed"; // 메모를 갱신하지 않는다 — 다음 push가 다시 시도한다.
    }
  } catch (e) {
    // pushNow는 store·journal push가 끝난 **뒤에** 이것을 부른다. 여기서 예외가
    // 새어 나가면 pushNow의 catch가 이미 성공한 백업을 "error"로 표시한다 —
    // 선호값 하나가 백업 상태를 거짓말하게 두지 않는다.
    console.error("[sync] 덱 선택 push 중 예외:", e);
    return "failed";
  }
  pushedFor = userId;
  pushedDeck = deckId;
  return "ok";
}

/**
 * 서버와 로컬의 선택을 맞춘다. **로그인 최초 병합에서만 부른다.**
 *
 * 주기 갱신에서 부르지 않는 이유는 `pusher.ts`의 호출부에 적어 두었다.
 */
export async function reconcileSelectedDeck(
  userId: string,
  isStale: () => boolean = () => false,
): Promise<SyncOutcome> {
  const pulled = await pullRemoteDeck(userId);
  // 서버를 못 봤으면 아무 판단도 하지 않는다. 여기서 로컬을 건드리면
  // 네트워크 한 번 끊긴 것이 사용자의 선택을 되돌리는 일이 된다.
  if (pulled.outcome !== "ok") return pulled.outcome;
  // 로컬에 쓰기 **전에** 확인한다(store/journal/entitlements와 같은 규칙):
  // 로그아웃 뒤 늦게 끝난 pull이 비운 로컬을 되살리면 안 된다.
  if (isStale()) return "skipped";

  const remote = pulled.data;
  const local = getStoredDeckId();
  const resolved = resolveDeckOnLogin(local, remote);
  if (resolved !== local) setSelectedDeckId(resolved);
  if (resolved === remote) {
    // 서버가 이미 그 값이다. 올릴 것이 없으므로 왕복 없이 앎만 채운다.
    pushedFor = userId;
    pushedDeck = resolved;
    return "ok";
  }
  // 게스트로 고른 덱이 살아남았다 — 계정에도 남긴다.
  return pushSelectedDeck(userId, resolved);
}

/**
 * 로컬 저장값을 서버에 올린다(디바운스 push 경로).
 * 직전에 이 사용자 앞으로 올렸다고 아는 값과 같으면 왕복 자체를 건너뛴다.
 */
export async function pushLocalDeck(userId: string): Promise<SyncOutcome> {
  const deckId = getStoredDeckId();
  if (pushedFor === userId && pushedDeck === deckId) return "skipped";
  return pushSelectedDeck(userId, deckId);
}

/** 앎을 버린다(로그아웃). 다음 push는 다시 올린다. */
export function forgetPushedDeck(): void {
  pushedFor = null;
  pushedDeck = null;
}
