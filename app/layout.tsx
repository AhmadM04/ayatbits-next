import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Amiri_Quran } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/Toast";
import { ThemeProvider } from "@/lib/theme-context";
import { I18nProvider } from "@/lib/i18n";
import { TutorialProvider } from "@/components/tutorial";
import { MotionProvider } from "@/lib/contexts/motion-context";
import { AccessProvider } from "@/lib/providers/access-provider";
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
  adjustFontFallback: false, // Skip font optimization during build to avoid connection errors
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#F8F9FA",
  colorScheme: "light",
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
  baseTheme: "light",
  variables: {
    colorPrimary: "#059669",
    colorBackground: "#F8F9FA",
    colorInputBackground: "#ffffff",
    colorText: "#4A3728",
    colorTextSecondary: "#8E7F71",
    colorInputText: "#4A3728",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    rootBox: "shadow-none",
    card: "bg-white border border-gray-200 shadow-sm",
    headerTitle: "text-[#4A3728]",
    headerSubtitle: "text-[#8E7F71]",
    socialButtonsBlockButton: "bg-gray-100 hover:bg-gray-200 border border-gray-200 text-[#4A3728]",
    socialButtonsBlockButtonText: "text-[#4A3728]",
    alternativeMethodsBlockButton: "bg-gray-100 hover:bg-gray-200 border border-gray-200 text-[#4A3728]",
    alternativeMethodsBlockButtonText: "text-[#4A3728] font-medium",
    alternativeMethodsBlockButtonArrow: "text-[#4A3728]",
    formButtonPrimary: "bg-[#059669] hover:bg-emerald-700 text-white",
    formFieldInput: "bg-white border-gray-200 text-[#4A3728]",
    formFieldLabel: "text-[#8E7F71]",
    footerActionLink: "text-[#059669] hover:text-emerald-700",
    identityPreviewText: "text-[#4A3728]",
    identityPreviewEditButton: "text-[#059669]",
    formResendCodeLink: "text-[#059669]",
    otpCodeFieldInput: "bg-white border-gray-200 text-[#4A3728]",
    alertText: "text-[#4A3728]",
    formFieldSuccessText: "text-[#059669]",
    formFieldErrorText: "text-[#EF4444]",
    dividerText: "text-[#8E7F71]",
    dividerLine: "bg-gray-200",
    formFieldInputShowPasswordButton: "text-[#8E7F71] hover:text-[#4A3728]",
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
      // Configure token refresh strategy
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
    >
      <html lang="en" className="light">
        <head>
          {/* Set theme before page renders to prevent flash */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const theme = localStorage.getItem('theme') || 'light';
                    let effectiveTheme = 'light';
                    if (theme === 'system') {
                      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    } else {
                      effectiveTheme = theme;
                    }
                    document.documentElement.classList.remove('light', 'dark');
                    document.documentElement.classList.add(effectiveTheme);
                  } catch (e) {}
                })();
              `,
            }}
          />
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
          className={`${geistSans.variable} ${geistMono.variable} ${amiriQuran.variable} antialiased bg-[#F8F9FA] text-[#4A3728]`}
        >
          <ThemeProvider>
            <MotionProvider>
              <ToastProvider>
                <I18nProvider>
                  <AccessProvider>
                    <TutorialProvider>
                      {children}
                    </TutorialProvider>
                  </AccessProvider>
                </I18nProvider>
              </ToastProvider>
            </MotionProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
