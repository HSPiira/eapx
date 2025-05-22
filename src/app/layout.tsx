import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { SettingsProvider } from "@/context/settings-context";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/providers/auth-provider";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "careAxis",
  description: "Your one stop Employee Wellness centre.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SettingsProvider>
                <AuthGuard>
                  {children}
                </AuthGuard>
              </SettingsProvider>
            </ThemeProvider>
          </ReactQueryProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
