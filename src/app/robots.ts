import type { MetadataRoute } from "next";

const SITE_URL = "https://arca.realm.ai.kr";

/**
 * 색인 제외는 각 화면의 `robots: noindex` 또는 응답의 X-Robots-Tag로 처리한다.
 * robots.txt에서 먼저 막으면 Google이 그 noindex/canonical 신호를 읽지 못한다.
 *
 * 특히 카드 상세의 `?readingId=` 변형은 canonical이 쿼리 없는 클래식 카드 URL을
 * 가리킨다. 크롤을 허용해야 그 canonical을 읽고 한 URL로 통합할 수 있다.
 */

/** 답변 엔진 크롤러. 지금도 막혀 있지 않지만, 허용을 명시해 두어야 안전하다. */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "Google-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
