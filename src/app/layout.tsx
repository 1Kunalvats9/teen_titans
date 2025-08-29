// src/app/layout.tsx
import AuthProvider from "@/components/Providers/AuthProvider";
import { AppAuthProvider } from "@/hooks/auth";
import QueryProvider from "@/components/Providers/QueryProvider";
import { OnboardingProvider } from "@/components/Providers/OnboardingProvider";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ui/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    //@ts-expect-error Next.js custom attribute 'webcrx' is injected by extension
    <html lang="en" webcrx="" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('app-theme') || 'light';
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <AppAuthProvider>
                <OnboardingProvider>
                  <Navbar />
                  {children}
                  <Footer />
                </OnboardingProvider>
              </AppAuthProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}