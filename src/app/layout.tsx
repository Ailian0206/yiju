import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "一局 · 找猫",
  description: "轻量中文网页文字游戏:天黑前找回走丢的猫「年糕」。",
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
