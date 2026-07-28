import type { MetadataRoute } from "next";

const SITE_URL = "https://arca.realm.ai.kr";

/**
 * 개인 기록(/my), 로그인, 뽑기 진행 화면은 색인 대상이 아니다.
 * `?readingId=`는 값 공간이 무한해서 같은 카드 상세가 무수한 URL로 복제되므로
 * 크롤에서 뺀다(파라미터 자체는 이전/다음 이동 맥락에 필요해 유지).
 *
 * "/my"와 "/my/"를 둘 다 적는다 — 접두사 규칙이라 "/my/"는 하위 경로에만
 * 맞고 정확히 "/my"인 계정 허브에는 맞지 않는다.
 *
 * 레거시 `/cards`는 여기서 막지 않는다. 크롤을 막으면 응답의
 * X-Robots-Tag: noindex를 읽을 수 없어, 색인에서 빼려던 의도가 오히려
 * 좌절된다(크롤 안 된 URL은 링크만으로 검색결과에 남을 수 있다).
 * 두 신호를 함께 쓰지 않고 noindex 한쪽만 쓴다.
 */
const DISALLOW = ["/my", "/my/", "/login", "/reading/draw", "/*?readingId="];

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
