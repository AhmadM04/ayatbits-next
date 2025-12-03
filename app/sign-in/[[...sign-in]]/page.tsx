'use client';

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useTheme } from "@/lib/theme-context";
import ThemeToggle from "@/components/ThemeToggle";

export default function SignInPage() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Header */}
      <header className="w-full border-b border-[var(--border-color)] bg-[var(--bg-card)]/80 backdrop-blur-sm sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-green-500">
              AyatBits
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/sign-up" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
        {/* Welcome Text */}
        <div className="text-center mb-8 max-w-md">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Welcome Back
          </h1>
          <p className="text-[var(--text-secondary)]">
            Sign in to continue your Quran learning journey
          </p>
        </div>

        {/* Clerk SignIn Component */}
        <div className="w-full max-w-md">
          <SignIn
            appearance={{
              baseTheme: theme === 'dark' ? undefined : undefined,
              elements: {
                rootBox: "w-full",
                card: "bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl rounded-2xl",
                headerTitle: "text-[var(--text-primary)]",
                headerSubtitle: "text-[var(--text-secondary)]",
                socialButtonsBlockButton: "bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)]",
                socialButtonsBlockButtonText: "text-[var(--text-primary)]",
                dividerLine: "bg-[var(--border-color)]",
                dividerText: "text-[var(--text-muted)]",
                formButtonPrimary: "bg-green-600 hover:bg-green-700 text-white",
                formFieldLabel: "text-[var(--text-secondary)]",
                formFieldInput: "bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] focus:border-green-500",
                footerActionLink: "text-green-500 hover:text-green-400",
                identityPreviewText: "text-[var(--text-primary)]",
                identityPreviewEditButton: "text-green-500",
                formResendCodeLink: "text-green-500",
                otpCodeFieldInput: "bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)]",
                footer: "hidden",
              },
              variables: {
                colorPrimary: "#16a34a",
                colorBackground: theme === 'dark' ? "#1a1a1a" : "#ffffff",
                colorText: theme === 'dark' ? "#ffffff" : "#111827",
                colorTextSecondary: theme === 'dark' ? "#a1a1aa" : "#4b5563",
                colorInputBackground: theme === 'dark' ? "#27272a" : "#f3f4f6",
                colorInputText: theme === 'dark' ? "#ffffff" : "#111827",
                borderRadius: "0.75rem",
              }
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />
        </div>

        {/* Custom Footer */}
        <div className="mt-6 text-center">
          <p className="text-[var(--text-muted)]">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-green-500 hover:text-green-400 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
