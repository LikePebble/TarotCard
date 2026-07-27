/**
 * 약관·방침 문서의 데이터 모델.
 *
 * 본문은 페이지 컴포넌트가 아니라 이 데이터로 관리한다. 문구가 바뀔 때마다
 * `version`을 올리고 `revisions` 맨 앞에 개정 항목을 추가한다 — 어느 판을 언제부터
 * 적용했는지 이용자에게 보여 줄 수 있어야 하기 때문이다.
 */

/** 문서의 한 조(條). heading은 화면에서 <h2>로 렌더된다. */
export type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

/** 개정 이력 한 건. */
export type LegalRevision = {
  version: string;
  /** 시행일. YYYY-MM-DD. */
  effectiveDate: string;
  summary: string;
};

export type LegalDocumentId = "terms" | "privacy";

export type LegalDocument = {
  id: LegalDocumentId;
  title: string;
  /** 이번 판 버전. `주.부` 형식. */
  version: string;
  /** 이번 판 시행일. YYYY-MM-DD. */
  effectiveDate: string;
  sections: LegalSection[];
  /** 개정 이력. 최신순(버전 내림차순)으로 둔다. */
  revisions: LegalRevision[];
};
