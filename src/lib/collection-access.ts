/**
 * 게스트의 로컬 리딩은 로그인 뒤 계정에 병합될 대기 기록이다.
 * 로그인 전에는 도감 수집·카드 해금으로 계산하지 않는다.
 */
export function collectionVisibility(
  signedIn: boolean,
  owns: boolean,
  encounters: Set<string>,
): { owns: boolean; encounters: Set<string> } {
  if (!signedIn) return { owns: false, encounters: new Set() };
  return { owns, encounters };
}
