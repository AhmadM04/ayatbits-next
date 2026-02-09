'use client';

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ConditionalMotion, useReducedMotion } from "@/components/ConditionalMotion";
import { Puzzle, Trophy, Flame, Star, Sparkles, CheckCircle2, Quote, Gift, Menu, X } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import UserProfileSection from "@/components/UserProfileSection";
import DemoPuzzle from "@/components/DemoPuzzle";
import { QuranLoader } from "@/components/animations";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/lib/i18n";

// Floating Arabic letters/words for the background - Names of Allah (Asma ul Husna)
const floatingArabicWords = [
  { text: 'ٱلرَّحْمَٰن', x: '10%', y: '20%', delay: 0, duration: 8 },
  { text: 'ٱلرَّحِيم', x: '85%', y: '15%', delay: 1, duration: 10 },
  { text: 'ٱلْمَلِك', x: '75%', y: '70%', delay: 2, duration: 9 },
  { text: 'ٱلْقُدُّوس', x: '15%', y: '75%', delay: 0.5, duration: 11 },
  { text: 'ٱلسَّلَام', x: '90%', y: '45%', delay: 1.5, duration: 8 },
  { text: 'ٱلْعَزِيز', x: '5%', y: '50%', delay: 2.5, duration: 10 },
  { text: 'ٱلْحَكِيم', x: '50%', y: '85%', delay: 3, duration: 9 },
  { text: 'ٱللَّطِيف', x: '30%', y: '10%', delay: 0.8, duration: 12 },
  { text: 'ٱلْكَرِيم', x: '70%', y: '30%', delay: 1.2, duration: 8 },
  { text: 'ٱلنُّور', x: '20%', y: '40%', delay: 2.2, duration: 10 },
];

// Component to check access and render appropriate button
function DashboardButton({ size, className = "", t }: { size?: "default" | "sm" | "lg" | "icon" | null, className?: string, t: any }) {
  const { isSignedIn, isLoaded } = useUser();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (isSignedIn && isLoaded) {
      // Add a small delay to ensure Clerk session is fully established
      const checkAccess = async () => {
        try {
          const res = await fetch('/api/check-access', {
            credentials: 'include', // Ensure cookies are sent
          });
          
          if (res.ok) {
            const data = await res.json();
            setHasAccess(data.hasAccess);
          } else if (res.status === 401) {
            // Session not ready yet, retry after a short delay
            setTimeout(() => {
              fetch('/api/check-access', { credentials: 'include' })
                .then(res => res.ok ? res.json() : { hasAccess: false })
                .then(data => setHasAccess(data.hasAccess))
                .catch(() => setHasAccess(false));
            }, 1000);
          } else {
            setHasAccess(false);
          }
        } catch (error) {
          console.error('Error checking access:', error);
          setHasAccess(false);
        }
      };

      // Small delay to ensure Clerk session is ready
      const timeoutId = setTimeout(checkAccess, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [isSignedIn, isLoaded]);

  if (!isSignedIn) return null;

  // While loading, show a generic button
  if (hasAccess === null) {
    return (
      <Link href="/dashboard">
        <Button size={size} className={className}>
          Loading...
        </Button>
      </Link>
    );
  }

  // If user has no access, show "Start Learning" and link to pricing
  if (!hasAccess) {
    return (
      <Link href="/pricing">
        <Button size={size} className={className}>
          {t('landing.startLearning')}
          <Flame className="w-5 h-5 ml-2" />
        </Button>
      </Link>
    );
  }

  // If user has access, show "Continue Learning" and link to dashboard
  return (
    <Link href="/dashboard">
      <Button size={size} className={className}>
        {t('landing.continuelearning')}
        <Flame className="w-5 h-5 ml-2" />
      </Button>
    </Link>
  );
}


export default function Home() {
  const { t } = useI18n();
  const shouldReduceMotion = useReducedMotion();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <QuranLoader size={140} />
      </div>
    }>
      <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute top-0 -left-40 w-80 h-80 bg-green-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-green-600/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }} />
          
          {/* Floating Arabic words - skip animation when reduced motion */}
          {!shouldReduceMotion ? (
            floatingArabicWords.map((word, index) => (
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
            ))
          ) : (
            // Static version for reduced motion
            floatingArabicWords.map((word, index) => (
              <div
                key={index}
                className="absolute text-4xl sm:text-5xl md:text-6xl font-arabic text-green-500/30 select-none pointer-events-none opacity-30"
                style={{ left: word.x, top: word.y }}
              >
                {word.text}
              </div>
            ))
          )}
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="w-full border-b border-white/5 backdrop-blur-md bg-[#0a0a0a]/80 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                  <Image 
                    src="/ayatbits-logo.svg" 
                    alt="AyatBits" 
                    width={180} 
                    height={48}
                    priority
                    className="h-10 w-auto"
                  />
                </Link>
                
                {/* Desktop Navigation Links */}
                <nav className="hidden md:flex items-center gap-6 text-sm">
                  <Link href="#features" className="text-gray-400 hover:text-white transition-colors">
                    {t('landing.featuresLink')}
                  </Link>
                  <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                    {t('landing.pricingLink')}
                  </Link>
                  <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                    {t('landing.faqLink')}
                  </Link>
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-3">
                  {/* Language Selector */}
                  <LanguageSelector />
                  
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                        {t('landing.signIn')}
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        {t('landing.getStarted')}
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserProfileSection />
                  </SignedIn>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-2">
                  <LanguageSelector />
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                    aria-label="Menu"
                  >
                    {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              {/* Mobile Menu Dropdown */}
              <AnimatePresence>
                {showMobileMenu && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden border-t border-white/5 overflow-hidden"
                  >
                    <nav className="py-4 space-y-2">
                      <Link 
                        href="#features"
                        onClick={() => setShowMobileMenu(false)}
                        className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        {t('landing.featuresLink')}
                      </Link>
                      <Link 
                        href="#pricing"
                        onClick={() => setShowMobileMenu(false)}
                        className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        {t('landing.pricingLink')}
                      </Link>
                      <Link 
                        href="/faq"
                        onClick={() => setShowMobileMenu(false)}
                        className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        {t('landing.faqLink')}
                      </Link>
                      
                      <div className="border-t border-white/5 my-2 pt-2">
                        <SignedOut>
                          <div className="px-4 space-y-2">
                            <SignInButton mode="modal">
                              <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">
                                {t('landing.signIn')}
                              </Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                {t('landing.getStarted')}
                              </Button>
                            </SignUpButton>
                          </div>
                        </SignedOut>
                        <SignedIn>
                          <div className="px-4">
                            <UserProfileSection />
                          </div>
                        </SignedIn>
                      </div>
                    </nav>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section with Integrated Waitlist */}
            <section className="py-20 md:py-32 text-center">
              <ConditionalMotion
                as="div"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-8">
                  <Sparkles className="w-4 h-4" />
                  <span>{t('landing.gamifiedLearning')}</span>
                </div>

                {/* Ramadan Special Voucher Banner */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="max-w-2xl mx-auto mb-6"
                >
                  <Link href="/pricing">
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-pink-600/20 border border-blue-500/40 rounded-2xl p-4 hover:border-blue-400/60 transition-all duration-300 group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
                        <div className="flex items-center gap-2">
                          <Gift className="w-5 h-5 text-blue-400" />
                          <span className="text-blue-300 font-semibold">{t('landing.ramadanSpecial')}</span>
                        </div>
                        <div className="text-white text-sm sm:text-base">
                          {t('landing.ramadanOffer')} <code className="px-2 py-0.5 bg-blue-500/30 rounded text-blue-200 font-mono text-xs sm:text-sm">RAMADAN2026</code>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                  <span className="text-white">{t('landing.heroTitle')}</span>
                  <br />
                  <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                    {t('landing.heroTitle2')}
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                  {t('landing.heroDescription')}
                </p>

                {/* Hero Banner with CTAs */}
                <div className="max-w-2xl mx-auto">
                  <SignedOut>
                    {/* Call to Action for Non-signed in Users */}
                    <div className="flex flex-col items-center gap-6">
                      <SignUpButton mode="modal">
                        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-12 py-6 text-xl rounded-xl shadow-lg shadow-green-600/25 font-semibold min-h-[60px]">
                          {t('landing.getStarted')}
                          <Flame className="w-6 h-6 ml-2" />
                        </Button>
                      </SignUpButton>
                      
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                        <span>{t('landing.alreadyHaveAccount')}</span>
                        <SignInButton mode="modal">
                          <button className="text-green-400 hover:text-green-300 underline font-medium">
                            {t('landing.signIn')}
                          </button>
                        </SignInButton>
                      </div>
                      
                      <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          <span>{t('landing.trialIncluded')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          <span>{t('landing.noCreditCard')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          <span>{t('landing.startImmediately')}</span>
                        </div>
                      </div>
                    </div>
                  </SignedOut>

                  {/* CTA for Signed In Users */}
                  <SignedIn>
                    <DashboardButton 
                      t={t}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-12 py-6 text-xl rounded-xl shadow-lg shadow-green-600/25 font-semibold min-h-[60px]"
                    />
                  </SignedIn>
                </div>
              </ConditionalMotion>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 border-t border-white/5">
              <ConditionalMotion
                as="div"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  {t('landing.whyAyatBits')}
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                  {t('landing.whySubtitle')}
                </p>
              </ConditionalMotion>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Puzzle,
                    title: t('landing.wordPuzzlesTitle'),
                    description: t('landing.wordPuzzlesDesc'),
                    color: "green",
                  },
                  {
                    icon: Trophy,
                    title: t('landing.achievementsTitle'),
                    description: t('landing.achievementsDesc'),
                    color: "orange",
                  },
                  {
                    icon: Star,
                    title: t('landing.translationsTitle'),
                    description: t('landing.translationsDesc'),
                    color: "blue",
                  },
                ].map((feature, index) => (
                  <ConditionalMotion
                    as="div"
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-green-500/30 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      feature.color === 'green' ? 'bg-green-500/10' :
                      feature.color === 'orange' ? 'bg-orange-500/10' : 'bg-blue-500/10'
                    }`}>
                      <feature.icon className={`w-6 h-6 ${
                        feature.color === 'green' ? 'text-green-500' :
                        feature.color === 'orange' ? 'text-orange-500' : 'text-blue-500'
                      }`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                  </ConditionalMotion>
                ))}
              </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-t border-white/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: "30", label: t('landing.juzAvailable') },
                  { value: "114", label: t('landing.surahs') },
                  { value: "6,236", label: t('landing.verses') },
                  { value: "15+", label: t('landing.translations') },
                ].map((stat, index) => (
                  <ConditionalMotion
                    as="div"
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl sm:text-4xl font-bold text-green-500 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </ConditionalMotion>
                ))}
              </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 border-t border-white/5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  {t('landing.whatLearnersSay')}
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                  {t('landing.learnersSubtitle')}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    name: t('landing.testimonial1Name'),
                    role: t('landing.testimonial1Role'),
                    text: t('landing.testimonial1Text'),
                    rating: 5,
                  },
                  {
                    name: t('landing.testimonial2Name'),
                    role: t('landing.testimonial2Role'),
                    text: t('landing.testimonial2Text'),
                    rating: 5,
                  },
                  {
                    name: t('landing.testimonial3Name'),
                    role: t('landing.testimonial3Role'),
                    text: t('landing.testimonial3Text'),
                    rating: 5,
                  },
                ].map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-green-500/30 transition-all duration-300"
                  >
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <Quote className="w-8 h-8 text-green-500/30 mb-3" />
                    <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center text-white font-semibold">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                      </div>
                    </div>
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
                  <Puzzle className="w-4 h-4" />
                  <span>{t('landing.tryItNow')}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  {t('landing.experienceTitle')}
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                  {t('landing.experienceSubtitle')}
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

            {/* How It Works Section */}
            <section className="py-20 border-t border-white/5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span>{t('landing.howItWorks')}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  {t('landing.howItWorksTitle')}
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                  {t('landing.howItWorksSubtitle')}
                </p>
              </motion.div>

              <div className="flex flex-col gap-16 max-w-7xl mx-auto">
                {/* Step 1: Read Ayah */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative w-full max-w-[1800px] mx-auto">
                    <Image
                      src="/screenshots/fullayahview-english.png"
                      alt="Read Ayah Screen"
                      width={900}
                      height={2000}
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="mt-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 text-green-400 font-bold mb-3 text-lg">
                      1
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {t('landing.step1Title')}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {t('landing.step1Description')}
                    </p>
                  </div>
                </motion.div>

                {/* Step 2: Solve Puzzle */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative w-full max-w-[1800px] mx-auto">
                    <Image
                      src="/screenshots/wordpuzzleview-english.png"
                      alt="Solve Puzzle Screen"
                      width={900}
                      height={2000}
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="mt-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 text-green-400 font-bold mb-3 text-lg">
                      2
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {t('landing.step2Title')}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {t('landing.step2Description')}
                    </p>
                  </div>
                </motion.div>

                {/* Step 3: Save Favorites */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative w-full max-w-[1800px] mx-auto">
                    <Image
                      src="/screenshots/likedayahview-english.png"
                      alt="Liked Ayahs Screen"
                      width={1800}
                      height={4000}
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="mt-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 text-green-400 font-bold mb-3 text-lg">
                      3
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {t('landing.step3Title')}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {t('landing.step3Description')}
                    </p>
                  </div>
                </motion.div>

                {/* Step 4: Track Progress */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative w-full max-w-[1800px] mx-auto">
                    <Image
                      src="/screenshots/trophiesview-english.png"
                      alt="Achievements Screen"
                      width={1800}
                      height={4000}
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="mt-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 text-green-400 font-bold mb-3 text-lg">
                      4
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {t('landing.step4Title')}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {t('landing.step4Description')}
                    </p>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 border-t border-white/5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  {t('landing.chooseYourPlan')}
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                  {t('landing.pricingSubtitle')}
                </p>
              </motion.div>

              {/* Billing Period Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex justify-center mb-8"
              >
                <div className="inline-flex bg-white/5 p-1 rounded-xl">
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      billingPeriod === 'monthly'
                        ? 'bg-white text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {t('landing.monthly')}
                  </button>
                  <button
                    onClick={() => setBillingPeriod('yearly')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      billingPeriod === 'yearly'
                        ? 'bg-white text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {t('landing.yearly')}
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">{t('landing.save30')}</span>
                  </button>
                </div>
              </motion.div>

              <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
                {/* Basic Plan */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 hover:border-green-500/30 transition-all duration-300"
                >
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{t('landing.basic')}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">
                        {billingPeriod === 'monthly' ? '€5.99' : '€49.99'}
                      </span>
                      <span className="text-gray-500">
                        {billingPeriod === 'monthly' ? t('landing.perMonth') : t('landing.perYear')}
                      </span>
                    </div>
                    {billingPeriod === 'yearly' && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-gray-500 line-through text-sm">€71.88</span>
                        <span className="text-green-400 text-sm font-medium">{t('landing.save30')}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">{t('landing.trialIncluded')}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      t('landing.feature_juz114'),
                      t('landing.feature_unlimited'),
                      t('landing.feature_translations'),
                      t('landing.feature_progress'),
                      t('landing.feature_audio'),
                      t('landing.feature_transliteration'),
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <SignedOut>
                    <SignUpButton mode="modal">
                      <button className="w-full py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all">
                        {t('landing.startFreeTrial')}
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/pricing">
                      <button className="w-full py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all">
                        {t('landing.startFreeTrial')}
                      </button>
                    </Link>
                  </SignedIn>
                </motion.div>

                {/* Pro Plan */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative bg-gradient-to-b from-green-600/20 to-transparent border-2 border-green-500/50 rounded-2xl p-8"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-600 rounded-full text-xs font-semibold">
                      <Sparkles className="w-3 h-3" />
                      {t('pricing.bestValue')}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                      {t('landing.pro')}
                      <Sparkles className="w-5 h-5 text-green-400" />
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">
                        {billingPeriod === 'monthly' ? '€11.99' : '€99.99'}
                      </span>
                      <span className="text-gray-500">
                        {billingPeriod === 'monthly' ? t('landing.perMonth') : t('landing.perYear')}
                      </span>
                    </div>
                    {billingPeriod === 'yearly' && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-gray-500 line-through text-sm">€143.88</span>
                        <span className="text-green-400 text-sm font-medium">{t('landing.save35')}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">{t('landing.trialIncluded')}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      t('landing.feature_juz114'),
                      t('landing.feature_unlimited'),
                      t('landing.feature_translations'),
                      t('landing.feature_progress'),
                      t('landing.feature_audio'),
                      t('landing.feature_transliteration'),
                      t('landing.feature_aiTafsir'),
                      t('landing.feature_wordAudio'),
                      t('landing.feature_support'),
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <SignedOut>
                    <SignUpButton mode="modal">
                      <button className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white transition-all">
                        {t('landing.startFreeTrial')}
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/pricing">
                      <button className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white transition-all">
                        {t('landing.startFreeTrial')}
                      </button>
                    </Link>
                  </SignedIn>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-8 text-center"
              >
                <p className="text-gray-500 text-sm">
                  {t('landing.securePayment')}
                </p>
              </motion.div>
            </section>

            {/* Final CTA Section - Strong Call to Action */}
            <section className="py-20 border-t border-white/5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/30 rounded-3xl p-8 sm:p-16"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 text-center">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                    {t('landing.readyToTransform')}
                    <br />
                    <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      {t('landing.quranicJourney')}
                    </span>
                  </h2>
                  
                  <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                    {t('landing.dontWait')}
                  </p>

                  {/* Primary CTA */}
                  <SignedOut>
                    <div className="mb-8">
                      <SignUpButton mode="modal">
                        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-12 py-6 text-xl rounded-xl shadow-xl shadow-green-600/30 font-semibold min-h-[60px]">
                          {t('landing.getStarted')}
                          <Flame className="w-6 h-6 ml-2" />
                        </Button>
                      </SignUpButton>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{t('landing.trialIncluded')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{t('landing.noCreditCard')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{t('landing.startImmediately')}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                      <span>{t('landing.alreadyHaveAccount')}</span>
                      <SignInButton mode="modal">
                        <button className="text-green-400 hover:text-green-300 underline font-medium">
                          {t('landing.signIn')}
                        </button>
                      </SignInButton>
                    </div>
                  </SignedOut>

                  <SignedIn>
                    <DashboardButton 
                      t={t}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-12 py-6 text-xl rounded-xl shadow-xl shadow-green-600/30 font-semibold min-h-[60px]"
                    />
                  </SignedIn>
                </div>
              </motion.div>
            </section>
          </main>

          {/* Footer */}
          <footer className="border-t border-white/5 py-8 mt-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                  <Image 
                    src="/ayatbits-logo.svg" 
                    alt="AyatBits" 
                    width={180} 
                    height={48}
                    className="h-10 w-auto"
                  />
                </Link>
              <div className="flex gap-6 text-sm text-gray-500">
                <Link href="/terms" className="hover:text-white transition-colors">{t('landing.termsLink')}</Link>
                <Link href="/faq" className="hover:text-white transition-colors">{t('landing.faqLink')}</Link>
                <Link href="/pricing" className="hover:text-white transition-colors">{t('landing.pricingLink')}</Link>
              </div>
                <div className="text-sm text-gray-600 text-center sm:text-right">
                  <p className="mb-1">© 2026 AyatBits. {t('landing.allRightsReserved')}</p>
                  <p className="text-xs text-gray-700">
                    {t('landing.companyInfo')}
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Suspense>
  );
}
