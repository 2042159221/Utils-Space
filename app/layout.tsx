import type { Metadata } from 'next';
import './globals.css'; // 我们稍后会创建这个全局样式文件

export const metadata: Metadata = {
  title: '实用工具集',
  description: 'Ming 和 AI 助手共同开发的在线工具集',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="light">
      <body>{children}</body>
    </html>
  );
}