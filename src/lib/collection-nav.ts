/**
 * 현재 필터 안에서만 카드 상세의 이전/다음을 찾는다(순수).
 * 끝에서는 순환하지 않아, 예컨대 펜타클 킹 다음이 바보로 넘어가지 않는다.
 */
export function neighborSlugs(
  orderedSlugs: string[],
  current: string,
): { prev: string | null; next: string | null } {
  const index = orderedSlugs.indexOf(current);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: orderedSlugs[index - 1] ?? null,
    next: orderedSlugs[index + 1] ?? null,
  };
}
