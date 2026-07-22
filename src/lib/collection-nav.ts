/**
 * 카드 상세의 이전/다음을 "수집한 카드"로만 제한한다(순수).
 * 전체 78장이 아니라 수집한 카드 사이만 오가야 도감이라는 장치가 의미를 갖는다.
 */
export function neighborSlugs(
  orderedSlugs: string[],
  collected: Set<string>,
  current: string,
): { prev: string | null; next: string | null } {
  if (collected.size === 0) return { prev: null, next: null };
  if (collected.size === 1 && collected.has(current)) {
    // 수집이 한 장뿐이고 그게 현재 카드면 자기 자신으로 도는 링크는 만들지 않는다.
    return { prev: null, next: null };
  }

  const collectedOrdered = orderedSlugs.filter((slug) => collected.has(slug));
  const idx = collectedOrdered.indexOf(current);
  if (idx !== -1) {
    // 현재 카드가 수집 목록에 있으면 그 목록 안에서 앞뒤로, 끝에서 순환한다.
    const n = collectedOrdered.length;
    return {
      prev: collectedOrdered[(idx - 1 + n) % n],
      next: collectedOrdered[(idx + 1) % n],
    };
  }

  // URL 직접 진입 등으로 현재 카드가 수집 목록에 없으면, 전체 순서 기준으로
  // 앞쪽의 마지막 수집 카드와 뒤쪽의 첫 수집 카드를 찾는다(없으면 순환).
  const curIdx = orderedSlugs.indexOf(current);
  if (curIdx === -1) return { prev: null, next: null };

  const total = orderedSlugs.length;
  let prev: string | null = null;
  for (let step = 1; step <= total; step += 1) {
    const slug = orderedSlugs[(curIdx - step + total) % total];
    if (collected.has(slug)) {
      prev = slug;
      break;
    }
  }
  let next: string | null = null;
  for (let step = 1; step <= total; step += 1) {
    const slug = orderedSlugs[(curIdx + step) % total];
    if (collected.has(slug)) {
      next = slug;
      break;
    }
  }
  return { prev, next };
}
