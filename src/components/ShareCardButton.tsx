"use client";

import { ShareNetwork } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { koCards } from "@/data/ko";
import { cardBySlug } from "@/data/cards";
import { cardSharePayload, runShare, shareNoticeOf } from "@/lib/share";

/**
 * 카드 상세 주소를 공유한다. 리딩 주소가 아니라 카드 주소를 보내는 이유는
 * /reading/[id]가 뽑은 기기의 localStorage에만 있는 기록이어서, 받은 사람에게는
 * "리딩을 찾을 수 없습니다"만 뜨기 때문이다.
 *
 * 공유 시트가 없는 환경(대부분의 데스크톱 브라우저)에서는 주소를 복사한다.
 */
/**
 * navigator.clipboard가 거부됐을 때의 마지막 수단. execCommand는 폐기 예정이지만
 * 권한 프롬프트 없이 동작해서, 클립보드 API가 막힌 환경에 남는 유일한 경로다.
 */
function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    // 화면 밖에 두되 focus는 받을 수 있어야 한다. display:none이면 선택이 안 된다.
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:-9999px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function ShareCardButton({
  deckId,
  slug,
  // .btn은 inline-flex지만 gap이 없다. 아이콘과 글자가 붙지 않게 여기서 준다.
  className = "btn btn-ghost w-full gap-1.5 lg:w-auto",
}: {
  deckId: string;
  slug: string;
  className?: string;
}) {
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const onShare = useCallback(async () => {
    const card = cardBySlug.get(slug);
    if (!card) return;
    const nameKo = koCards[slug]?.nameKo ?? card.nameEn;
    const payload = cardSharePayload(
      window.location.origin,
      deckId,
      slug,
      nameKo,
      card.nameEn,
    );
    const message = shareNoticeOf(await runShare(navigator, payload, legacyCopy));
    if (!message) return;
    setNotice(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 2400);
  }, [deckId, slug]);

  return (
    <>
      <button type="button" onClick={onShare} className={className}>
        <ShareNetwork size={17} aria-hidden />
        공유하기
      </button>
      {/* 조용히 사라지는 안내. 화면 낭독기에도 한 번은 전달되도록 live 영역에 둔다. */}
      <p
        role="status"
        aria-live="polite"
        className={`text-[12.5px] text-muted transition-opacity duration-200 ${
          notice ? "opacity-100" : "sr-only opacity-0"
        }`}
      >
        {notice ?? ""}
      </p>
    </>
  );
}
