import type { Orientation } from "@/lib/store";

/** 역방향 확률. 카드마다 독립적으로 50%. */
const REVERSED_P = 0.5;

/**
 * count장의 방향을 뽑는다. rand는 [0,1) 난수를 주입받는다 —
 * 테스트에서 결정적으로 검증하기 위해서다.
 */
export function pickOrientations(
  count: number,
  rand: () => number,
): Orientation[] {
  return Array.from({ length: count }, () =>
    rand() < REVERSED_P ? "reversed" : "upright",
  );
}

/**
 * [0,1) 보안 난수. crypto.getRandomValues가 없는 환경에서만 Math.random으로
 * 폴백한다 — store.ts의 uid()가 폴백을 두는 것과 같은 이유(비보안 출처).
 */
export function secureRand(): number {
  const c = globalThis.crypto;
  if (c?.getRandomValues) {
    const [n] = c.getRandomValues(new Uint32Array(1));
    return n / 2 ** 32;
  }
  return Math.random();
}
