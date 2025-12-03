'use client';

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingHeader() {
  return (
    <header className="w-full border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-green-500">
            AyatBits
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Questions
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]">
                  Log In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button className="bg-green-600 hover:bg-green-700 text-white">Go to Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}

