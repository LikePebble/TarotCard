import { privacyDocument } from "./privacy";
import { termsDocument } from "./terms";
import type { LegalDocument, LegalDocumentId } from "./types";

export type {
  LegalDocument,
  LegalDocumentId,
  LegalRevision,
  LegalSection,
} from "./types";
export { operator, operatorBullets } from "./operator";
export { termsDocument } from "./terms";
export { privacyDocument } from "./privacy";

/** 문서 id로 찾을 수 있게 모아 둔 목록. */
export const legalDocuments: Record<LegalDocumentId, LegalDocument> = {
  terms: termsDocument,
  privacy: privacyDocument,
};

/** 화면에 표시할 한국어 날짜. `2026-07-28` → `2026년 7월 28일`. */
export function formatLegalDate(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}
