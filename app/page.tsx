'use client';

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Puzzle, Trophy, Flame, Star, Sparkles } from "lucide-react";
import { Suspense } from "react";
import UserProfileSection from "@/components/UserProfileSection";
import DemoPuzzle from "@/components/DemoPuzzle";

// Floating Arabic letters/words for the background
const floatingArabicWords = [
  { text: 'بِسْمِ', x: '10%', y: '20%', delay: 0, duration: 8 },
  { text: 'ٱللَّهِ', x: '85%', y: '15%', delay: 1, duration: 10 },
  { text: 'ٱلرَّحْمَٰنِ', x: '75%', y: '70%', delay: 2, duration: 9 },
  { text: 'ٱلرَّحِيمِ', x: '15%', y: '75%', delay: 0.5, duration: 11 },
  { text: 'ٱلْحَمْدُ', x: '90%', y: '45%', delay: 1.5, duration: 8 },
  { text: 'رَبِّ', x: '5%', y: '50%', delay: 2.5, duration: 10 },
  { text: 'ٱلْعَٰلَمِينَ', x: '50%', y: '85%', delay: 3, duration: 9 },
  { text: 'مَٰلِكِ', x: '30%', y: '10%', delay: 0.8, duration: 12 },
  { text: 'يَوْمِ', x: '70%', y: '30%', delay: 1.2, duration: 8 },
  { text: 'ٱلدِّينِ', x: '20%', y: '40%', delay: 2.2, duration: 10 },
];


export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    }>
      <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute top-0 -left-40 w-80 h-80 bg-green-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-green-600/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }} />
          
          {/* Floating Arabic words - much more visible now */}
          {floatingArabicWords.map((word, index) => (
            <motion.div
              key={index}
              className="absolute text-4xl sm:text-5xl md:text-6xl font-arabic text-green-500/30 select-none pointer-events-none"
              style={{ left: word.x, top: word.y }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.5, 0.3],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: word.duration,
                delay: word.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {word.text}
            </motion.div>
          ))}
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="w-full border-b border-white/5 backdrop-blur-md bg-[#0a0a0a]/80 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="flex items-center gap-2">
                  <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    AyatBits
                  </span>
                </Link>
                <div className="flex items-center gap-3">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        Get Started
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserProfileSection />
                  </SignedIn>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <section className="py-20 md:py-32 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-8">
                  <Sparkles className="w-4 h-4" />
                  <span>Gamified Quranic Learning</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                  <span className="text-white">Master the Quran</span>
                  <br />
                  <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                    One Puzzle at a Time
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                  An interactive puzzle-based application designed to help you memorize
                  and deeply understand Quranic verses through engaging gameplay.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button size="lg" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-6 text-lg rounded-xl">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-green-600/25">
                        Start Free Trial
                        <Flame className="w-5 h-5 ml-2" />
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-green-600/25">
                        Continue Learning
                        <Flame className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </SignedIn>
                </div>
              </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 border-t border-white/5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Why <span className="text-green-500">AyatBits</span>?
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                  Combine the beauty of Quranic study with proven gamification techniques
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Puzzle,
                    title: "Word Puzzles",
                    description: "Arrange scrambled words to reconstruct verses, reinforcing memorization through active recall.",
                    color: "green",
                  },
                  {
                    icon: Trophy,
                    title: "Achievements & Streaks",
                    description: "Unlock achievements, maintain daily streaks, and track your progress through all 30 Juz.",
                    color: "orange",
                  },
                  {
                    icon: Star,
                    title: "Multiple Translations",
                    description: "Study with 15+ translations in various languages to deepen your understanding.",
                    color: "purple",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-green-500/30 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      feature.color === 'green' ? 'bg-green-500/10' :
                      feature.color === 'orange' ? 'bg-orange-500/10' : 'bg-purple-500/10'
                    }`}>
                      <feature.icon className={`w-6 h-6 ${
                        feature.color === 'green' ? 'text-green-500' :
                        feature.color === 'orange' ? 'text-orange-500' : 'text-purple-500'
                      }`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-t border-white/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: "30", label: "Juz Available" },
                  { value: "114", label: "Surahs" },
                  { value: "6,236", label: "Verses" },
                  { value: "15+", label: "Translations" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl sm:text-4xl font-bold text-green-500 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Demo Section */}
            <section className="py-20 border-t border-white/5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-6">
                  <Puzzle className="w-4 h-4" />
                  <span>Try It Now</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Experience the <span className="text-green-500">Puzzle</span>
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                  Watch how words come together to form a verse, or click to try it yourself!
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto"
              >
                <DemoPuzzle />
              </motion.div>
            </section>

            {/* CTA Section */}
            <section className="py-20 border-t border-white/5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/20 rounded-3xl p-8 sm:p-12"
              >
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Ready to Begin Your Journey?
                </h2>
                <p className="text-gray-400 max-w-lg mx-auto mb-8">
                  Join thousands of learners who are mastering the Quran through interactive puzzles.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button size="lg" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-6 text-lg rounded-xl">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-xl">
                        Start Your Free Trial
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-xl">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </SignedIn>
                </div>
              </motion.div>
            </section>
          </main>

          {/* Footer */}
          <footer className="border-t border-white/5 py-8 mt-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">AyatBits</span>
                </div>
                <div className="flex gap-6 text-sm text-gray-500">
                  <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                  <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
                  <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                </div>
                <p className="text-sm text-gray-600">
                  © 2025 AyatBits. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Suspense>
  );
}
