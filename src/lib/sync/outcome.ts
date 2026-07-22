/** 원격 호출의 결과. "skipped"는 Supabase 미설정·미로그인 등 시도 자체를 안 한 경우다. */
export type SyncOutcome = "ok" | "failed" | "skipped";

/** pull 결과. 실패와 "설정이 없어 건너뜀"을 구분해야 prune 여부를 판단할 수 있다. */
export type PullResult<T> =
  | { outcome: "ok"; data: T }
  | { outcome: "failed" | "skipped" };
