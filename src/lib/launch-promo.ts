import type { Deck } from "@/data/decks";

/**
 * 출시 기념 한정 프로모션 안내에 쓰는 순수 조각들.
 *
 * 덱 이름을 문구에 박아 두지 않는다. 출시 전에 무료 덱이 더 늘어나면 박아 둔
 * 문구는 그 순간 거짓말이 되기 때문이다. 이름은 항상 `decks`에서 읽는다.
 */

/** 프로모션으로 열어 드리는 덱 = 활성 덱 중 클래식이 아닌 것. */
export function promoDeckNames(all: Deck[]): string[] {
  return all
    .filter((deck) => deck.active && deck.id !== "classic")
    .map((deck) => deck.nameKo);
}

const HANGUL_FIRST = 0xac00;
const HANGUL_LAST = 0xd7a3;

/**
 * 마지막 글자에 받침이 있으면 true, 없으면 false, 한글 음절이 아니면 null.
 *
 * 라틴 문자·숫자로 끝나는 덱 이름은 읽는 소리를 알 수 없어 판정하지 않는다.
 * 그때는 호출 쪽이 "와"로 떨어진다("K-POP 뮤즈버스와"처럼 무난한 쪽).
 */
export function hasFinalConsonant(word: string): boolean | null {
  const last = word.at(-1);
  if (!last) return null;
  const code = last.codePointAt(0) ?? 0;
  if (code < HANGUL_FIRST || code > HANGUL_LAST) return null;
  return (code - HANGUL_FIRST) % 28 !== 0;
}

/**
 * 덱 이름을 문장에 넣을 수 있게 잇는다.
 *
 * 둘이면 "A와/과 B", 셋 이상이면 "A, B, C". 셋부터 접속조사를 쓰지 않는 이유는
 * 조용한 톤을 지키려는 것이다 — 나열이 길어질수록 목록처럼 읽히는 편이 낫다.
 */
export function joinDeckNames(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) {
    const [first, second] = names;
    // null(판정 불가)은 "와"로 떨어진다.
    const particle = hasFinalConsonant(first) ? "과" : "와";
    return `${first}${particle} ${second}`;
  }
  return names.join(", ");
}

/** 프로모션 안내를 어떤 문구로 낼지. null이면 아무것도 렌더하지 않는다. */
export type LaunchPromoVariant = "guest" | "member";

/**
 * 플래그가 꺼져 있으면 null(완전 무렌더).
 *
 * 세션 확정 전에도 null이다. 그전에는 `useSession()`이 게스트로 보이므로,
 * 로그인한 분께 "로그인하시면 드립니다"를 한 프레임 보였다가 지우게 된다.
 * 이 안내는 로그인 유인이라 그 한 프레임이 특히 어색하다.
 *
 * 드릴 덱이 하나도 없어도 null이다. 이름 자리가 빈 채로 "프리미엄 덱을
 * 드립니다"만 남으면 무엇을 준다는 말인지 알 수 없다.
 */
export function launchPromoVariant(
  enabled: boolean,
  sessionLoading: boolean,
  signedIn: boolean,
  promoDeckCount: number,
): LaunchPromoVariant | null {
  if (!enabled) return null;
  if (promoDeckCount === 0) return null;
  if (sessionLoading) return null;
  return signedIn ? "member" : "guest";
}
