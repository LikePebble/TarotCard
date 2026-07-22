"use client";

import Link from "next/link";
import { JournalLink } from "./JournalLink";

/**
 * 결과 화면 공용 액션 버튼. 네 호출부(draw x2, /reading/[id] x2)가 각자
 * 적던 같은 버튼 묶음을 하나로 모았다. slug는 1장 결과에서는 그 카드,
 * 3장 결과에서는 선택된 카드를 가리킨다.
 * localDate가 없으면(뽑기 직후 기록 전 한 프레임) 일기 링크 자리를 비운다.
 */
export function ResultActions({
  deckId,
  slug,
  localDate,
}: {
  deckId: string;
  slug: string;
  localDate: string | null;
}) {
  return (
    <>
      <Link
        href={`/collection/${deckId}/${slug}`}
        className="btn btn-gold w-full lg:w-auto"
      >
        카드 자세히 보기
      </Link>
      <Link href="/collection" className="btn btn-ghost w-full lg:w-auto">
        컬렉션 보기
      </Link>
      {localDate ? <JournalLink localDate={localDate} /> : null}
    </>
  );
}
