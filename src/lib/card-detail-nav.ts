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
  filter?: CatalogFilter,
): string {
  const pathname = `/collection/${deckId}/${slug}`;
  const query = new URLSearchParams();
  if (readingId) query.set("readingId", readingId);
  if (filter) query.set("filter", filter);
  const search = query.toString();
  return search ? `${pathname}?${search}` : pathname;
}
import type { CatalogFilter } from "@/lib/catalog-filter";
