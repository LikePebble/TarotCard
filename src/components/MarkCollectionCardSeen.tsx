"use client";

import { useEffect } from "react";
import { markCollectionCardSeen } from "@/lib/collection-unseen";
import { useSession } from "@/lib/auth/session";

/** 카드 상세 진입은 새 카드 알림을 읽음으로 처리하는 명시적 경계다. */
export function MarkCollectionCardSeen({
  deckId,
  slug,
}: {
  deckId: string;
  slug: string;
}) {
  const { user } = useSession();

  useEffect(() => {
    if (user === null) return;
    markCollectionCardSeen(deckId, slug);
  }, [deckId, slug, user]);
  return null;
}
