import { deckById } from "@/data/decks";

export type SharePayload = { title: string; text: string; url: string };

/**
 * 공유할 카드 상세 URL.
 *
 * cardDetailHref와 달리 readingId·filter를 절대 싣지 않는다. readingId는 뽑은
 * 기기의 localStorage에만 있는 값이라 받는 사람에게는 아무 의미가 없고, 공유
 * 링크에 남의 리딩 id가 붙어 다닐 이유도 없다.
 */
export function shareCardUrl(
  origin: string,
  deckId: string,
  slug: string,
): string {
  return `${origin.replace(/\/+$/, "")}/collection/${deckId}/${slug}`;
}

/** 공유 시트에 실을 제목·문구·주소. */
export function cardSharePayload(
  origin: string,
  deckId: string,
  slug: string,
  nameKo: string,
  nameEn: string,
): SharePayload {
  const deckName = deckById(deckId).nameKo;
  return {
    title: `${nameKo} ${nameEn} · 아르카 타로`,
    text: `오늘 제가 만난 카드는 ${nameKo}입니다. ${deckName}으로 뽑았어요.`,
    url: shareCardUrl(origin, deckId, slug),
  };
}

export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

type ShareNavigator = {
  share?: (data: SharePayload) => Promise<void>;
  clipboard?: { writeText: (text: string) => Promise<void> };
};

/**
 * 공유 시트 → 클립보드 API → 레거시 복사 순으로 내려간다.
 *
 * 폴백을 두 겹 두는 이유: navigator.clipboard는 보안 컨텍스트와 사용자 제스처를
 * 요구해서 권한 정책이나 구형 브라우저에서 조용히 거부된다. 그때 execCommand
 * 경로가 없으면 사용자에게 남는 선택지가 없다.
 *
 * 사용자가 시트를 닫으면 AbortError가 나는데 이건 실패가 아니다. 취소를
 * 오류로 알리면 아무 잘못도 하지 않은 사람에게 경고를 보여 주게 된다.
 */
export async function runShare(
  nav: ShareNavigator,
  payload: SharePayload,
  legacyCopy?: (text: string) => boolean,
): Promise<ShareOutcome> {
  if (typeof nav.share === "function") {
    try {
      await nav.share(payload);
      return "shared";
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return "cancelled";
      // 시트가 실패하면 복사로 내려간다. 여기서 끝내면 공유할 방법이 없다.
    }
  }
  if (nav.clipboard) {
    try {
      await nav.clipboard.writeText(payload.url);
      return "copied";
    } catch {
      // 아래 레거시 경로로 계속 간다.
    }
  }
  return legacyCopy?.(payload.url) ? "copied" : "failed";
}

/** 결과별 안내 문구. cancelled는 아무 말도 하지 않는다. */
export function shareNoticeOf(outcome: ShareOutcome): string | null {
  switch (outcome) {
    case "copied":
      return "링크를 복사했습니다";
    case "failed":
      return "공유하지 못했습니다. 주소창의 링크를 복사해 주세요";
    default:
      return null;
  }
}
