import { getBrowserSupabase } from "@/lib/supabase/client";
import type { ArcanaStore, ReadingRecord } from "@/lib/store";
import { recomputeCollection } from "@/lib/sync/merge";
import type { PullResult, SyncOutcome } from "@/lib/sync/outcome";

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
  return {
    outcome: "ok",
    data: { version: 2, collection: recomputeCollection(readings), readings },
  };
}

/**
 * 로컬 리딩을 서버에 멱등 upsert. 미설정·빈 스토어면 skipped.
 * 호출자가 성공 여부로 상태를 표시하므로 결과를 반드시 돌려준다(삼켜서는 안 된다).
 */
export async function pushLocalStore(
  userId: string,
  store: ArcanaStore,
): Promise<SyncOutcome> {
  const supabase = getBrowserSupabase();
  if (!supabase) return "skipped";
  if (store.readings.length === 0) return "skipped";
  const rows = store.readings.map((r) => readingToRow(userId, r));
  const { error } = await supabase
    .from("readings")
    .upsert(rows, { onConflict: "id" });
  if (error) {
    console.error("[sync] 리딩 push 실패:", error.message);
    return "failed";
  }
  return "ok";
}
