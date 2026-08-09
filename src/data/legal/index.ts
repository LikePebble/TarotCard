import { privacyDocument } from "./privacy";
import { privacyDocumentEn } from "./privacy-en";
import { termsDocument } from "./terms";
import { termsDocumentEn } from "./terms-en";
import type { LegalDocument, LegalDocumentId } from "./types";
import type { Locale } from "@/lib/locale";

export type {
  LegalDocument,
  LegalDocumentId,
  LegalRevision,
  LegalSection,
} from "./types";
export { operator, operatorBullets } from "./operator";
export { termsDocument } from "./terms";
export { termsDocumentEn } from "./terms-en";
export { privacyDocument } from "./privacy";
export { privacyDocumentEn } from "./privacy-en";

/** 문서 id로 찾을 수 있게 모아 둔 목록. */
export const legalDocuments: Record<LegalDocumentId, LegalDocument> = {
  terms: termsDocument,
  privacy: privacyDocument,
};

/** 요청 로케일에 맞는 법적 문서 목록. URL과 문서 id는 언어와 무관하게 유지한다. */
export const legalDocumentsByLocale: Record<
  Locale,
  Record<LegalDocumentId, LegalDocument>
> = {
  ko: legalDocuments,
  en: {
    terms: termsDocumentEn,
    privacy: privacyDocumentEn,
  },
};

export function getLegalDocument(
  id: LegalDocumentId,
  locale: Locale,
): LegalDocument {
  return legalDocumentsByLocale[locale][id];
}

/** 법적 문서에 표시할 날짜. 기본값은 기존 한국어 호출 계약을 유지한다. */
export function formatLegalDate(date: string, locale: Locale = "ko"): string {
  const [y, m, d] = date.split("-");
  if (locale === "en") {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(Number(y), Number(m) - 1, Number(d))));
  }
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}
