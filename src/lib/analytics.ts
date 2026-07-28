/**
 * GA4 퍼널 계측의 얇은 래퍼.
 *
 * 설계 원칙 세 가지.
 *
 * 1. **조용히 없는 것처럼 군다.** 측정 ID가 비었거나(=아직 발급 전) 브라우저가
 *    아니면 아무것도 하지 않는다. 계측 때문에 화면이 깨지는 일은 없어야 하므로
 *    이 모듈의 어떤 함수도 밖으로 던지지 않는다.
 * 2. **이벤트 이름과 파라미터를 타입으로 좁힌다.** `AnalyticsEvents`에 없는
 *    이름은 컴파일되지 않고, 이름마다 파라미터 모양이 고정된다. 문자열을
 *    호출부마다 새로 적으면 오타 하나로 퍼널이 조용히 끊긴다.
 * 3. **개인 식별 정보·일기 본문은 싣지 않는다.** 여기 실리는 값은 스프레드
 *    종류, 주제 id, 덱 id 같은 열거형뿐이다. 자유 입력 텍스트를 받는 파라미터는
 *    하나도 두지 않았다.
 *
 * 순수한 부분(이름·파라미터 정규화, 중복 방지 키, 1회 발사 판정)은 주입 가능한
 * 형태로 떼어 두고 `analytics.test.ts`가 검증한다. `window`를 만지는 부분은
 * 이 파일 아래쪽 얇은 어댑터 몇 줄로 몰아 두었다.
 */

import type { SpreadType } from "@/data/reading-types";
import type { ShareOutcome } from "@/lib/share";
import { adsenseClientId } from "@/lib/adsense";
import { localDateOf } from "@/lib/period";

/* ------------------------------------------------------------------ *
 * 환경변수
 * ------------------------------------------------------------------ */

/**
 * GA4 측정 ID 정규화. `G-`로 시작하는 값만 통과시킨다.
 *
 * 비어 있으면 null이고, null이면 layout이 <GoogleAnalytics />를 아예 렌더하지
 * 않는다. 형식까지 보는 이유: 잘못된 값이 들어와도 스크립트만 로드되고 데이터는
 * 한 줄도 안 쌓이는 상태가 조용히 이어지는 것보다, 처음부터 끄는 편이 낫다.
 */
export function normalizeGaId(raw: string | undefined | null): string | null {
  const value = (raw ?? "").trim();
  return /^G-[A-Za-z0-9]+$/.test(value) ? value : null;
}

/**
 * 빌드 시점에 인라인되는 공개 환경변수.
 * `process.env.NEXT_PUBLIC_*`는 Next가 문자열 치환하므로 구조분해하지 않는다.
 *
 * AdSense ID 정규화는 `@/lib/adsense`가 정본이다 — ads.txt도 같은 판정을 써야
 * 스크립트는 실리는데 ads.txt는 404인 어긋남이 생기지 않는다.
 */
export const GA_ID = normalizeGaId(process.env.NEXT_PUBLIC_GA_ID);
export const ADSENSE_CLIENT = adsenseClientId(
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
);

/* ------------------------------------------------------------------ *
 * 이벤트 사전
 * ------------------------------------------------------------------ */

/** 공유 버튼이 놓인 자리. 나중에 자리가 늘면 여기에 더한다. */
export type ShareSurface = "reading_result";

/** 티켓 소진 안내가 노출된 자리. */
export type TicketSurface = "reading_choice" | "reading_focus";

/** 로그인 경로. 값은 provider 이름이거나 로컬 개발용 가상 세션이다. */
export type LoginMethod = "google" | "kakao" | "development";

/**
 * 계측하는 이벤트 전부. 여기 없는 이름은 track()에 넘길 수 없다.
 *
 * 이름은 GA4 권장 표기(snake_case, 40자 이내)를 따르고, 예약어(`page_view`,
 * `session_start` 등)와 겹치지 않게 골랐다.
 */
export type AnalyticsEvents = {
  /** 리딩 유형을 골라 퍼널에 진입. */
  reading_start: { spread: SpreadType };
  /** 주제(테마) 선택. */
  focus_selected: { spread: SpreadType; focus: string };
  /** 리딩이 실제로 기록됨 = 퍼널의 전환 지점. */
  draw_completed: { spread: SpreadType; focus: string; deck_id: string };
  /** 결과 화면 진입. */
  result_viewed: { spread: SpreadType };
  /** 공유 시도와 그 결말(공유/복사/취소/실패). */
  share_clicked: {
    surface: ShareSurface;
    outcome: ShareOutcome;
    deck_id: string;
  };
  /** 게스트 → 로그인 전이가 끝난 지점. */
  login_completed: { method: LoginMethod };
  /** 오늘 받을 수 있는 리딩을 모두 받은 상태가 화면에 노출됨. */
  tickets_exhausted: { surface: TicketSurface; spread: SpreadType };
  /** 덱 상품 정보 모달이 열림. */
  deck_modal_opened: { deck_id: string };
};

export type AnalyticsEventName = keyof AnalyticsEvents;

/**
 * 이름 목록. 타입에서 자동으로 뽑히지 않으므로 손으로 적되,
 * `Record<AnalyticsEventName, true>`의 키로 만들어 빠뜨리면 컴파일이 깨지게 한다.
 */
const EVENT_NAME_SET: Record<AnalyticsEventName, true> = {
  reading_start: true,
  focus_selected: true,
  draw_completed: true,
  result_viewed: true,
  share_clicked: true,
  login_completed: true,
  tickets_exhausted: true,
  deck_modal_opened: true,
};

/** 계측 중인 이벤트 이름 전부(테스트·문서용). */
export const ANALYTICS_EVENT_NAMES = Object.keys(
  EVENT_NAME_SET,
) as AnalyticsEventName[];

export function isAnalyticsEventName(name: string): name is AnalyticsEventName {
  return Object.prototype.hasOwnProperty.call(EVENT_NAME_SET, name);
}

/* ------------------------------------------------------------------ *
 * 파라미터 정규화 (순수)
 * ------------------------------------------------------------------ */

/** GA4 이벤트 파라미터 값의 상한(100자). 넘으면 잘라 보낸다. */
export const PARAM_VALUE_MAX = 100;

export type AnalyticsParamValue = string | number | boolean;
export type AnalyticsPayload = Record<string, AnalyticsParamValue>;

/**
 * 보낼 파라미터를 다듬는다.
 *
 * - undefined·null·NaN·무한대는 뺀다. GA4는 이런 값을 문자열 "undefined"로
 *   기록해 버려서, 없느니만 못한 차원이 만들어진다.
 * - 문자열은 trim하고, 빈 문자열이 되면 뺀다.
 * - 100자를 넘으면 자른다(GA4 상한).
 * - 키 순서를 정렬한다 — 테스트와 로그가 호출 순서에 흔들리지 않게.
 */
export function normalizeParams(params: Record<string, unknown>): AnalyticsPayload {
  const out: AnalyticsPayload = {};
  for (const key of Object.keys(params).sort()) {
    const raw = params[key];
    if (raw === undefined || raw === null) continue;
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (trimmed === "") continue;
      out[key] = trimmed.slice(0, PARAM_VALUE_MAX);
      continue;
    }
    if (typeof raw === "number") {
      if (!Number.isFinite(raw)) continue;
      out[key] = raw;
      continue;
    }
    if (typeof raw === "boolean") {
      out[key] = raw;
      continue;
    }
    // 객체·배열·함수는 싣지 않는다. 자유 텍스트나 PII가 새어 들어올 통로가
    // 되기 쉽고, GA4도 스칼라만 받는다.
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * 전송 (주입 가능)
 * ------------------------------------------------------------------ */

/**
 * 이벤트 한 건을 실제로 보내는 함수. 테스트는 여기에 스텁을 꽂는다.
 * 런타임 구현은 `resolveSender()`가 만든다.
 */
export type AnalyticsSender = (name: string, payload: AnalyticsPayload) => void;

/**
 * 정규화 후 전송. sender가 없으면(=GA 미설정) 조용히 false.
 * sender가 던져도 밖으로 새지 않는다 — 계측은 화면을 멈출 권한이 없다.
 */
export function emitEvent<K extends AnalyticsEventName>(
  sender: AnalyticsSender | null,
  name: K,
  params: AnalyticsEvents[K],
): boolean {
  if (!sender) return false;
  try {
    sender(name, normalizeParams(params as Record<string, unknown>));
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * 중복 발사 방지 (순수)
 * ------------------------------------------------------------------ */

/** 이미 보낸 키를 기억하는 저장소. 런타임은 메모리 + sessionStorage. */
export type OnceStore = {
  has(key: string): boolean;
  add(key: string): void;
};

/** 메모리 전용 저장소(테스트·SSR 폴백). */
export function memoryOnceStore(): OnceStore {
  const seen = new Set<string>();
  return {
    has: (key) => seen.has(key),
    add: (key) => {
      seen.add(key);
    },
  };
}

/** 키가 처음일 때만 보낸다. 보냈으면 true. */
export function emitEventOnce<K extends AnalyticsEventName>(
  store: OnceStore,
  sender: AnalyticsSender | null,
  key: string,
  name: K,
  params: AnalyticsEvents[K],
): boolean {
  if (store.has(key)) return false;
  // 전송 성공 여부와 무관하게 표시한다. sender가 없어서 못 보낸 경우까지
  // "아직 안 보냄"으로 두면, GA가 늦게 붙는 순간 밀린 이벤트가 한꺼번에 나간다.
  store.add(key);
  return emitEvent(sender, name, params);
}

/**
 * 티켓 소진 이벤트의 중복 방지 키.
 *
 * 날짜를 넣는 이유: 티켓은 자정에 다시 열리므로 "오늘 소진을 봤다"는 사실은
 * 날짜마다 새 사건이다. 자리(surface)는 키에 넣지 않는다 — 리딩 선택 화면과
 * 주제 선택 화면은 같은 벽을 두 번 보여 주는 것이고, 퍼널 지표로는 한 번이다.
 */
export function ticketsExhaustedKey(at: Date): string {
  return `tickets_exhausted:${localDateOf(at)}`;
}

/* ------------------------------------------------------------------ *
 * 로그인 완료 표식 (순수 부분)
 * ------------------------------------------------------------------ */

/**
 * OAuth는 외부 사이트를 다녀오는 전체 페이지 이동이라, 로그인 버튼을 누른
 * 페이지와 세션이 생긴 페이지가 서로 다른 문서다. 그래서 "방금 로그인을
 * 시도했다"를 sessionStorage에 남겨 두고, 세션이 확정된 뒤 그 표식을
 * 회수하면서 이벤트를 보낸다. 표식을 회수(=삭제)하는 것 자체가 중복 방지다.
 */
export const LOGIN_PENDING_KEY = "arca.analytics.login_pending";

const LOGIN_METHODS: readonly LoginMethod[] = ["google", "kakao", "development"];

export function parseLoginMethod(raw: string | null): LoginMethod | null {
  return LOGIN_METHODS.find((m) => m === raw) ?? null;
}

/* ------------------------------------------------------------------ *
 * 대기열 (순수)
 * ------------------------------------------------------------------ */

export type PendingEvent = { name: string; payload: AnalyticsPayload };

/**
 * 대기열 상한. GA가 끝내 붙지 않는 환경(차단기·오프라인)에서 메모리를 계속
 * 먹지 않도록 오래된 것부터 버린다. 퍼널 이벤트는 한 세션에 열 몇 건이라
 * 이 정도면 정상 흐름에서는 절대 넘치지 않는다.
 */
export const PENDING_MAX = 20;

/** 상한을 지키며 대기열에 넣는다(가장 오래된 것부터 밀어낸다). */
export function enqueuePending(
  queue: PendingEvent[],
  item: PendingEvent,
  max = PENDING_MAX,
): PendingEvent[] {
  queue.push(item);
  while (queue.length > max) queue.shift();
  return queue;
}

/**
 * 대기열을 비우며 보낸다. sender가 없으면 하나도 건드리지 않는다 —
 * 아직 GA가 붙지 않았다는 뜻이므로 다음 기회를 기다려야 한다.
 * 보낸 건수를 돌려준다.
 */
export function drainPending(
  queue: PendingEvent[],
  sender: AnalyticsSender | null,
): number {
  if (!sender) return 0;
  let sent = 0;
  while (queue.length > 0) {
    const item = queue.shift() as PendingEvent;
    try {
      sender(item.name, item.payload);
      sent += 1;
    } catch {
      // 한 건이 실패해도 나머지는 계속 보낸다.
    }
  }
  return sent;
}

/* ------------------------------------------------------------------ *
 * 브라우저 어댑터 (여기부터 window를 만진다)
 * ------------------------------------------------------------------ */

type GtagFn = (
  command: "event",
  name: string,
  payload: AnalyticsPayload,
) => void;

type GaWindow = Window & { gtag?: GtagFn };

/** `window.gtag`가 준비돼 있으면 그것으로 만든 sender, 아니면 null. */
function gtagSender(): AnalyticsSender | null {
  if (typeof window === "undefined") return null;
  const gtag = (window as GaWindow).gtag;
  if (typeof gtag !== "function") return null;
  return (name, payload) => gtag("event", name, payload);
}

/*
 * GA 스크립트가 아직 실행되지 않았을 때 쓰는 대기열.
 *
 * @next/third-parties의 <GoogleAnalytics />는 두 스크립트를 `afterInteractive`로
 * 넣는다 — 전역 `gtag`를 정의하는 인라인 스크립트와 gtag.js 본체다. 둘 다
 * 하이드레이션 뒤에 실행되므로, 마운트 이펙트에서 나가는 이벤트
 * (login_completed·result_viewed·tickets_exhausted)는 `gtag`가 없는 순간을 만난다.
 *
 * dataLayer에 직접 밀어 넣는 방법은 쓰지 않는다. 그러면 우리 이벤트가 인라인
 * 스크립트의 `gtag('config', …)`보다 앞에 놓여, 측정 ID가 정해지기 전에
 * 처리되고 버려진다. 대신 `gtag`가 생길 때까지 짧게 기다렸다가 보낸다.
 */
const pendingEvents: PendingEvent[] = [];
const FLUSH_INTERVAL_MS = 250;
const FLUSH_MAX_ATTEMPTS = 24; // 약 6초. 그 뒤에도 없으면 GA가 차단된 환경이다.
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushAttempts = 0;

function flushPending(): void {
  flushTimer = null;
  const sender = gtagSender();
  if (sender) {
    flushAttempts = 0;
    drainPending(pendingEvents, sender);
    return;
  }
  if (pendingEvents.length === 0) return;
  flushAttempts += 1;
  if (flushAttempts >= FLUSH_MAX_ATTEMPTS) {
    // 포기한다. 쌓아 둔 것도 버려서 메모리를 붙들고 있지 않는다.
    pendingEvents.length = 0;
    return;
  }
  scheduleFlush();
}

function scheduleFlush(): void {
  if (flushTimer !== null || typeof window === "undefined") return;
  flushTimer = setTimeout(flushPending, FLUSH_INTERVAL_MS);
}

/**
 * 지금 쓸 수 있는 전송 경로.
 *
 * 측정 ID가 없거나 서버면 null이다 — 이때는 대기열도 만들지 않는다.
 * ID가 있으면 gtag가 준비됐을 때 바로 보내고, 아니면 대기열에 담아 둔다.
 */
function resolveSender(): AnalyticsSender | null {
  if (!GA_ID) return null;
  if (typeof window === "undefined") return null;
  return (name, payload) => {
    const sender = gtagSender();
    if (sender) {
      drainPending(pendingEvents, sender); // 순서를 지킨다.
      sender(name, payload);
      return;
    }
    enqueuePending(pendingEvents, { name, payload });
    scheduleFlush();
  };
}

const ONCE_PREFIX = "arca.analytics.once.";
const memoryOnce = new Set<string>();

/**
 * 런타임 1회 저장소. 메모리(같은 문서 안의 리렌더·재마운트)와
 * sessionStorage(같은 탭 안의 새로고침·페이지 이동)를 겹쳐 쓴다.
 * storage가 막힌 브라우저에서도 메모리만으로 최소한의 중복은 막힌다.
 */
const runtimeOnce: OnceStore = {
  has(key) {
    if (memoryOnce.has(key)) return true;
    if (typeof window === "undefined") return false;
    try {
      return window.sessionStorage.getItem(ONCE_PREFIX + key) === "1";
    } catch {
      return false;
    }
  },
  add(key) {
    memoryOnce.add(key);
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(ONCE_PREFIX + key, "1");
    } catch {
      // 사생활 보호 모드 등에서 막힐 수 있다. 메모리 쪽은 이미 기록됐다.
    }
  },
};

/** 이벤트 한 건. GA가 없으면 아무 일도 일어나지 않는다. */
export function track<K extends AnalyticsEventName>(
  name: K,
  params: AnalyticsEvents[K],
): void {
  emitEvent(resolveSender(), name, params);
}

/** 같은 키로는 한 번만. 키 설계는 호출부가 정한다(예: ticketsExhaustedKey). */
export function trackOnce<K extends AnalyticsEventName>(
  key: string,
  name: K,
  params: AnalyticsEvents[K],
): void {
  emitEventOnce(runtimeOnce, resolveSender(), key, name, params);
}

/** 로그인 시도를 표시해 둔다. 실제 이벤트는 세션이 확정된 뒤에 나간다. */
export function markLoginPending(method: LoginMethod): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(LOGIN_PENDING_KEY, method);
  } catch {
    // 표식을 못 남기면 login_completed 한 건을 놓칠 뿐, 로그인 자체는 진행된다.
  }
}

/** 표식을 회수한다(읽고 지운다). 없으면 null. */
export function takeLoginPending(): LoginMethod | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(LOGIN_PENDING_KEY);
    if (raw === null) return null;
    window.sessionStorage.removeItem(LOGIN_PENDING_KEY);
    return parseLoginMethod(raw);
  } catch {
    return null;
  }
}
