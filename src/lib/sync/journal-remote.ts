import { getBrowserSupabase } from "@/lib/supabase/client";
import type { JournalStore } from "@/lib/journal";
import type { PullResult, SyncOutcome } from "@/lib/sync/outcome";
import { knownJournal, rememberJournal } from "@/lib/sync/server-knowledge";

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
 *
 * 2026-07-28: 서버 상태를 알 때는 **지울 날짜만 짚어** 지우므로 이 경로를
 * 타지 않는다. 앎이 없는 첫 push에서만 쓰인다.
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
  // 방금 서버에 무엇이 있는지 봤다. 이후 push는 달라진 날짜만 올리고,
  // 정리도 여기 있는데 로컬에 없는 날짜만 짚어 지운다.
  rememberJournal(
    userId,
    Object.entries(store).map(([date, e]) => [date, e.updatedAt] as const),
  );
  return { outcome: "ok", data: store };
}

/**
 * 로컬 일기를 서버에 반영한다. 미설정이면 no-op.
 * upsert 먼저, 그 다음 options.prune이면 로컬에 없는 서버 행 삭제(로컬이 권위).
 * 로컬이 비어 있으면 삭제하지 않는다 — 파손된 localStorage가 백업을 지우지 못하게.
 *
 * 지운 날은 **톰스톤(빈 본문)으로 올라간다.** 행을 지우면 다른 기기가 그것을
 * "아직 안 올린 새 글"과 구분하지 못해 삭제를 되살린다(journal.ts 참조).
 *
 * options는 선택 인자가 아니다. 서버 내용을 모르는 채(=pull 실패) 지우는 것은
 * 백업을 날리는 일이라, 호출자가 매번 prune 여부를 명시하게 강제한다.
 *
 * 2026-07-28: 서버 상태를 알면 **달라진 날짜만 올리고 지울 날짜만 짚어 지운다.**
 * 대개는 둘 다 비어 왕복이 통째로 사라진다 — 종전에는 일기 한 줄을 고칠 때마다
 * 전체를 다시 올리고 모든 날짜를 나열한 삭제 요청을 함께 보냈다.
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

  const local = dates.map((date) => [date, store[date].updatedAt] as const);
  const known = knownJournal(userId);
  /** 앎이 없으면 전부 올린다 — 모르는 쪽으로 틀렸을 때 안전한 방향. */
  const changed = known
    ? dates.filter((d) => known.get(d) !== store[d].updatedAt)
    : dates;
  /**
   * 서버에 있다고 아는데 로컬에 아예 없는 날짜.
   *
   * 톰스톤 도입 이후 삭제는 **행을 지우는 대신 빈 본문으로 남기므로**, 지운
   * 날짜도 로컬에 남아 여기 걸리지 않는다. 실질적으로는 톰스톤 이전에 지운
   * 기록만 지나는 마이그레이션 경로다. 남겨 두는 이유는 S4a의 안전망 —
   * pull이 성공했을 때만 돌고, 로컬이 비면 아예 오지 않는다.
   */
  const removed = known
    ? [...known.keys()].filter((d) => !(d in store))
    : null;

  if (changed.length > 0) {
    const rows = changed.map((date) => ({
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
      return "failed"; // upsert가 실패했으면 삭제도 하지 않는다. 앎도 그대로.
    }
  }

  /** 정리를 건너뛰거나 실패했을 때의 서버 상태 = 알던 것 + 방금 올린 것. */
  const keptAndLocal = () => [...(known ?? []), ...local];

  if (!options.prune) {
    rememberJournal(userId, keptAndLocal());
    return "ok";
  }
  if (removed && removed.length === 0) {
    rememberJournal(userId, local); // 지울 것이 없다 — 왕복 자체를 건너뛴다.
    return "ok";
  }

  const query = supabase.from("journal_entries").delete().eq("user_id", userId);
  const { error: delError } = await (removed
    ? query.in("entry_date", removed)
    : query.not("entry_date", "in", journalPruneFilter(dates)));
  if (delError) {
    console.error("[sync] 일기 정리 실패:", delError.message);
    rememberJournal(userId, keptAndLocal()); // 지우려던 행이 아직 서버에 있다.
    return "failed";
  }
  rememberJournal(userId, local);
  return "ok";
}
