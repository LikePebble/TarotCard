export type DeckDetailCtaState =
  | "guest"
  | "member-unowned"
  | "member-owned";

/** 로그인과 실제 덱 소유 여부만으로 덱 상세 CTA 상태를 정한다. */
export function deckDetailCtaState(
  signedIn: boolean,
  ownsDeck: boolean,
): DeckDetailCtaState {
  if (!signedIn) return "guest";
  return ownsDeck ? "member-owned" : "member-unowned";
}

/** 이미 기본 덱이면 같은 설정을 반복한다고 안내하지 않는다. */
export function deckReadingCtaLabel(isDefault: boolean): string {
  return isDefault
    ? "지금 리딩받기"
    : "기본 덱 설정하고 리딩받기";
}
