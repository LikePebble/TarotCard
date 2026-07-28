"use client";

import { ShareNetwork } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { koCards } from "@/data/ko";
import { cardBySlug } from "@/data/cards";
import { track, type ShareSurface } from "@/lib/analytics";
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
  surface = "reading_result",
}: {
  deckId: string;
  slug: string;
  className?: string;
  /** 이 버튼이 놓인 화면. 계측에서 자리를 구분하는 데만 쓴다. */
  surface?: ShareSurface;
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
    const outcome = await runShare(navigator, payload, legacyCopy);
    // 결말까지 한 건에 담는다. 누른 횟수는 outcome을 합치면 나오고, 이렇게
    // 두면 "눌렀지만 공유되지 않은" 비율을 GA에서 바로 갈라 볼 수 있다.
    // 클릭 시점과 결말 시점에 각각 보내면 시트를 열어 둔 채 이탈한 경우가
    // 두 이벤트 사이에 끼어 계산이 어긋난다.
    track("share_clicked", { surface, outcome, deck_id: deckId });
    const message = shareNoticeOf(outcome);
    if (!message) return;
    setNotice(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 2400);
  }, [deckId, slug, surface]);

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
