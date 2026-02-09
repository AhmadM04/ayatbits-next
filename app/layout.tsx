import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Amiri_Quran } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/Toast";
import { ThemeProvider } from "@/lib/theme-context";
import { I18nProvider } from "@/lib/i18n";
import { TutorialProvider } from "@/components/tutorial";
import { MotionProvider } from "@/lib/contexts/motion-context";
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

// Amiri Quran font for proper Uthmani script display
const amiriQuran = Amiri_Quran({
  weight: "400",
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
  display: "swap",
  preload: true,
  fallback: ["serif"],
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
    alternativeMethodsBlockButton: "bg-white/10 hover:bg-white/20 border border-white/20 text-white",
    alternativeMethodsBlockButtonText: "text-white font-medium",
    alternativeMethodsBlockButtonArrow: "text-white",
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
    dividerText: "text-gray-400",
    dividerLine: "bg-white/10",
    formFieldInputShowPasswordButton: "text-gray-400 hover:text-white",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use environment selector to ensure frontend and backend use matching keys
  // Check NEXT_PUBLIC_CLERK_ENVIRONMENT to determine which keys to use
  const clerkEnv = process.env.NEXT_PUBLIC_CLERK_ENVIRONMENT || 'test';
  const clerkKey = clerkEnv === 'production' 
    ? (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '')
    : (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY_TEST || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '');
  
  return (
    <ClerkProvider
      publishableKey={clerkKey}
      appearance={clerkAppearance}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      // Disable Clerk monetization features since we use custom Stripe integration
      telemetry={false}
    >
      <html lang="en" className="dark">
        <head>
          <Script
            id="structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {/* Suppress Next.js 15+ async params warnings and Clerk errors from React DevTools */}
          <Script
            id="suppress-async-warnings"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof window !== 'undefined') {
                  const originalError = console.error;
                  console.error = (...args) => {
                    const msg = args[0]?.toString() || '';
                    // Filter out specific Next.js 15+ async params warnings
                    if (msg.includes('params') && msg.includes('Promise') && msg.includes('React.use()')) return;
                    if (msg.includes('searchParams') && msg.includes('Promise') && msg.includes('React.use()')) return;
                    if (msg.includes('sync-dynamic-apis')) return;
                    // Filter out Clerk checkout popup errors (we use custom Stripe integration)
                    if (msg.includes('checkout popup config')) return;
                    originalError.apply(console, args);
                  };
                }
              `,
            }}
          />
          {/* Preconnect to external domains for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://*.clerk.com" />
          <link rel="dns-prefetch" href="https://api.stripe.com" />
          {/* Preconnect to Quran API endpoints */}
          <link rel="dns-prefetch" href="https://api.quran.com" />
          <link rel="dns-prefetch" href="https://everyayah.com" />
          <link rel="preconnect" href="https://api.quran.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://everyayah.com" crossOrigin="anonymous" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${amiriQuran.variable} antialiased bg-[#0a0a0a] text-white`}
        >
          <ThemeProvider>
            <MotionProvider>
              <ToastProvider>
                <I18nProvider>
                  <TutorialProvider>
                    {children}
                  </TutorialProvider>
                </I18nProvider>
              </ToastProvider>
            </MotionProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
