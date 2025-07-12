"use client";

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { ErrorBoundary } from "@/components/providers/error-boundary";
import { AccessibilityProvider } from "@/components/providers/accessibility-provider";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast-provider";
import ThemeInitializer from "@/components/theme/ThemeInitializer";

export function RootProvider({ children, resources }: { children: React.ReactNode, resources?: any }) {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <I18nProvider resources={resources}> 
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
            </QueryProvider>
            <Toaster />
            <ToastProvider />
            <ThemeInitializer />
          </ThemeProvider>
        </I18nProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}