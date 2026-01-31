'use client';

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Puzzle, Trophy, Flame, Star, Sparkles, CheckCircle2, Quote } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import UserProfileSection from "@/components/UserProfileSection";
import DemoPuzzle from "@/components/DemoPuzzle";
import { QuranLoader } from "@/components/animations";
import WaitlistForm from "@/components/WaitlistForm";
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
function DashboardButton({ size, className = "" }: { size?: "default" | "sm" | "lg" | "icon" | null, className?: string }) {
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
          Start Learning
          <Flame className="w-5 h-5 ml-2" />
        </Button>
      </Link>
    );
  }

  // If user has access, show "Continue Learning" and link to dashboard
  return (
    <Link href="/dashboard">
      <Button size={size} className={className}>
        Continue Learning
        <Flame className="w-5 h-5 ml-2" />
      </Button>
    </Link>
  );
}


export default function Home() {
  const { t } = useI18n();
  
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
                <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                  <Image 
                    src="/ayatbits-logo.svg" 
                    alt="AyatBits" 
                    width={180} 
                    height={48}
                    priority
                    className="h-10 w-auto"
                  />
                </Link>
                <div className="flex items-center gap-3">
                  {/* Language Selector */}
                  <LanguageSelector />
                  
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
            {/* Hero Section with Integrated Waitlist */}
            <section className="py-20 md:py-32 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-8">
                  <Sparkles className="w-4 h-4" />
                  <span>{t('landing.gamifiedLearning')}</span>
                </div>

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

                {/* Waitlist Section - Prominent Hero CTA */}
                <div className="max-w-2xl mx-auto">
                  <SignedOut>
                    {/* Waitlist Form */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {t('landing.waitlistTitle')}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {t('landing.waitlistDescription')}
                        </p>
                      </div>
                      
                      <WaitlistForm source="hero-banner" />
                      
                      <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          <span>{t('landing.freeToJoin')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          <span>{t('landing.earlyAccessPerks')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          <span>{t('landing.launchUpdates')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mt-6">
                      <span>{t('landing.alreadyHaveAccount')}</span>
                      <SignInButton mode="modal">
                        <button className="text-green-400 hover:text-green-300 underline">
                          {t('landing.signIn')}
                        </button>
                      </SignInButton>
                    </div>
                  </SignedOut>

                  {/* CTA for Signed In Users */}
                  <SignedIn>
                    <DashboardButton 
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-8 py-5 text-lg rounded-xl shadow-lg shadow-green-600/25 min-h-[56px]"
                    />
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
                  {t('landing.whyAyatBits')}
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                  {t('landing.whySubtitle')}
                </p>
              </motion.div>

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
                  { value: "30", label: t('landing.juzAvailable') },
                  { value: "114", label: t('landing.surahs') },
                  { value: "6,236", label: t('landing.verses') },
                  { value: "15+", label: t('landing.translations') },
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-6">
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
                      <WaitlistForm source="final-cta" />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{t('landing.freeToJoin')}</span>
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
                  </SignedOut>

                  <SignedIn>
                    <DashboardButton 
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
                <Link href="/waitlist" className="hover:text-white transition-colors">{t('landing.waitlistLink')}</Link>
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
