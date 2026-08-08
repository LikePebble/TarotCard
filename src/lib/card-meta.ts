/**
 * 카드 상세 페이지의 검색용 제목·설명.
 *
 * 페이지 안에 있던 순수 함수를 여기로 옮기고 시험 가능하게 만들었다. 이 문자열
 * 하나가 검색 결과에 그대로 나가므로, 길이·중복·문장 끊김은 눈으로 확인할 것이
 * 아니라 테스트로 고정할 값이다.
 */

/** 구글이 잘라내지 않는 설명 길이의 대략적 상한. */
export const DESCRIPTION_LIMIT = 155;

/**
 * 해석문 앞부분을 검색결과 스니펫 길이로 자른다. 문장 중간에서 끊기지 않도록
 * 마지막 문장 끝을 찾고, 그마저 없으면 어절 경계에서 자른다.
 *
 * 한국어 정본은 마침표로 끝나므로 `.`을 먼저 본다. 문장 끝이 너무 앞이면
 * (limit의 3분의 1 미만) 한 문장도 못 담은 것이라 어절 경계로 물러선다.
 */
export function truncateForMeta(text: string, limit: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= limit) return flat;
  const window = flat.slice(0, limit);
  const sentenceEnd = Math.max(
    window.lastIndexOf("."),
    window.lastIndexOf("!"),
    window.lastIndexOf("?"),
  );
  if (sentenceEnd >= Math.floor(limit / 3)) return window.slice(0, sentenceEnd + 1);
  const wordEnd = window.lastIndexOf(" ");
  const cut = wordEnd >= Math.floor(limit / 3) ? window.slice(0, wordEnd) : window;
  return `${cut.trimEnd()}…`;
}

/**
 * 카드 상세의 검색용 설명.
 *
 * 앞머리에 **"정방향·역방향 의미"**를 박는 이유: 사람들이 실제로 그렇게
 * 검색한다("컵 5 역방향 의미"). 페이지가 이제 두 방향을 모두 담고 있으므로
 * 이 문구는 광고가 아니라 사실이다. 뒤에는 정방향 해석의 첫 문장을 붙여
 * 카드마다 다른 설명이 되게 한다 — 78장이 같은 설명을 쓰면 중복으로 묶인다.
 */
export function cardMetaDescription(
  nameKo: string,
  nameEn: string,
  uprightText: string,
): string {
  const lead = `${nameKo}(${nameEn}) 타로 카드의 정방향·역방향 의미. `;
  const room = DESCRIPTION_LIMIT - lead.length;
  return `${lead}${truncateForMeta(uprightText, Math.max(40, room))}`;
}

/** 카드 상세의 제목. 덱마다 달라지지만 canonical은 클래식 하나로 모인다. */
export function cardMetaTitle(
  nameKo: string,
  nameEn: string,
  deckNameKo: string,
): string {
  return `${nameKo} ${nameEn} 타로 카드 의미 · 정방향 역방향 해석 | ${deckNameKo}`;
}
