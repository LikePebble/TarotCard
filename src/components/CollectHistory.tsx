"use client";

import { useArcanaStore, useSelectedDeck } from "@/lib/store";

function formatKoDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function CollectHistory({ slug }: { slug: string }) {
  const { store } = useArcanaStore();
  const { deckId } = useSelectedDeck();
  const entry = store?.collection[deckId]?.[slug];

  return (
    <div className="mt-7 border-t border-line pt-5 lg:mt-10 lg:pt-7">
      {store === null ? (
        <p className="text-[12.5px] text-muted" aria-hidden>
          {" "}
        </p>
      ) : entry ? (
        <div className="flex gap-10 lg:gap-14">
          <div>
            <p className="text-[12.5px] text-muted lg:text-[13px]">첫 수집</p>
            <p className="font-serif text-[17px] lg:text-[19px]">
              {formatKoDate(entry.firstAt)}
            </p>
          </div>
          <div>
            <p className="text-[12.5px] text-muted lg:text-[13px]">뽑은 횟수</p>
            <p className="font-serif text-[17px] lg:text-[19px]">
              {entry.count}회
            </p>
          </div>
        </div>
      ) : (
        <p className="text-[14px] text-muted">아직 수집하지 않은 카드입니다</p>
      )}
    </div>
  );
}
