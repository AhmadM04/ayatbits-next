import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, Zap, Award, ArrowRight, Check } from "lucide-react";
import PuzzleDemo from "@/components/PuzzleDemo";
import Testimonials from "@/components/Testimonials";
import LandingHeader from "@/components/LandingHeader";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-10 dark:opacity-10">
            {/* Arrows pattern */}
            <div className="absolute top-20 left-10 w-20 h-20">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-green-500">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="absolute top-40 right-20 w-16 h-16 rotate-45">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-green-500">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="absolute bottom-32 left-1/4 w-12 h-12 -rotate-12">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-green-500">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="absolute top-1/2 right-10 w-24 h-24 -rotate-45 opacity-50">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-green-500">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="absolute bottom-20 right-1/3 w-14 h-14 rotate-90">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-green-500">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Geometric shapes */}
            <div className="absolute top-10 right-1/4 w-8 h-8 border-2 border-green-500 rotate-45"></div>
            <div className="absolute bottom-40 left-20 w-6 h-6 bg-green-500 rounded-full"></div>
            <div className="absolute top-1/3 left-1/3 w-4 h-4 border-2 border-green-500"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="bg-[var(--bg-card)] dark:bg-[#1a1a1a] rounded-3xl p-12 md:p-16 shadow-2xl border border-[var(--border-color)] transition-colors duration-300">
              <div className="text-center">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
                  Making Quran learning
                  <br />
                  <span className="text-green-500 italic">faster.</span>
                </h1>
                <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
                  Interactive word puzzles to master the Quran. Learn with 18 translations and track your progress.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-semibold rounded-lg">
                        Start Learning
                      </Button>
                    </SignUpButton>
                    <Link href="/pricing">
                      <Button size="lg" variant="outline" className="bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] px-8 py-6 text-lg font-semibold rounded-lg">
                        View Pricing
                      </Button>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-semibold rounded-lg">
                        Start Learning
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button size="lg" variant="outline" className="bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-color)] px-8 py-6 text-lg font-semibold rounded-lg">
                        View Pricing
                      </Button>
                    </Link>
                  </SignedIn>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-[var(--bg-secondary)] transition-colors duration-300">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              Why Choose AyatBits?
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              A modern approach to Quranic memorization and understanding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-[var(--bg-card)] rounded-xl p-8 shadow-lg border border-[var(--border-color)] hover:border-green-500 transition-all">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Interactive Puzzles</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Drag and drop words to reconstruct verses. Learn through hands-on practice that makes memorization engaging.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[var(--bg-card)] rounded-xl p-8 shadow-lg border border-[var(--border-color)] hover:border-green-500 transition-all">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Track Progress</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Monitor your learning journey with streaks, completion stats, and progress tracking across all 30 Juz.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[var(--bg-card)] rounded-xl p-8 shadow-lg border border-[var(--border-color)] hover:border-green-500 transition-all">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Daily Streaks</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Build consistency with daily practice. Maintain your streak and watch your longest streak grow over time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[var(--bg-card)] rounded-xl p-8 shadow-lg border border-[var(--border-color)] hover:border-green-500 transition-all">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center mb-6">
                <Award className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Multiple Translations</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Access 18+ translations in multiple languages. Learn in your preferred language and switch anytime.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-[var(--background)] transition-colors duration-300">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              How It Works
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">Choose a Juz</h3>
              <p className="text-[var(--text-secondary)]">
                Select any of the 30 Juz to begin your learning journey. Each Juz contains multiple surahs and verses.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">Read & Listen</h3>
              <p className="text-[var(--text-secondary)]">
                Read the verse, listen to the recitation, and understand the translation before attempting the puzzle.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">Solve Puzzles</h3>
              <p className="text-[var(--text-secondary)]">
                Drag and drop words to reconstruct the verse. Build your streak by completing puzzles daily.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-[var(--bg-secondary)] transition-colors duration-300">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              Experience It Yourself
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Try our interactive puzzle demo. Drag and drop words to reconstruct the verse!
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <PuzzleDemo />
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials />

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-12 md:p-16 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
              Join thousands of learners who are mastering the Quran one puzzle at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--background)] border-t border-[var(--border-color)] mt-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">AyatBits</span>
            </div>
            <div className="text-[var(--text-muted)] text-sm mb-4 md:mb-0">
              Inspired by the beauty of the Quran
            </div>
            <div className="flex items-center gap-6">
              <Link href="#faq" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors">
                FAQ
              </Link>
              <Link href="/terms" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors">
                Terms
              </Link>
            </div>
          </div>
          <div className="text-center mt-8 pt-8 border-t border-[var(--border-color)]">
            <p className="text-[var(--text-muted)] text-sm">
              © 2025 AyatBits. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
