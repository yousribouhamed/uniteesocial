"use client";

import React from "react";
import { SSRProvider } from "@react-aria/ssr";
import { ThemeProvider } from "@/components/theme-provider";
import { GlobalToastRegion } from "@/components/ui/aria-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SSRProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <GlobalToastRegion />
      </ThemeProvider>
    </SSRProvider>
  );
}
