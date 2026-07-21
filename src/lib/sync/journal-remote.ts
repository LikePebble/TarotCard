import { getBrowserSupabase } from "@/lib/supabase/client";
import type { JournalStore } from "@/lib/journal";

type JournalRow = {
  entry_date: string; // YYYY-MM-DD
  body: string;
  updated_at: string; // ISO
};

/** 서버에서 유저의 일기를 읽어 date -> entry 맵으로. 미설정/실패면 null. */
export async function pullRemoteJournal(
  userId: string,
): Promise<JournalStore | null> {
  const supabase = getBrowserSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("journal_entries")
    .select("entry_date, body, updated_at")
    .eq("user_id", userId);
  if (error || !data) {
    if (error) console.error("[sync] 일기 pull 실패:", error.message);
    return null;
  }
  const store: JournalStore = {};
  for (const row of data as JournalRow[]) {
    store[row.entry_date] = {
      body: row.body,
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }
  return store;
}

/**
 * 로컬 일기를 서버에 반영한다. 미설정이면 no-op.
 * upsert 먼저, 그 다음 로컬에 없는 서버 행 삭제(로컬이 권위).
 * 로컬이 비어 있으면 삭제하지 않는다 — 파손된 localStorage가 백업을 지우지 못하게.
 */
export async function pushLocalJournal(
  userId: string,
  store: JournalStore,
): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase) return;

  // 날짜 형식을 검증한다. 아래 delete 필터는 문자열로 조립되므로,
  // 파손된 localStorage의 임의 키가 필터에 섞여 들어가면 안 된다.
  const dates = Object.keys(store).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  if (dates.length === 0) return;

  const rows = dates.map((date) => ({
    user_id: userId,
    entry_date: date,
    body: store[date].body,
    updated_at: store[date].updatedAt,
  }));
  const { error } = await supabase
    .from("journal_entries")
    .upsert(rows, { onConflict: "user_id,entry_date" });
  if (error) {
    console.error("[sync] 일기 push 실패:", error.message);
    return; // upsert가 실패했으면 삭제도 하지 않는다.
  }

  const { error: delError } = await supabase
    .from("journal_entries")
    .delete()
    .eq("user_id", userId)
    .not("entry_date", "in", `(${dates.map((d) => `"${d}"`).join(",")})`);
  if (delError) console.error("[sync] 일기 정리 실패:", delError.message);
}
