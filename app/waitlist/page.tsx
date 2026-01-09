'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import WaitlistForm from '@/components/WaitlistForm';

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="w-full border-b border-white/5 backdrop-blur-md bg-[#0a0a0a]/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image 
                src="/ayatbits-logo.svg" 
                alt="AyatBits" 
                width={150} 
                height={40}
                priority
                className="h-8 w-auto"
              />
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Join the Waitlist</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
            <span className="text-white">Be the First to</span>
            <br />
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
              Experience AyatBits
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto mb-12">
            Get exclusive early access, launch updates, and special perks when we officially launch.
          </p>

          {/* Waitlist Form Card */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-sm mb-8">
            <WaitlistForm source="waitlist-page" />
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Early access perks</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Launch updates</span>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-16 grid sm:grid-cols-3 gap-6 text-left">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="font-semibold text-white mb-2">Early Access</h3>
              <p className="text-sm text-gray-400">
                Be among the first to try AyatBits before the public launch
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="font-semibold text-white mb-2">Special Perks</h3>
              <p className="text-sm text-gray-400">
                Get exclusive benefits and discounts as an early supporter
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Priority Updates</h3>
              <p className="text-sm text-gray-400">
                Get notified about new features, updates, and improvements first
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">
            © 2026 AyatBits. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

