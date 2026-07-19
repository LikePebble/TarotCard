import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif-kr",
  display: "swap",
});

const wantedSans = localFont({
  src: "../fonts/WantedSansVariable.woff2",
  variable: "--font-wanted-sans",
  display: "swap",
  weight: "400 1000",
});

export const metadata: Metadata = {
  title: "아르카나",
  description:
    "하루 한 장, 나를 비추는 카드. 카드를 뽑고 해석을 읽으며 78장의 컬렉션을 완성해 보세요.",
};

export const viewport: Viewport = {
  themeColor: "#14110d",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${notoSerifKr.variable} ${wantedSans.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
