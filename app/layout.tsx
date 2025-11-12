import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "junogarden",
    template: "%s | junogarden",
  },
  description: "개인 프로젝트와 생각을 기록하는 실험 공간",
  keywords: ["블로그", "프로젝트", "개발", "기록", "포트폴리오"],
  authors: [{ name: "junho" }],
  creator: "junho",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://junogarden.com",
    title: "junogarden",
    description: "개인 프로젝트와 생각을 기록하는 실험 공간",
    siteName: "junogarden",
  },
  twitter: {
    card: "summary_large_image",
    title: "junogarden",
    description: "개인 프로젝트와 생각을 기록하는 실험 공간",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#main-content" className="skip-to-main">
          메인 컨텐츠로 건너뛰기
        </a>
        {children}
      </body>
    </html>
  );
}
