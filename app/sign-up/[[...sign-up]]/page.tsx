'use client';

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignUpContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');

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
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Start your journey
            </h1>
            <p className="text-gray-400 mb-4">
              Create an account to begin your 7-day free trial
            </p>
            
            {/* Trial Benefits */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-green-500" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Clerk SignUp */}
          <SignUp
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
            path="/sign-up"
            signInUrl="/sign-in"
            initialValues={{
              emailAddress: emailParam || undefined
            }}
          />

          {/* Custom Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-green-500 hover:text-green-400 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <SignUpContent />
    </Suspense>
  );
}
