import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/lib/theme-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AyatBits - Gamified Quranic Study",
  description: "Learn and memorize Quranic verses through fun, interactive puzzles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: 'dark',
        elements: {
          modalContent: 'bg-gray-900 border-gray-800',
          modalBackdrop: 'bg-black/80',
          card: 'bg-gray-900 border-gray-800',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-400',
          socialButtonsBlockButton: 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700',
          formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-white',
          formFieldInput: 'bg-gray-800 border-gray-700 text-white',
          formFieldLabel: 'text-gray-300',
          footerActionLink: 'text-green-500 hover:text-green-400',
          identityPreviewText: 'text-white',
          identityPreviewEditButton: 'text-green-500',
          formResendCodeLink: 'text-green-500',
          otpCodeFieldInput: 'bg-gray-800 border-gray-700 text-white',
        },
      }}
    >
      <html lang="en" className="dark" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
