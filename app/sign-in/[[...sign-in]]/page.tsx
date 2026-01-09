'use client';

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-green-500">
              AyatBits
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Custom Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back
            </h1>
            <p className="text-gray-400">
              Sign in to continue your Quran journey
            </p>
          </div>

          {/* Clerk SignIn */}
          <SignIn
            appearance={{
              elements: {
                card: "bg-transparent shadow-none p-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                footer: "hidden",
                formFieldInput: "bg-[#111] border-white/20 text-white placeholder:text-gray-500",
                formFieldLabel: "text-gray-300",
                formButtonPrimary: "bg-green-600 hover:bg-green-700 text-white",
                socialButtonsBlockButton: "bg-white/10 hover:bg-white/20 border border-white/20 text-white",
                socialButtonsBlockButtonText: "text-white font-medium",
                footerActionLink: "text-green-500 hover:text-green-400",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-green-500 hover:text-green-400",
                formResendCodeLink: "text-green-500 hover:text-green-400",
                otpCodeFieldInput: "bg-[#111] border-white/20 text-white",
                alertText: "text-gray-300",
                formFieldSuccessText: "text-green-500",
                formFieldErrorText: "text-red-400",
                dividerText: "text-gray-400",
                dividerLine: "bg-white/10",
                formFieldInputShowPasswordButton: "text-gray-400 hover:text-white",
                formHeaderTitle: "text-white",
                formHeaderSubtitle: "text-gray-400",
              }
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />

          {/* Custom Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-green-500 hover:text-green-400 font-medium">
                Start your 7-day trial
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
