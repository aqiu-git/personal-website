import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "AQ Space",
    template: "%s | AQ Space"
  },
  description: "个人博客、生活记录、猫咪相册、摄影作品集和技术知识库。"
};

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => (
  <html lang="zh-CN" suppressHydrationWarning>
    <body>
      <ThemeProvider>
        <SiteHeader />
        {children}
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
