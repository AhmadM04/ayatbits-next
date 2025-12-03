'use client';

import Link from "next/link";
import { SignedIn, SignedOut, SignUpButton, SignOutButton } from "@clerk/nextjs";
import { BookOpen, Target, Zap, Award, Play, LogOut, User as UserIcon } from "lucide-react";
import LandingHeader from "@/components/LandingHeader";
import PuzzleDemo from "@/components/PuzzleDemo";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Home() {
  const [isMobile, setIsMobile] = useState(true); // Default to mobile for faster initial render
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Hooks MUST always be called - can't be conditional
  // Always call useScroll, but we'll use static values on mobile
  const { scrollYProgress } = useScroll({ container: containerRef });
  
  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  // Always call useTransform, but use static values on mobile
  const y1Transform = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2Transform = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  
  // Use static values on mobile, animated on desktop
  const y1 = isMobile ? 0 : y1Transform;
  const y2 = isMobile ? 0 : y2Transform;
  const opacity = isMobile ? 1 : opacityTransform;

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Gradient orbs - Static on mobile for performance */}
            {mounted && !isMobile ? (
              <>
                <motion.div 
                  style={{ y: y1 }}
                  className="absolute top-1/4 -left-32 w-96 h-96 bg-green-500/20 rounded-full blur-[120px]"
                />
                <motion.div 
                  style={{ y: y2 }}
                  className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"
                />
              </>
            ) : (
              <>
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-green-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
              </>
            )}
            
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
              }}
            />

            {/* Floating Ayah Words - Disabled on mobile for performance */}
            {!isMobile && mounted && (
              <>
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, 3, 0]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/4 left-[8%] text-2xl sm:text-3xl font-arabic text-green-500/30 select-none"
                  dir="rtl"
                >
                  بِسْمِ
                </motion.div>
                <motion.div
                  animate={{ 
                    y: [0, 15, 0],
                    rotate: [0, -2, 0]
                  }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute top-1/3 right-[12%] text-xl sm:text-2xl font-arabic text-green-500/25 select-none"
                  dir="rtl"
                >
                  الرَّحْمَٰنِ
                </motion.div>
                <motion.div
                  animate={{ 
                    y: [0, -15, 0],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-1/3 left-[15%] text-lg sm:text-xl font-arabic text-green-500/20 select-none"
                  dir="rtl"
                >
                  الْحَمْدُ
                </motion.div>
                <motion.div
                  animate={{ 
                    y: [0, 18, 0],
                    rotate: [0, 2, 0]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute top-1/2 left-[5%] text-xl sm:text-2xl font-arabic text-green-500/20 select-none"
                  dir="rtl"
                >
                  اللَّهِ
                </motion.div>
                <motion.div
                  animate={{ 
                    y: [0, -12, 0],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute bottom-1/4 right-[10%] text-2xl sm:text-3xl font-arabic text-green-500/25 select-none"
                  dir="rtl"
                >
                  الرَّحِيمِ
                </motion.div>
              </>
            )}
            {!isMobile && mounted && (
              <>
                <motion.div
                  animate={{ 
                    y: [0, 10, 0],
                    rotate: [0, -3, 0]
                  }}
                  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  className="absolute top-[60%] right-[20%] text-lg sm:text-xl font-arabic text-green-500/15 select-none"
                  dir="rtl"
                >
                  رَبِّ
                </motion.div>
                <motion.div
                  animate={{ 
                    y: [0, -18, 0],
                  }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                  className="absolute top-[20%] right-[25%] text-xl sm:text-2xl font-arabic text-green-500/20 select-none"
                  dir="rtl"
                >
                  الْعَالَمِينَ
                </motion.div>
              </>
            )}
          </div>

          {/* Content */}
          <div 
            className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-12 sm:pt-20 pointer-events-auto"
          >
            <div>
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium text-green-400 bg-green-500/10 rounded-full border border-green-500/20">
                ✦ The modern way to learn Quran
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2">
              Master the Quran
              <br />
              <span className="text-green-500">one puzzle at a time</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-8 sm:mb-10 px-4">
              Interactive puzzles that make memorization stick. 
              Track progress, build streaks, learn your way.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 sm:gap-3">
                    <span>Start Learning</span>
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-200" />
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                  </button>
                </SignUpButton>
                <Link href="#demo">
                  <button className="group px-8 py-4 bg-white/5 hover:bg-white/10 text-white text-base font-semibold rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm">
                    <Play className="w-5 h-5 text-green-400" />
                    <span>Try Demo</span>
                  </button>
                </Link>
              </SignedOut>
              <SignedIn>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
                  <Link href="/api/check-access">
                    <button className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 sm:gap-3">
                      <span>Continue Learning</span>
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-200" />
                      <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                    </button>
                  </Link>
                  <Link href="#demo">
                    <button className="group px-6 sm:px-8 py-3 sm:py-4 bg-white/5 hover:bg-white/10 text-white text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm">
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                      <span>Try Demo</span>
                    </button>
                  </Link>
                </div>
                <div className="mt-4">
                  <SignOutButton>
                    <button className="px-6 py-3 text-gray-400 hover:text-white text-sm font-medium rounded-xl hover:bg-white/5 transition-all duration-300 flex items-center gap-2 mx-auto">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </SignOutButton>
                </div>
              </SignedIn>
            </div>

            {/* Stats */}
            <div className="mt-12 sm:mt-16 flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-12 px-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">6,236</div>
                <div className="text-xs text-gray-500">Verses</div>
              </div>
              <div className="w-px h-10 bg-white/10 hidden sm:block" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">18+</div>
                <div className="text-xs text-gray-500">Languages</div>
              </div>
              <div className="w-px h-10 bg-white/10 hidden sm:block" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">30</div>
                <div className="text-xs text-gray-500">Juz</div>
              </div>
            </div>
          </div>

        </section>

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
                Why learners love AyatBits
              </h2>
              <p className="text-sm sm:text-base text-gray-400 max-w-lg mx-auto px-4">
                Built for the modern Muslim who wants to connect deeply with the Quran
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[
                { icon: BookOpen, title: "Interactive Puzzles", desc: "Drag and drop to build verses from memory", iconColor: "text-green-500", bgColor: "bg-green-500/10" },
                { icon: Target, title: "Track Progress", desc: "See your journey across all 30 Juz", iconColor: "text-blue-500", bgColor: "bg-blue-500/10" },
                { icon: Zap, title: "Daily Streaks", desc: "Stay consistent, grow your streak", iconColor: "text-purple-500", bgColor: "bg-purple-500/10" },
                { icon: Award, title: "18+ Languages", desc: "Learn in your preferred translation", iconColor: "text-orange-500", bgColor: "bg-orange-500/10" },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-green-500/30 transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#111]">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
                Try it yourself
              </h2>
              <p className="text-sm sm:text-base text-gray-400 px-4">
                Drag the words to reconstruct the verse
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <PuzzleDemo />
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-[#111] to-[#0a0a0a]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-2">
              Start your journey today
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 px-4">
              Join thousands who are building a deeper connection with the Quran.
            </p>
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="group relative px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:scale-[1.02] flex items-center gap-3 mx-auto">
                  <span>Start Your Trial</span>
                  <BookOpen className="w-5 h-5 text-green-200" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/api/check-access">
                <button className="group relative px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:scale-[1.02] flex items-center gap-3 mx-auto">
                  <span>Continue Learning</span>
                  <BookOpen className="w-5 h-5 text-green-200" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>
              </Link>
            </SignedIn>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold text-green-500">AyatBits</div>
          <div className="text-sm text-gray-500">
            © 2025 AyatBits. Made with ❤️ for the Ummah.
          </div>
        </div>
      </footer>
    </div>
  );
}
