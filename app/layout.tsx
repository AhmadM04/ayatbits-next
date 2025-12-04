import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/Toast";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a", // Always dark theme
};

export const metadata: Metadata = {
  title: "AyatBits - Gamified Quranic Study",
  description: "Learn and memorize Quranic verses through fun, interactive puzzles",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AyatBits",
  },
  formatDetection: {
    telephone: false,
  },
};

const clerkAppearance: any = {
  baseTheme: "dark",
  variables: {
    colorPrimary: "#16a34a",
    colorBackground: "#0a0a0a",
    colorInputBackground: "#111",
    colorText: "#ffffff",
    colorTextSecondary: "#9ca3af",
    colorInputText: "#ffffff",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    rootBox: "shadow-none",
    card: "bg-[#111] border border-white/10",
    headerTitle: "text-white",
    headerSubtitle: "text-gray-400",
    socialButtonsBlockButton: "bg-white/10 hover:bg-white/20 border border-white/20 text-white",
    socialButtonsBlockButtonText: "text-white",
    formButtonPrimary: "bg-green-600 hover:bg-green-700 text-white",
    formFieldInput: "bg-[#111] border-white/20 text-white",
    formFieldLabel: "text-gray-400",
    footerActionLink: "text-green-500 hover:text-green-400",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-green-500",
    formResendCodeLink: "text-green-500",
    otpCodeFieldInput: "bg-[#111] border-white/20 text-white",
    alertText: "text-gray-300",
    formFieldSuccessText: "text-green-500",
    formFieldErrorText: "text-red-500",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={clerkAppearance}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white`}
        >
          <ThemeProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
