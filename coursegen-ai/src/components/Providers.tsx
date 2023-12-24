//this will be the thme provider that wraps our app and lets all our components knwo if it slight or dark themer
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import { SessionProvider } from "next-auth/react"

const queryClient = new QueryClient();
//react query does a lot of caching ,[say we are on page fo app adn fetch same end point on diffrent appliactions page, react query understands it and fetches it and caches the previous end point and does  not need to sennd the request again]

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return  <QueryClientProvider client={queryClient }>
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      <SessionProvider>
      {children}
      </SessionProvider>
      </NextThemesProvider>
  </QueryClientProvider>
  
}
