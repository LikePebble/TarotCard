const READING_ID_PATTERN = /^[A-Za-z0-9._:-]{1,200}$/;

/** 카드 상세 URL에 넣어도 안전한 내부 리딩 id만 허용한다. */
export function validReadingId(
  value: string | string[] | null | undefined,
): string | null {
  return typeof value === "string" && READING_ID_PATTERN.test(value)
    ? value
    : null;
}

/** 리딩 출처가 있으면 카드 상세의 이전/다음 이동에도 그 맥락을 보존한다. */
export function cardDetailHref(
  deckId: string,
  slug: string,
  readingId: string | null,
): string {
  const pathname = `/collection/${deckId}/${slug}`;
  return readingId
    ? `${pathname}?readingId=${encodeURIComponent(readingId)}`
    : pathname;
}
