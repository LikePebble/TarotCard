/**
 * 게스트의 로컬 리딩은 로그인 뒤 계정에 병합될 대기 기록이다.
 * 로그인 전에는 도감 수집·카드 해금으로 계산하지 않는다.
 */
export function collectionVisibility(
  signedIn: boolean,
  owns: boolean,
  encounters: Set<string>,
  deckId: string,
): { owns: boolean; encounters: Set<string> } {
  if (!signedIn && deckId !== "classic") {
    return { owns: false, encounters: new Set() };
  }
  return { owns, encounters };
}

/** 클래식은 누구나 전 카드를 바로 볼 수 있으므로 로그인 수집 유도가 필요 없다. */
export function shouldPromptGuestCollection(
  signedIn: boolean,
  deckId: string,
): boolean {
  return !signedIn && deckId !== "classic";
}
