/** 중앙 카드가 가장 위에 오도록 부채꼴 카드의 시각·클릭 순서를 정한다. */
export function fanStackOrder(index: number, size: number): number {
  const center = (size - 1) / 2;
  return Math.round(size - Math.abs(index - center));
}

/** 기존 부채꼴의 모바일·데스크톱 각도를 확정값으로 만든다. */
export function fanRotation(
  offset: number,
  spread: "one" | "three",
  desktop = false,
): string {
  const step = desktop ? 8 : spread === "three" ? 9 : 12;
  return `${offset * step}deg`;
}
