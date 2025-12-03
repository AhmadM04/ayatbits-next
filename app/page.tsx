'use client';

import Link from "next/link";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { BookOpen, Target, Zap, Award, ArrowRight, Play } from "lucide-react";
import LandingHeader from "@/components/LandingHeader";
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <LandingHeader />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            {/* Gradient orbs */}
            <motion.div 
              style={{ y: y1 }}
              className="absolute top-1/4 -left-32 w-96 h-96 bg-green-500/20 rounded-full blur-[120px]"
            />
            <motion.div 
              style={{ y: y2 }}
              className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"
            />
            
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
              }}
            />

            {/* Floating elements */}
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/3 left-[10%] text-4xl opacity-20"
            >
              📖
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, 20, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 right-[15%] text-3xl opacity-20"
            >
              ✨
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, -15, 0],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/3 left-[20%] text-2xl opacity-20"
            >
              🕌
            </motion.div>
          </div>

          {/* Content */}
          <motion.div 
            style={{ opacity }}
            className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium text-green-400 bg-green-500/10 rounded-full border border-green-500/20">
                🚀 The modern way to learn Quran
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Master the Quran
              <br />
              <span className="text-green-500">one puzzle at a time</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto mb-10"
            >
              Interactive puzzles that make memorization stick. 
              Track progress, build streaks, learn your way.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 h-12 text-base font-medium rounded-full">
                    Start 7-Day Trial
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 h-12 text-base font-medium rounded-full">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </SignedIn>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="border-gray-700 text-gray-300 hover:bg-white/5 px-8 h-12 text-base font-medium rounded-full">
                  <Play className="mr-2 w-4 h-4" />
                  Try Demo
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 flex flex-wrap justify-center gap-6 sm:gap-12"
            >
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
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 rounded-full border-2 border-gray-700 flex items-start justify-center p-2">
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-2 bg-gray-500 rounded-full"
              />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Why learners love AyatBits
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto">
                Built for the modern Muslim who wants to connect deeply with the Quran
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <section id="demo" className="py-24 px-4 bg-[#111]">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Try it yourself
              </h2>
              <p className="text-gray-400">
                Drag the words to reconstruct the verse
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <DemoWidget />
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-4 bg-gradient-to-b from-[#111] to-[#0a0a0a]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Start your journey today
            </h2>
            <p className="text-gray-400 mb-8">
              Join thousands who are building a deeper connection with the Quran.
            </p>
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-10 h-14 text-lg font-medium rounded-full">
                  Start Your Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-10 h-14 text-lg font-medium rounded-full">
                  Continue Learning
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
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

// Inline Demo Widget for better performance
function DemoWidget() {
  const [words, setWords] = useState([
    { id: 1, text: 'بِسْمِ', placed: false },
    { id: 2, text: 'اللَّهِ', placed: false },
    { id: 3, text: 'الرَّحْمَٰنِ', placed: false },
    { id: 4, text: 'الرَّحِيمِ', placed: false },
  ]);
  const [answer, setAnswer] = useState<typeof words>([]);
  const [shuffled, setShuffled] = useState(false);

  useEffect(() => {
    if (!shuffled) {
      setWords(prev => [...prev].sort(() => Math.random() - 0.5));
      setShuffled(true);
    }
  }, [shuffled]);

  const correctOrder = ['بِسْمِ', 'اللَّهِ', 'الرَّحْمَٰنِ', 'الرَّحِيمِ'];
  const isComplete = answer.length === 4 && answer.every((w, i) => w.text === correctOrder[i]);

  const handleWordClick = (word: typeof words[0]) => {
    if (word.placed) {
      setAnswer(prev => prev.filter(w => w.id !== word.id));
      setWords(prev => prev.map(w => w.id === word.id ? { ...w, placed: false } : w));
    } else {
      setAnswer(prev => [...prev, word]);
      setWords(prev => prev.map(w => w.id === word.id ? { ...w, placed: true } : w));
    }
  };

  const reset = () => {
    setAnswer([]);
    setWords(prev => prev.map(w => ({ ...w, placed: false })).sort(() => Math.random() - 0.5));
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 sm:p-8">
      {/* Answer area */}
      <div className="min-h-[80px] rounded-xl border-2 border-dashed border-white/10 p-4 mb-6 flex flex-wrap gap-3 justify-center" dir="rtl">
        {answer.length === 0 ? (
          <span className="text-gray-600 text-sm">Tap words below to build the verse</span>
        ) : (
          answer.map((word, i) => (
            <motion.button
              key={word.id}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={() => handleWordClick(word)}
              className={`px-4 py-2 rounded-lg text-lg font-medium transition-all ${
                i < answer.length && answer[i].text === correctOrder[i]
                  ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                  : 'bg-white/5 text-white border border-white/10'
              }`}
            >
              {word.text}
            </motion.button>
          ))
        )}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-3 justify-center mb-6" dir="rtl">
        {words.filter(w => !w.placed).map((word) => (
          <motion.button
            key={word.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleWordClick(word)}
            className="px-4 py-2 rounded-lg bg-white/5 text-white border border-white/10 hover:border-green-500/50 text-lg font-medium transition-all"
          >
            {word.text}
          </motion.button>
        ))}
      </div>

      {/* Status */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 rounded-full text-sm font-medium">
            ✓ Perfect! بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        </motion.div>
      )}

      {answer.length > 0 && !isComplete && (
        <div className="text-center">
          <button onClick={reset} className="text-sm text-gray-500 hover:text-white transition-colors">
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
