import { focusLabelOf } from "@/data/focus";
import type { SpreadType } from "@/lib/store";

/**
 * 하루치 리딩 탭에 필요한 최소 형태. ReadingRecord가 구조적으로 이 타입을
 * 만족하므로 그대로 넘길 수 있고, 테스트는 가벼운 리터럴만 만들면 된다.
 */
export type DayReading = {
  id: string;
  at: string; // ISO
  spread: SpreadType;
  category: string; // focus id
};

/** 리딩 유형(스프레드) 이름. */
export function readingTypeLabel(spread: SpreadType): string {
  return spread === "one" ? "오늘의 카드" : "과거 · 현재 · 미래";
}

/**
 * 탭에 쓸 주제 이름.
 *
 * 리딩 화면의 "오늘 하루"를 일기에서 그대로 쓰면 지난 날짜를 열었을 때
 * "오늘"이 어제를 가리키게 된다. 일기는 과거 날짜를 여는 화면이므로 여기서만
 * 시점을 뺀 "하루"로 부른다. 나머지 주제는 시점어가 없어 그대로 쓴다.
 */
function tabTopicLabel(category: string): string {
  return category === "day" ? "하루" : focusLabelOf(category);
}

/**
 * 탭 라벨(순수). 같은 날의 리딩은 주제(포커스)로 갈리므로 주제 이름을 기본으로
 * 쓴다. 유형 라벨은 선택된 패널 안에 이미 있어 탭에서 반복할 이유가 없다.
 * 다만 주제가 겹치면(예: 사랑 오늘의 카드 + 사랑 과거·현재·미래) 유형을 덧붙이고,
 * 그래도 겹치면 순번을 붙여 탭 이름이 중복되지 않게 한다.
 */
export function readingTabLabels(readings: DayReading[]): string[] {
  const topics = readings.map((r) => tabTopicLabel(r.category));
  const topicCount = countBy(topics);

  const labels = readings.map((r, i) =>
    topicCount.get(topics[i]) === 1
      ? topics[i]
      : `${topics[i]} (${readingTypeLabel(r.spread)})`,
  );

  const labelCount = countBy(labels);
  const seen = new Map<string, number>();
  return labels.map((label) => {
    if (labelCount.get(label) === 1) return label;
    const n = (seen.get(label) ?? 0) + 1;
    seen.set(label, n);
    return `${label} ${n}`;
  });
}

function countBy(values: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return counts;
}

/**
 * 처음 열었을 때 선택할 탭(순수). 그날 마지막으로 뽑은 리딩을 연다 —
 * 일기를 쓰러 오는 시점에 가장 가까운 리딩이 방금 뽑은 그것이기 때문이다.
 * at이 같으면 뒤에 저장된 쪽(=배열 뒤쪽)을 고른다.
 */
export function defaultReadingTabIndex(readings: DayReading[]): number {
  let best = 0;
  for (let i = 1; i < readings.length; i += 1) {
    if (readings[i].at >= readings[best].at) best = i;
  }
  return best;
}

/**
 * 현재 선택된 탭(순수). 사용자가 고른 리딩이 목록에 있으면 그것을, 없으면
 * (아직 안 골랐거나 날짜가 바뀌어 목록이 갈린 경우) 기본 탭을 쓴다.
 */
export function activeReadingIndex(
  readings: DayReading[],
  selectedId: string | null,
): number {
  const picked = readings.findIndex((r) => r.id === selectedId);
  return picked === -1 ? defaultReadingTabIndex(readings) : picked;
}
