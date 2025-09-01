// src/app/layout.tsx
import AuthProvider from "@/components/Providers/AuthProvider";
import { AppAuthProvider } from "@/hooks/auth";
import QueryProvider from "@/components/Providers/QueryProvider";
import { OnboardingProvider } from "@/components/Providers/OnboardingProvider";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "sonner";
import { UniversalLoader } from "@/components/ui/universal-loader";
import { FloatingChatbotButton } from "@/components/chatbot/FloatingChatbotButton";
import { ConditionalPadding } from "@/components/ui/conditional-padding";

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
                const theme = localStorage.getItem('app-theme') || 'dark';
                document.documentElement.classList.toggle('dark', theme === 'dark');
                document.documentElement.classList.toggle('light', theme === 'light');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <AppAuthProvider>
                <UniversalLoader>
                  <OnboardingProvider>
                    <Navbar />
                    <ConditionalPadding>
                      {children}
                    </ConditionalPadding>
                    <FloatingChatbotButton />
                    <Toaster />
                    <Footer />
                  </OnboardingProvider>
                </UniversalLoader>
              </AppAuthProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}