import { getBrowserSupabase } from "@/lib/supabase/client";
import type { ArcanaStore, ReadingRecord } from "@/lib/store";
import { recomputeEncounters } from "@/lib/sync/merge";
import type { PullResult, SyncOutcome } from "@/lib/sync/outcome";
import { knownReadingIds, rememberReadings } from "@/lib/sync/server-knowledge";

type ReadingRow = {
  id: string;
  created_at: string;
  local_date: string;
  iso_week: string;
  spread: string;
  type_id: string;
  category: string;
  deck_id: string;
  cards: string[];
  orientations: string[];
};

function rowToReading(r: ReadingRow): ReadingRecord {
  return {
    id: r.id,
    at: r.created_at,
    localDate: r.local_date,
    isoWeek: r.iso_week,
    spread: r.spread as ReadingRecord["spread"],
    typeId: r.type_id as ReadingRecord["typeId"],
    category: r.category,
    deckId: r.deck_id,
    cards: r.cards,
    orientations: r.orientations as ReadingRecord["orientations"],
  };
}

function readingToRow(
  userId: string,
  r: ReadingRecord,
): ReadingRow & { user_id: string } {
  return {
    user_id: userId,
    id: r.id,
    created_at: r.at,
    local_date: r.localDate,
    iso_week: r.isoWeek,
    spread: r.spread,
    type_id: r.typeId,
    category: r.category,
    deck_id: r.deckId,
    cards: r.cards,
    orientations: r.orientations,
  };
}

/** 서버에서 유저의 리딩을 읽어 스토어로. 미설정이면 skipped, 실패면 failed. */
export async function pullRemoteStore(
  userId: string,
): Promise<PullResult<ArcanaStore>> {
  const supabase = getBrowserSupabase();
  if (!supabase) return { outcome: "skipped" };
  const { data, error } = await supabase
    .from("readings")
    .select("*")
    .eq("user_id", userId);
  if (error || !data) {
    if (error) console.error("[sync] 리딩 pull 실패:", error.message);
    return { outcome: "failed" };
  }
  const readings = (data as ReadingRow[]).map(rowToReading);
  // 방금 서버에 무엇이 있는지 봤다. 이후 push는 이 목록에 없는 것만 올린다.
  rememberReadings(
    userId,
    readings.map((r) => r.id),
  );
  return {
    outcome: "ok",
    data: { version: 2, collection: recomputeEncounters(readings), readings },
  };
}

/**
 * 로컬 리딩을 서버에 멱등 upsert. 미설정·빈 스토어·올릴 것 없으면 skipped.
 * 호출자가 성공 여부로 상태를 표시하므로 결과를 반드시 돌려준다(삼켜서는 안 된다).
 *
 * **아직 서버에 없다고 아는 것만 올린다.** 리딩은 한 번 기록되면 바뀌지 않는
 * append-only 기록이라(`withReadingRecorded`는 덧붙이기만 한다) 이미 올라간
 * 행을 다시 밀어 넣을 이유가 없다. 앎이 없으면 종전대로 전부 올린다.
 */
export async function pushLocalStore(
  userId: string,
  store: ArcanaStore,
): Promise<SyncOutcome> {
  const supabase = getBrowserSupabase();
  if (!supabase) return "skipped";
  if (store.readings.length === 0) return "skipped";

  const known = knownReadingIds(userId);
  const pending = known
    ? store.readings.filter((r) => !known.has(r.id))
    : store.readings;
  if (pending.length === 0) return "skipped";

  const rows = pending.map((r) => readingToRow(userId, r));
  const { error } = await supabase
    .from("readings")
    .upsert(rows, { onConflict: "user_id,id" });
  if (error) {
    console.error("[sync] 리딩 push 실패:", error.message);
    return "failed"; // 앎은 그대로 둔다 — 다음 push가 다시 시도한다.
  }
  rememberReadings(
    userId,
    store.readings.map((r) => r.id),
  );
  return "ok";
}
