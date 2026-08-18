"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";

type Props = ThemeProviderProps & {
  /** False on demo deployments with no auth credentials configured. */
  authEnabled?: boolean;
};

export function ThemeProvider({ children, authEnabled = true, ...props }: Props) {
  // Created inside the component so each browser session gets its own cache
  // rather than sharing one module-level client.
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // SessionProvider polls /api/auth/session on mount. Without NextAuth secrets
  // that endpoint 500s, filling the console with errors on a page that has no
  // sign-in to offer — so only mount it when auth can actually work.
  const content = authEnabled ? (
    <SessionProvider>{children}</SessionProvider>
  ) : (
    children
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        {...props}
      >
        {content}
      </NextThemesProvider>
    </QueryClientProvider>
  );
}
