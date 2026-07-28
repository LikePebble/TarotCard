import type { Metadata, Viewport } from "next";
import { Nanum_Myeongjo } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SyncBridge } from "@/components/SyncBridge";
import { ADSENSE_CLIENT, GA_ID } from "@/lib/analytics";
import "./globals.css";

const SITE_URL = "https://arca.realm.ai.kr";

// 본문 해석문(나눔명조). Google Fonts에서 로드.
// preload:false — next/font가 한글 unicode-range 서브셋 93개를 전부 preload하면
// 초기 페이로드에 약 2.8MB가 실린다. rel=preload는 unicode-range를 무시하므로
// 브라우저의 지연 로딩이 무력화된다. display:"swap"과 함께 필요한 서브셋만 받게 둔다.
const nanumMyeongjo = Nanum_Myeongjo({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-nanum-myeongjo",
  display: "swap",
  preload: false,
});

// 타이틀(빛의 계승자체). KS X 1001 서브셋 self-host. 라이선스는 src/fonts/README.md.
const heirOfLight = localFont({
  src: [
    { path: "../fonts/HeirofLight-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/HeirofLight-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-heir-of-light",
  display: "swap",
});

// UI·안내 문구(조선일보명조체). 서브셋 self-host. 라이선스는 src/fonts/README.md.
const chosun = localFont({
  src: "../fonts/Chosun-Regular.woff2",
  variable: "--font-chosun",
  display: "swap",
  weight: "400",
});

const SITE_NAME = "아르카 타로";
const SITE_TITLE = "아르카 타로 — 하루 한 장, 나를 비추는 카드 78장";
const SITE_DESCRIPTION =
  "78장의 타로 카드를 정방향과 역방향으로, 사랑·일·나 자신·건강·금전 다섯 가지 주제에 맞추어 한국어로 풀어냅니다. 오늘의 카드를 무료로 뽑고, 조용히 나를 돌아보는 시간을 가져 보세요.";
// 공유 카드 전용 가로 이미지. 1200×630은 페이스북·X·카카오톡이 큰 카드로
// 렌더하는 규격이다. 이전에 쓰던 덱 표지는 800×1360 세로라 가로 띠로 잘렸다.
// webp 대신 jpg인 이유: 일부 메신저 크롤러가 webp 미리보기를 만들지 못한다.
const SITE_OG_IMAGE = {
  url: "/brand/og-cover.jpg",
  width: 1200,
  height: 630,
  alt: "아르카 타로 — 하루 한 장, 나를 비추는 카드",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // URL 인스턴스로 두면 next/font가 아닌 metadata 리졸버가 각 페이지의 pathname으로
  // 다시 계산해 준다(resolveAlternateUrl). 문자열 "/"를 쓰면 이 값이 하위 세그먼트로
  // 그대로 상속돼 모든 페이지의 canonical이 홈을 가리킨다.
  alternates: { canonical: new URL(SITE_URL) },
  // 네이버 서치어드바이저 사이트 소유 확인. 구글은 GA 연동으로 확인하므로
  // google 항목을 두지 않는다.
  verification: {
    other: {
      "naver-site-verification":
        "1791e0af488a005563febe9dc474d108be5196de",
    },
  },
  // AdSense 사이트 소유 확인용 메타. 게시자 ID가 없으면 other 자체를 두지 않아
  // 태그가 한 줄도 나가지 않는다(빈 content로 남으면 심사에서 오히려 걸린다).
  ...(ADSENSE_CLIENT
    ? { other: { "google-adsense-account": ADSENSE_CLIENT } }
    : {}),
  // og:url은 두지 않는다. canonical과 달리 Next가 페이지별로 다시 계산해 주지
  // 않아, "/"로 두면 자체 openGraph가 없는 /reading·/collection·/my를 공유할 때
  // og:url만 홈을 가리킨다. 없는 편이 틀린 것보다 낫다. 카드 상세는 스스로
  // 정확한 url을 넣는다.
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: "#14110d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`${heirOfLight.variable} ${nanumMyeongjo.variable} ${chosun.variable}`}
    >
      <body className="font-sans antialiased">
        <SyncBridge />
        {children}
        <Analytics />
        <SpeedInsights />
        {/* GA4. 측정 ID가 없으면 스크립트도 dataLayer도 만들지 않는다.
            @next/third-parties는 Next 15가 권장하는 경로로, 스크립트 로딩
            전략(afterInteractive)과 라우트 변경 시 page_view 전송을 대신 맡는다. */}
        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
        {/* AdSense 라이브러리. 심사 신청 시점에 사이트에 스니펫이 있어야 해서
            미리 넣지만, 게시자 ID가 없으면 렌더하지 않는다. 슬롯 배치는 여기서
            하지 않는다 — 광고 단위는 별도 컴포넌트의 몫이다. */}
        {ADSENSE_CLIENT ? (
          <Script
            id="adsbygoogle-init"
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          />
        ) : null}
      </body>
    </html>
  );
}
