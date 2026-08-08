import { dailySlotsUsed, type ArcanaStore } from "@/lib/store";

/**
 * 티켓 — "오늘의 카드"(spread="one")를 뽑을 수 있는 하루치 횟수.
 *
 * 하루 단위로 지급되고 리딩 1회마다 1장 차감된다. 리셋은 로컬 날짜가 바뀌는
 * 시점(자정)이며, 별도 저장 없이 store.readings의 오늘 기록에서 파생된다 —
 * 남은 장수를 따로 저장하면 기록과 어긋날 수 있고, 자정 리셋을 위한 타이머도
 * 필요해진다. 파생값이면 둘 다 필요 없다.
 *
 * "과거 · 현재 · 미래"(spread="three")는 주 1회 케이던스라 티켓과 무관하다.
 * 이 모듈은 "one"만 다룬다.
 */

/** 비로그인 사용자의 하루 티켓. */
export const DAILY_TICKETS_BASE = 2;

/** 로그인하면 하루에 이만큼 더 받는다. */
export const SIGNED_IN_BONUS = 1;

/**
 * 소진 상태에서 회복 시점을 알리는 문구. 두 화면이 같은 말을 쓰도록 여기 둔다.
 *
 * 문구에서 "티켓"이라는 말을 쓰지 않는다. 하루 횟수는 재화가 아니라 이 제품의
 * 리듬이고, 차감·소진 같은 어휘를 앞세우면 성찰의 도구가 소모품처럼 읽힌다.
 * 세는 일은 숫자에 맡기고, 말은 받는 쪽으로 한다.
 */
export const TICKET_RESET_NOTE = "자정이 지나면 다시 열립니다";

/**
 * 비로그인 사용자에게 보여 주는 로그인 유도 문구.
 * 횟수는 상수에서 파생한다 — 지급량이 바뀌어도 문구가 거짓말을 하지 않게.
 */
export const TICKET_BONUS_HINT = `로그인하시면 매일 ${SIGNED_IN_BONUS}번 더 받으실 수 있습니다`;

export function dailyTicketsFor(signedIn: boolean): number {
  return DAILY_TICKETS_BASE + (signedIn ? SIGNED_IN_BONUS : 0);
}

export type TicketState = {
  /** 오늘 받은 티켓 수. */
  total: number;
  /** 오늘 쓴 티켓 수(= 오늘 뽑은 서로 다른 테마 수). */
  used: number;
  /** 남은 티켓. 0 아래로는 내려가지 않는다. */
  remaining: number;
};

/**
 * 오늘의 티켓 상태.
 *
 * store가 null이면(마운트 전) 오늘 기록을 읽을 수 없으므로 used=0으로 둔다.
 * 이 값을 그대로 보여 주면 "3장 남음 → 1장 남음"으로 튀므로, 화면은 store와
 * 세션이 모두 정해지기 전에는 티켓 표시를 내보내지 않는다(호출부 책임).
 * 여기서 예외를 던지거나 null을 반환하지 않는 이유는, 호출부가 훅 순서를
 * 지키면서 조건부로 계산할 수 없기 때문이다 — 값은 항상 돌려주고 표시 여부만
 * 호출부가 고른다.
 *
 * remaining이 음수가 되지 않게 막는다: 티켓 4장으로 4번 뽑은 뒤 로그아웃하면
 * total이 3으로 줄어 used(4)가 total을 넘는 상태가 실제로 만들어진다.
 */
export function ticketStateOf(
  store: ArcanaStore | null,
  d: Date,
  signedIn: boolean,
  retainedSlotsUsed = 0,
): TicketState {
  const total = dailyTicketsFor(signedIn);
  // 기기 표식은 로그아웃 때 리딩 본문을 지운 뒤에도 같은 사용량을 보존하는
  // 하한선이다. 현재 로컬 리딩과 더하면 방금 뽑은 1회를 두 번 세므로 큰 쪽을 쓴다.
  const used = Math.max(
    store ? dailySlotsUsed(store, "one", d) : 0,
    retainedSlotsUsed,
  );
  return { total, used, remaining: Math.max(0, total - used) };
}

/** 잔량 안내 문구. TICKET_RESET_NOTE와 같은 이유로 "티켓"을 말하지 않는다. */
export function ticketNoticeOf(state: TicketState): string {
  return state.remaining > 0
    ? `오늘 ${state.remaining}번 더 받으실 수 있습니다`
    : "오늘 받으실 수 있는 타로는 모두 받으셨습니다";
}

/**
 * 화면에 실을 안내 전문. 소진일 때만 회복 시점을 덧붙이고, 두 문장은 줄을
 * 나눈다 — 한 줄로 이으면 가운뎃점 뒤가 앞 문장의 조건처럼 붙어 읽힌다.
 * 개행을 살리려면 보여 주는 쪽에 whitespace-pre-line이 있어야 한다.
 */
export function ticketNoticeLinesOf(state: TicketState): string {
  return state.remaining > 0
    ? ticketNoticeOf(state)
    : `${ticketNoticeOf(state)}.\n${TICKET_RESET_NOTE}`;
}
