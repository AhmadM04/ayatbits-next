import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/Toast";
import { ThemeProvider } from "@/lib/theme-context";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.ayatbits.com";
const siteName = "AyatBits";
const siteDescription = "Learn and memorize Quranic verses through fun, interactive puzzles. Gamified Quranic study with word puzzles, progress tracking, and multiple translations.";
const siteImage = `${siteUrl}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Gamified Quranic Study`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "Quran",
    "Quranic study",
    "Islamic education",
    "Quran memorization",
    "Arabic learning",
    "Quran puzzles",
    "Islamic app",
    "Quranic verses",
    "Muslim education",
    "Quran learning",
    "Islamic studies",
    "Quran app",
  ],
  authors: [{ name: "AyatBits" }],
  creator: "AyatBits",
  publisher: "AyatBits",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteName,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} - Gamified Quranic Study`,
    description: siteDescription,
    images: [
      {
        url: siteImage,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Gamified Quranic Study`,
    description: siteDescription,
    images: [siteImage],
    creator: "@ayatbits",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "education",
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

// Structured Data (JSON-LD)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteName,
  description: siteDescription,
  url: siteUrl,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "100",
  },
  featureList: [
    "Interactive Quranic puzzles",
    "Progress tracking",
    "Multiple translations",
    "Audio recitations",
    "30 Juzs and 114 Surahs",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // In dev mode, prefer test keys. In production, use production keys.
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  
  return (
    <ClerkProvider
      publishableKey={clerkKey}
      appearance={clerkAppearance}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <html lang="en" className="dark">
        <head>
          <Script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {/* Preconnect to external domains for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://*.clerk.com" />
          <link rel="dns-prefetch" href="https://api.stripe.com" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white`}
        >
          <ThemeProvider>
            <ToastProvider>
              <I18nProvider>
                {children}
              </I18nProvider>
            </ToastProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
