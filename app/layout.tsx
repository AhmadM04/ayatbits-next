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
        layout: {
          socialButtonsPlacement: 'top',
          socialButtonsVariant: 'blockButton',
          termsPageUrl: '/terms',
          privacyPageUrl: '/privacy',
          logoPlacement: 'none',
          showOptionalFields: false,
        },
        variables: {
          colorPrimary: '#16a34a',
          colorBackground: '#0f0f0f',
          colorText: '#ffffff',
          colorTextSecondary: '#9ca3af',
          colorInputBackground: '#1a1a1a',
          colorInputText: '#ffffff',
          borderRadius: '0.75rem',
          fontFamily: 'var(--font-geist-sans)',
        },
        elements: {
          // Root & Card
          rootBox: 'font-sans',
          card: 'bg-[#0f0f0f] border border-[#222] shadow-2xl rounded-2xl',
          
          // Header
          headerTitle: 'text-white text-2xl font-bold',
          headerSubtitle: 'text-gray-400 text-sm',
          
          // Social Buttons
          socialButtonsBlockButton: 'bg-[#1a1a1a] hover:bg-[#252525] text-white border border-[#333] rounded-xl h-12 font-medium transition-all',
          socialButtonsBlockButtonText: 'text-white font-medium',
          socialButtonsProviderIcon: 'w-5 h-5',
          
          // Divider
          dividerLine: 'bg-[#333]',
          dividerText: 'text-gray-500 text-xs',
          
          // Form Fields
          formFieldLabel: 'text-gray-300 text-sm font-medium',
          formFieldInput: 'bg-[#1a1a1a] border-[#333] text-white rounded-xl h-12 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all',
          formFieldInputShowPasswordButton: 'text-gray-400 hover:text-white',
          formFieldHintText: 'text-gray-500 text-xs',
          formFieldSuccessText: 'text-green-500 text-xs',
          formFieldErrorText: 'text-red-400 text-xs',
          
          // Primary Button
          formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 font-semibold text-base transition-all shadow-lg shadow-green-600/20',
          
          // Links
          footerActionLink: 'text-green-500 hover:text-green-400 font-medium',
          formResendCodeLink: 'text-green-500 hover:text-green-400',
          
          // Identity Preview
          identityPreviewText: 'text-white',
          identityPreviewEditButton: 'text-green-500 hover:text-green-400',
          
          // OTP
          otpCodeFieldInput: 'bg-[#1a1a1a] border-[#333] text-white rounded-xl text-center text-xl font-bold',
          
          // Footer
          footer: 'hidden',
          footerAction: 'hidden',
          
          // Alternative Actions
          alternativeMethodsBlockButton: 'bg-[#1a1a1a] hover:bg-[#252525] text-white border border-[#333] rounded-xl',
          
          // User Button (when signed in)
          userButtonBox: 'rounded-full',
          userButtonTrigger: 'rounded-full',
          userButtonAvatarBox: 'rounded-full w-10 h-10',
          
          // Modal
          modalContent: 'bg-[#0f0f0f] border border-[#222] rounded-2xl',
          modalBackdrop: 'bg-black/80 backdrop-blur-sm',
          
          // Loading
          spinner: 'text-green-500',
          
          // Badge
          badge: 'bg-green-600/20 text-green-400 rounded-full',
          
          // Internal components
          formFieldRow: 'mb-4',
          formButtonRow: 'mt-6',
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
