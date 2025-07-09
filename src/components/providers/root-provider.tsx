"use client";

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { Toaster } from "@/components/ui/toaster";
import ThemeInitializer from "@/components/theme/ThemeInitializer";

export function RootProvider({ children, resources }: { children: React.ReactNode, resources?: any }) {
  return (
    <I18nProvider resources={resources}> 
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
        <ThemeInitializer />
      </ThemeProvider>
    </I18nProvider>
  );
}