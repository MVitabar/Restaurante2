"use client"

import React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider } from "@/components/i18n-provider"
import { AuthProvider } from "@/components/auth-provider"
import { FirebaseProvider } from "@/components/firebase-provider"
import { FirebaseError } from "@/components/firebase-error"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { useAuth } from "@/components/auth-provider"
import LoginPage from "@/app/login/page"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <FirebaseProvider>
            <FirebaseError />
            <AuthProvider>
              <I18nProvider>
                {!user && !loading ? (
                  // Explicitly render LoginPage when no user is authenticated
                  <LoginPage />
                ) : (
                  // Normal layout when user is authenticated
                  <div className="flex min-h-screen flex-col">
                    <CollapsibleSidebar />
                    <main className="flex-1 transition-all duration-300 md:pt-0 pt-16">
                      {children}
                    </main>
                    <Toaster />
                  </div>
                )}
              </I18nProvider>
            </AuthProvider>
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}