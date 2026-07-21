import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "一局",
  description: "轻量中文网页文字游戏平台:有限回合、可见状态、明确结局。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
