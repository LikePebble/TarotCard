/**
 * 이 기기가 이 계정과 **이미 한 번 병합했는지** (S3a의 "최초"를 재는 자).
 *
 * 로그인 최초 병합은 일기 충돌에서 서버를 우선한다. 그 정당화는 "이 기기에
 * 우연히 남아 있던 게스트 기록보다 계정 기록이 낫다"인데, "최초"를 모듈
 * 상태로 재면 **새로고침마다 다시 최초가 된다.** 그러면 세션 복원 때의
 * 로컬 — 게스트 잔재가 아니라 같은 계정의 가장 최신 기록 — 이 서버의 옛
 * 사본으로 조용히 대체된다. 저장 버튼을 누르고 2초 안에 탭을 닫기만 하면
 * 되는, 드물지 않은 순서다.
 *
 * 그래서 이 표식만 저장한다. 앎(server-knowledge)과 달리 저장이 안전한
 * 이유는 방향이 반대이기 때문이다 — 표식이 남는 쪽으로 틀리면 LWW로
 * 물러설 뿐이고, 사라지는 쪽으로 틀려도 게스트 병합을 한 번 더 할 뿐이다.
 *
 * **명시적 로그아웃에서만 지운다.** 그때 로컬 기록도 함께 비우므로(S5)
 * 다음 로그인은 다시 진짜 게스트→계정 병합이다. 세션 만료로 끊긴 경우에는
 * 남긴다: 로컬에 있는 것이 그 계정 본인의 기록이고, 아직 못 올린 수정이
 * 있을 수 있다.
 */

const KEY = "arcana.sync.mergedDevice";

/** 이 계정과 이미 병합한 기기인가. 저장소가 막혀 있으면 false(= 병합한다). */
export function hasMergedWith(userId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === userId;
  } catch {
    return false;
  }
}

/** 이 계정과의 병합이 끝났음을 남긴다. */
export function rememberMergedWith(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, userId);
  } catch {
    // 저장에 실패하면 다음 로드에서 병합을 한 번 더 할 뿐이다.
  }
}

/** 표식을 지운다(명시적 로그아웃). */
export function forgetMergedDevice(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // 위와 같다.
  }
}
