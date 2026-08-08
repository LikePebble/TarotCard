import type { NextConfig } from "next";

/**
 * 카드 아트가 검색 이미지로 퍼지는 것을 막는다.
 *
 * 이 헤더가 막는 것: 구글·빙 이미지 검색이 아트를 **자기 갤러리에 담아
 * 원본 크기로 내보내는 것**. 카드 아트는 별도 파이프라인에서 구워 내는
 * 이 서비스의 자산이고, 이미지 검색은 그것을 페이지 밖에서 소비하게 한다.
 *
 * 이 헤더가 막지 못하는 것: 사람이 저장하는 것, 규칙을 무시하는 봇,
 * 스크린샷. 그건 헤더로 막을 수 있는 종류가 아니다.
 *
 * 페이지 자체의 색인은 건드리지 않는다 — 카드 상세 78쪽을 검색에 올리는
 * 것이 지금 가장 중요한 일이고, `noindex`를 이미지 경로에만 두면 페이지는
 * 그대로 색인된다.
 */
const ART_PATHS = ["/decks/:path*", "/tarotdeck/:path*"];

const nextConfig: NextConfig = {
  async headers() {
    return [
      ...ART_PATHS.map((source) => ({
        source,
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
          // 정적 아트는 바뀌지 않는다. 오래 캐싱해 재요청 자체를 줄인다.
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      })),
      {
        // next/image가 최적화해 내보내는 경로. 원본과 별개의 URL이라
        // 여기에도 같은 규칙을 걸어야 이미지 검색이 우회하지 못한다.
        source: "/_next/image",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default nextConfig;
