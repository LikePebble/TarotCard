/**
 * 서버에 무엇이 있는지에 대한 **이 세션의 앎.**
 *
 * pull이 채우고 push가 갱신한다. 이 앎이 있으면 push는 바뀐 것만 올리고,
 * 일기 정리는 지울 날짜만 짚어 지운다. 없으면 종전대로 전부 올리고 모든
 * 날짜를 나열한 필터로 지운다.
 *
 * **메모리에만 둔다.** 새로고침하면 어차피 pull이 먼저 돌아 다시 채워진다.
 * 저장해 두면 서버와 어긋난 표식이 조용히 살아남아, "이미 올렸다"고 착각한
 * 기록이 영영 올라가지 않는 사고가 난다. 모를 때(null)의 동작이 항상 "전부
 * 올린다"라서 **앎이 없어지는 쪽으로 틀려도 안전하다** — 반대 방향만 위험하다.
 */

/** 서버에 있다고 아는 일기: 날짜 → updatedAt. */
export type JournalKnowledge = ReadonlyMap<string, string>;

/** 앎은 한 사용자 것만 들고 있는다. 계정이 바뀌면 통째로 버린다. */
let owner: string | null = null;
let readingIds: Set<string> | null = null;
let journal: Map<string, string> | null = null;

function claim(userId: string): void {
  if (owner === userId) return;
  owner = userId;
  readingIds = null;
  journal = null;
}

/** 서버에 있다고 아는 리딩 id. 모르면 null. */
export function knownReadingIds(userId: string): ReadonlySet<string> | null {
  return owner === userId ? readingIds : null;
}

/** 서버에 있다고 아는 일기. 모르면 null. */
export function knownJournal(userId: string): JournalKnowledge | null {
  return owner === userId ? journal : null;
}

/**
 * 리딩에 대한 앎을 이 목록으로 **교체**한다.
 * 호출자는 왕복이 끝난 뒤의 완전한 서버 상태를 넘긴다.
 */
export function rememberReadings(
  userId: string,
  ids: Iterable<string>,
): void {
  claim(userId);
  readingIds = new Set(ids);
}

/** 일기에 대한 앎을 이 목록으로 **교체**한다. 위와 같다. */
export function rememberJournal(
  userId: string,
  entries: Iterable<readonly [string, string]>,
): void {
  claim(userId);
  journal = new Map(entries);
}

/** 앎을 버린다(로그아웃). 다음 push는 다시 전부 올린다. */
export function forgetServerKnowledge(): void {
  owner = null;
  readingIds = null;
  journal = null;
}
