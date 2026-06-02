"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export const ThemeProvider = ({ children }: { children: ReactNode }) => (
  <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
    {children}
  </NextThemesProvider>
);
