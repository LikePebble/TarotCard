import { readingTypeOf } from "@/data/reading-types";
import { localDateOf } from "@/lib/period";

/**
 * 리딩 선택 화면의 "오늘의 카드" 패널이 보여 줄 목록을 고르는 순수 로직.
 *
 * 예전에는 blockingReading이 오늘의 마지막 리딩 하나만 돌려주면 됐다 — 하루
 * 1회였으니 그 하나가 곧 오늘 전부였다. 티켓제(하루 2~3장) 이후로는 오늘 받은
 * 것이 여럿이라, 패널이 전부를 나열하려면 목록 자체가 필요해졌다.
 */

/**
 * 패널에 그릴 수 있는 최대 장수.
 *
 * 티켓 상한(로그인 3장)과 같은 수지만 티켓에서 파생하지 않는다. 여기서 막는
 * 것은 "티켓 규칙"이 아니라 "패널이 감당하는 칸 수"다 — 기기 시계를 되돌리거나
 * 다른 기기의 기록이 병합돼 오늘 기록이 예상보다 많아져도 패널 한 줄이 넘치지
 * 않게 하는 방어선이다.
 */
export const TODAY_PANEL_MAX = 3;

/**
 * 패널이 필요로 하는 최소 형태. ReadingRecord가 구조적으로 이를 만족하므로
 * 그대로 넘길 수 있고, 테스트는 가벼운 리터럴만 만들면 된다(day-readings와 같은 방식).
 */
export type TodayReading = {
  id: string;
  at: string; // ISO
  localDate: string; // YYYY-MM-DD (로컬)
  typeId: string;
  category: string; // focus id
  deckId: string;
  cards: string[];
};

const ONE_CARD = readingTypeOf("one").id;

/**
 * 오늘 뽑은 "오늘의 카드" 리딩들. 오래된 것부터(at 오름차순) 돌려준다.
 *
 * 뽑은 순서로 두는 이유: 새로 한 장 뽑아도 앞서 뽑은 카드의 자리가 그대로라
 * 패널이 흔들리지 않는다. 최신순이면 뽑을 때마다 전부 한 칸씩 밀린다.
 * at은 ISO 문자열이라 사전순 비교가 곧 시간순 비교다(같은 타임존 표기).
 * at이 같으면 Array#sort가 안정 정렬이므로 저장된 순서를 그대로 따른다.
 *
 * 날짜 판정은 저장된 localDate를 쓴다 — at을 다시 파싱하면 기록 시점과 지금의
 * 타임존이 다를 때 자정 경계에서 어긋난다.
 */
export function todayOneCardReadings<T extends TodayReading>(
  readings: readonly T[],
  now: Date,
): T[] {
  const day = localDateOf(now);
  const today = readings.filter(
    (r) => r.typeId === ONE_CARD && r.localDate === day,
  );
  today.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
  // 넘칠 때 남기는 쪽은 최신 3장이다. 방금 받은 카드가 사라지는 편이
  // 오래된 카드가 사라지는 것보다 더 당황스럽기 때문이다.
  return today.slice(-TODAY_PANEL_MAX);
}
