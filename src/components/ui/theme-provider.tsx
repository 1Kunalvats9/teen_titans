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
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="app-theme"
      {...props}
    >
      <ThemeSync>{children}</ThemeSync>
    </NextThemesProvider>
  )
}

function ThemeSync({ children }: { children: React.ReactNode }) {
  const { theme: nextTheme, setTheme, resolvedTheme } = useTheme()
  const theme = useThemeStore((s) => s.theme)

  // Sync Zustand with next-themes on mount
  React.useEffect(() => {
    if (resolvedTheme && !theme) {
      useThemeStore.getState().setTheme(resolvedTheme as 'light' | 'dark')
    }
  }, [resolvedTheme, theme])

  // When Zustand theme changes, update next-themes
  React.useEffect(() => {
    if (theme && theme !== nextTheme) {
      setTheme(theme)
    }
  }, [theme, nextTheme, setTheme])

  // Ensure DOM classes are properly set
  React.useEffect(() => {
    if (typeof window !== 'undefined' && theme) {
      document.documentElement.classList.toggle('dark', theme === 'dark')
      document.documentElement.classList.toggle('light', theme === 'light')
    }
  }, [theme])

  return <>{children}</>
}
