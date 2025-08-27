"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useTheme } from "next-themes"
import { useThemeStore } from "@/hooks/zustand"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      <ThemeSync>{children}</ThemeSync>
    </NextThemesProvider>
  )
}

function ThemeSync({ children }: { children: React.ReactNode }) {
  const { theme: nextTheme, setTheme } = useTheme()
  const theme = useThemeStore((s) => s.theme)

  // When Zustand theme changes, update next-themes
  React.useEffect(() => {
    if (!nextTheme) return
    if (theme !== nextTheme) {
      setTheme(theme)
    }
  }, [theme, nextTheme, setTheme])

  return <>{children}</>
}
