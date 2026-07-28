"use client";

import { useEffect } from "react";
import { adsenseClientId } from "@/lib/adsense";
import { useResolvedEntitlements } from "@/lib/entitlements";

/** 빌드 시 인라인되는 값이라 서버·클라이언트가 같다(하이드레이션 안전). */
const CLIENT = adsenseClientId(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * 광고 지면 하나.
 *
 * 광고를 낼지 말지를 판정하는 곳은 여기 하나다. 배치하는 화면은 `<AdSlot />`만
 * 놓고 조건을 다시 쓰지 않는다 — 조건이 여러 군데로 흩어지면 그중 한 곳이
 * `adFree`를 빠뜨려 광고 제거를 구매한 사용자에게 광고가 나간다.
 *
 * 세 가지 경우에 아무것도 렌더하지 않는다.
 * - `adFree` 구매자
 * - `NEXT_PUBLIC_ADSENSE_CLIENT`가 없거나 형식이 어긋날 때
 * - 엔타이틀먼트가 아직 확정되지 않았을 때. 마운트 전 EMPTY를 믿고 그렸다가
 *   `adFree`가 밝혀져 지우면 지면 높이만큼 레이아웃이 튄다. 확정 전에는
 *   내보내지 않는다(`JournalLink`와 같은 패턴).
 */
export function AdSlot({
  slotId,
  className,
  format = "auto",
}: {
  slotId: string;
  className?: string;
  format?: string;
}) {
  const ent = useResolvedEntitlements();
  const enabled = CLIENT !== null && ent !== null && !ent.adFree;

  useEffect(() => {
    if (!enabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // 로더 스크립트가 아직 없거나 차단된 경우. 지면은 빈 채로 둔다.
    }
  }, [enabled, slotId]);

  if (!enabled) return null;

  // key로 slotId를 걸어 둔다. AdSense가 이 <ins>를 직접 뜯어고치므로, 슬롯이
  // 바뀔 때는 재사용하지 않고 새 노드를 받아야 이전 광고가 남지 않는다.
  return (
    <ins
      key={slotId}
      className={`adsbygoogle${className ? ` ${className}` : ""}`}
      style={{ display: "block" }}
      data-ad-client={CLIENT}
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive="true"
      aria-label="광고"
    />
  );
}
