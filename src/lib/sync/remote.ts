import { getBrowserSupabase } from "@/lib/supabase/client";
import type { ArcanaStore, ReadingRecord } from "@/lib/store";
import { recomputeCollection } from "@/lib/sync/merge";

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

/** 서버에서 유저의 리딩을 읽어 스토어로. 미설정이면 null. */
export async function pullRemoteStore(
  userId: string,
): Promise<ArcanaStore | null> {
  const supabase = getBrowserSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("readings")
    .select("*")
    .eq("user_id", userId);
  if (error || !data) return null;
  const readings = (data as ReadingRow[]).map(rowToReading);
  return { version: 2, collection: recomputeCollection(readings), readings };
}

/** 로컬 리딩을 서버에 멱등 upsert. 미설정이면 no-op. */
export async function pushLocalStore(
  userId: string,
  store: ArcanaStore,
): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase || store.readings.length === 0) return;
  const rows = store.readings.map((r) => readingToRow(userId, r));
  await supabase.from("readings").upsert(rows, { onConflict: "id" });
}
