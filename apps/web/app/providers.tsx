"use client";
import { ThemeProvider } from "next-themes";
import { AuthenticationProvider } from "./authentication-provider";
import { useInAppBrowserBypassing } from "./lib/hooks/use-in-app-browser-bypass";

export function Providers({ children }: { children: React.ReactNode }) {
  useInAppBrowserBypassing();
  return (
    <ThemeProvider defaultTheme="system" enableSystem={true} attribute="class">
      <AuthenticationProvider>{children}</AuthenticationProvider>
    </ThemeProvider>
  );
}
