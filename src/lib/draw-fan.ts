/** 중앙 카드가 가장 위에 오도록 부채꼴 카드의 시각·클릭 순서를 정한다. */
export function fanStackOrder(index: number, size: number): number {
  const center = (size - 1) / 2;
  return Math.round(size - Math.abs(index - center));
}
