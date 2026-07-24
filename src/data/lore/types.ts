/** 카드 한 장의 로어. RWS(라이더-웨이트) 도상 기준 공통 1벌 — 세 덱이 공유한다. */
export type LoreSymbol = { name: string; meaning: string };

export type CardLore = {
  /** 카드 그림 속 상징 3~5개. 서술은 아트 중립(특정 덱 그림을 지시하지 않는다). */
  symbols: LoreSymbol[];
  /** 1~2문단(\n\n). 메이저=카드 개별 이야기, 마이너=수트·숫자 흐름 속 이 카드의 자리. */
  story: string;
  /** 카드 고유 점성술 대응(황금새벽회). 메이저=행성·별자리, 마이너 2~10=데칸. 에이스·코트는 없음. */
  astrology?: string;
};
