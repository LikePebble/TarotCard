import type { MetadataRoute } from "next";

const SITE_URL = "https://arca.realm.ai.kr";

/**
 * 개인 기록(/my), 로그인, 뽑기 진행 화면, 레거시 JSON 엔드포인트는 색인 대상이
 * 아니다. `?readingId=`는 값 공간이 무한해서 같은 카드 상세가 무수한 URL로
 * 복제되므로 크롤에서 뺀다(파라미터 자체는 이전/다음 이동 맥락에 필요해 유지).
 */
const DISALLOW = [
  "/my/",
  "/login",
  "/reading/draw",
  "/cards",
  "/cards/onecard",
  "/*?readingId=",
];

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
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
