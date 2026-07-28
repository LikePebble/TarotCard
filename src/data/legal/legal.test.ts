import { describe, expect, it } from "vitest";
import {
  formatLegalDate,
  legalDocuments,
  privacyDocument,
  termsDocument,
  type LegalDocument,
} from "@/data/legal";

const VERSION = /^\d+\.\d+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** `0.9` → 9, `1.10` → 1010. 버전 정렬 비교용. */
function versionOrder(version: string): number {
  const [major, minor] = version.split(".").map(Number);
  return major * 1000 + minor;
}

const documents: LegalDocument[] = Object.values(legalDocuments);

describe("legal 문서 공통 규칙", () => {
  it("두 문서가 모두 등록되어 있다", () => {
    expect(legalDocuments.terms).toBe(termsDocument);
    expect(legalDocuments.privacy).toBe(privacyDocument);
    expect(documents).toHaveLength(2);
  });

  it.each(documents)("$id: 버전이 주.부 형식이다", (doc) => {
    expect(doc.version).toMatch(VERSION);
  });

  it.each(documents)("$id: 시행일이 YYYY-MM-DD 형식이다", (doc) => {
    expect(doc.effectiveDate).toMatch(DATE);
    expect(Number.isNaN(Date.parse(doc.effectiveDate))).toBe(false);
  });

  it.each(documents)("$id: 개정 이력이 비어 있지 않다", (doc) => {
    expect(doc.revisions.length).toBeGreaterThan(0);
  });

  it.each(documents)("$id: 최신 개정 이력이 문서의 판과 일치한다", (doc) => {
    const latest = doc.revisions[0];
    expect(latest.version).toBe(doc.version);
    expect(latest.effectiveDate).toBe(doc.effectiveDate);
    expect(latest.summary.trim().length).toBeGreaterThan(0);
  });

  it.each(documents)("$id: 개정 이력이 최신순(버전 내림차순)이다", (doc) => {
    const orders = doc.revisions.map((r) => versionOrder(r.version));
    const descending = [...orders].sort((a, b) => b - a);
    expect(orders).toEqual(descending);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it.each(documents)("$id: 모든 개정 이력 항목의 형식이 올바르다", (doc) => {
    for (const r of doc.revisions) {
      expect(r.version).toMatch(VERSION);
      expect(r.effectiveDate).toMatch(DATE);
    }
  });

  it.each(documents)("$id: 모든 섹션에 제목과 내용이 있다", (doc) => {
    expect(doc.sections.length).toBeGreaterThan(0);
    for (const s of doc.sections) {
      expect(s.heading.trim().length).toBeGreaterThan(0);
      const items = s.paragraphs.length + (s.bullets?.length ?? 0);
      expect(items).toBeGreaterThan(0);
      for (const text of [...s.paragraphs, ...(s.bullets ?? [])]) {
        expect(text.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it.each(documents)("$id: 섹션 제목이 중복되지 않는다", (doc) => {
    const headings = doc.sections.map((s) => s.heading);
    expect(new Set(headings).size).toBe(headings.length);
  });

  it.each(documents)("$id: 사전 공개판임을 본문에서 알린다", (doc) => {
    expect(bodyOf(doc)).toContain("사전 공개판");
  });
});

/** 문서의 모든 본문 텍스트를 한 덩어리로 잇는다. */
function bodyOf(doc: LegalDocument): string {
  return doc.sections
    .flatMap((s) => [s.heading, ...s.paragraphs, ...(s.bullets ?? [])])
    .join("\n");
}

/** 문서에 주어진 조각을 제목에 포함하는 섹션이 있는지. */
function hasHeading(doc: LegalDocument, fragment: string): boolean {
  return doc.sections.some((s) => s.heading.includes(fragment));
}

describe("이용약관", () => {
  // 버전 숫자를 박아 두면 개정할 때마다 이 테스트만 깨진다. 지켜야 할 것은
  // 특정 숫자가 아니라 "본문의 시행 문구가 실제 버전·시행일과 같다"는 것이다.
  it("부칙의 시행 문구가 실제 버전·시행일과 어긋나지 않는다", () => {
    const body = bodyOf(termsDocument);
    expect(body).toContain(`버전 ${termsDocument.version}`);
    expect(body).toContain(formatLegalDate(termsDocument.effectiveDate));
  });

  it.each([
    "목적",
    "정의",
    "약관의 효력과 개정",
    "서비스의 내용",
    "타로 해석의 성격과 한계",
    "계정",
    "이용자의 의무",
    "저작권",
    "유료 서비스",
    "광고",
    "책임의 제한",
    "준거법",
    "문의",
  ])("필수 조항 '%s'을(를) 포함한다", (fragment) => {
    expect(hasHeading(termsDocument, fragment)).toBe(true);
  });

  it("타로 해석이 전문적 조언이 아님을 분명히 밝힌다", () => {
    const body = bodyOf(termsDocument);
    for (const word of ["의료", "법률", "재무", "보장하지 않습니다"]) {
      expect(body).toContain(word);
    }
  });

  it("아직 제공하지 않는 결제 기능을 제공한다고 쓰지 않는다", () => {
    const body = bodyOf(termsDocument);
    expect(body).toContain("현재 서비스는 결제 기능을 제공하지 않습니다");
  });
});

describe("개인정보처리방침", () => {
  it("부칙의 시행 문구가 실제 버전·시행일과 어긋나지 않는다", () => {
    const body = bodyOf(privacyDocument);
    expect(body).toContain(`버전 ${privacyDocument.version}`);
    expect(body).toContain(formatLegalDate(privacyDocument.effectiveDate));
  });

  it.each([
    "항목", // 수집·처리하는 개인정보 항목
    "이용 목적",
    "보유 및 이용 기간",
    "제3자 제공",
    "위탁",
    "쿠키",
    "권리",
    "문의",
    "안전성 확보 조치",
  ])("필수 조항 '%s'을(를) 포함한다", (fragment) => {
    expect(hasHeading(privacyDocument, fragment)).toBe(true);
  });

  it("서버에 저장되는 테이블의 정보를 빠짐없이 안내한다", () => {
    const body = bodyOf(privacyDocument);
    for (const word of [
      "이메일",
      "리딩 주제",
      "도감",
      "일별 기록",
      "소유 정보",
    ]) {
      expect(body).toContain(word);
    }
  });

  it("기기에만 저장되는 localStorage 키를 모두 밝힌다", () => {
    const body = bodyOf(privacyDocument);
    for (const key of [
      "arcana.v1",
      "arcana.journal.v1",
      "arcana.entitlements.v1",
      "arcana.collection.unseen.v1",
      "arcana.deck",
      "arcana.reading.focus",
      "arcana.reading.spread",
    ]) {
      expect(body).toContain(key);
    }
  });

  it("위탁하는 제3자를 모두 밝힌다", () => {
    const body = bodyOf(privacyDocument);
    for (const vendor of [
      "Supabase",
      "Vercel",
      "카카오",
      "구글",
      "Google Fonts",
      "Google AdSense",
    ]) {
      expect(body).toContain(vendor);
    }
  });

  it("광고 쿠키 해제 경로를 안내한다", () => {
    const body = bodyOf(privacyDocument);
    expect(body).toContain("adssettings.google.com");
    expect(body).toContain("www.aboutads.info");
    expect(body).toContain("DoubleClick");
  });

  it("AdSense를 아직 도입하지 않았음을 밝힌다", () => {
    const body = bodyOf(privacyDocument);
    expect(body).toContain("아직 도입되지 않았으며");
  });

  it("RLS와 클라이언트 수정 불가 사실을 정확히 서술한다", () => {
    const body = bodyOf(privacyDocument);
    expect(body).toContain("행 수준 보안");
    expect(body).toContain("클라이언트에서 수정할 수 없습니다");
  });

  it("로그아웃 시 기기 기록이 삭제된다는 점을 밝힌다", () => {
    expect(bodyOf(privacyDocument)).toContain("로그아웃하시면");
  });
});

describe("formatLegalDate", () => {
  it("한국어 날짜로 바꾼다", () => {
    expect(formatLegalDate("2026-07-28")).toBe("2026년 7월 28일");
    expect(formatLegalDate("2026-12-01")).toBe("2026년 12월 1일");
  });
});
