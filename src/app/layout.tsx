import type { Metadata, Viewport } from "next";
import { Nanum_Myeongjo } from "next/font/google";
import localFont from "next/font/local";
import { NoPinchZoom } from "@/components/NoPinchZoom";
import { SyncBridge } from "@/components/SyncBridge";
import "./globals.css";

// 본문 해석문(나눔명조). Google Fonts에서 로드.
const nanumMyeongjo = Nanum_Myeongjo({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-nanum-myeongjo",
  display: "swap",
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

export const metadata: Metadata = {
  title: "아르카나",
  description:
    "하루 한 장, 나를 비추는 카드. 카드를 뽑고 해석을 읽으며 78장의 컬렉션을 완성해 보세요.",
};

export const viewport: Viewport = {
  themeColor: "#14110d",
  // 앱형 UX: 손가락으로 화면 확대(핀치줌) 되지 않도록 고정.
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <NoPinchZoom />
        <SyncBridge />
        {children}
      </body>
    </html>
  );
}
