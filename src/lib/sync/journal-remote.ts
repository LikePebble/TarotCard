import { getBrowserSupabase } from "@/lib/supabase/client";
import type { JournalStore } from "@/lib/journal";
import type { PullResult, SyncOutcome } from "@/lib/sync/outcome";

type JournalRow = {
  entry_date: string; // YYYY-MM-DD
  body: string;
  updated_at: string; // ISO
};

/**
 * PostgREST `not.in` 필터 값. 날짜는 호출 전에 형식 검증된 것만 들어온다.
 *
 * 이 문자열은 URL 쿼리 파라미터로 나가고 항목당 인코딩 기준 22자쯤 늘어난다.
 * 몇 년치 일기를 쌓은 사용자는 흔한 URI 길이 상한을 넘길 수 있다. 그때의
 * 실패 양상은 삭제 요청이 에러로 로깅되는 것뿐이라 데이터가 사라지진 않는다.
 */
export function journalPruneFilter(dates: string[]): string {
  return `(${dates.map((d) => `"${d}"`).join(",")})`;
}

/** 서버에서 유저의 일기를 읽어 date -> entry 맵으로. 미설정이면 skipped, 실패면 failed. */
export async function pullRemoteJournal(
  userId: string,
): Promise<PullResult<JournalStore>> {
  const supabase = getBrowserSupabase();
  if (!supabase) return { outcome: "skipped" };
  const { data, error } = await supabase
    .from("journal_entries")
    .select("entry_date, body, updated_at")
    .eq("user_id", userId);
  if (error || !data) {
    if (error) console.error("[sync] 일기 pull 실패:", error.message);
    return { outcome: "failed" };
  }
  const store: JournalStore = {};
  for (const row of data as JournalRow[]) {
    store[row.entry_date] = {
      body: row.body,
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }
  return { outcome: "ok", data: store };
}

/**
 * 로컬 일기를 서버에 반영한다. 미설정이면 no-op.
 * upsert 먼저, 그 다음 options.prune이면 로컬에 없는 서버 행 삭제(로컬이 권위).
 * 로컬이 비어 있으면 삭제하지 않는다 — 파손된 localStorage가 백업을 지우지 못하게.
 *
 * options는 선택 인자가 아니다. 서버 내용을 모르는 채(=pull 실패) 지우는 것은
 * 백업을 날리는 일이라, 호출자가 매번 prune 여부를 명시하게 강제한다.
 */
export async function pushLocalJournal(
  userId: string,
  store: JournalStore,
  options: { prune: boolean },
): Promise<SyncOutcome> {
  const supabase = getBrowserSupabase();
  if (!supabase) return "skipped";

  // 날짜 형식을 검증한다. 아래 delete 필터는 문자열로 조립되므로,
  // 파손된 localStorage의 임의 키가 필터에 섞여 들어가면 안 된다.
  const dates = Object.keys(store).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  if (dates.length === 0) return "skipped";

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
    return "failed"; // upsert가 실패했으면 삭제도 하지 않는다.
  }

  if (!options.prune) return "ok";

  const { error: delError } = await supabase
    .from("journal_entries")
    .delete()
    .eq("user_id", userId)
    .not("entry_date", "in", journalPruneFilter(dates));
  if (delError) {
    console.error("[sync] 일기 정리 실패:", delError.message);
    return "failed";
  }
  return "ok";
}
