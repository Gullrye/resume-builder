import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "简历生成器",
  description: "快速创建专业简历，实时预览，一键导出 PDF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased font-display">{children}</body>
    </html>
  );
}
