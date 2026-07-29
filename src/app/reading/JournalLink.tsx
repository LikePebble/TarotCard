"use client";

import Link from "next/link";
import { isWritten, useJournal } from "@/lib/journal";

/**
 * "이날의 일기 보기/쓰기" 링크. 그날 일기 유무로 라벨이 갈린다.
 * 뽑기 직후(draw)와 재열람(/reading/[id]) 두 화면이 라벨 규칙을 공유하도록
 * 이 컴포넌트 하나만 useJournal 구독과 라벨 규칙을 안다.
 */
export function JournalLink({ localDate }: { localDate: string }) {
  const { store: journal } = useJournal();
  // 로드 전에는 아무것도 보여주지 않는다 — "쓰기"로 잘못 보였다가 "보기"로
  // 바뀌는 깜빡임을 만들지 않기 위함.
  if (journal === null) return null;
  return (
    <Link href={`/my/journal/${localDate}`} className="btn btn-ghost w-full lg:w-auto">
      {isWritten(journal[localDate]) ? "이날의 일기 보기" : "이날의 일기 쓰기"}
    </Link>
  );
}
