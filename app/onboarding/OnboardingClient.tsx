'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n-config';
import { useToast } from '@/components/Toast';

interface OnboardingClientProps {
  userFirstName: string;
  currentTranslation: string;
  currentLocale: string;
}

const translationNames: Record<string, string> = {
  'en.sahih': 'Sahih International',
  'en.pickthall': 'Pickthall',
  'en.yusufali': 'Yusuf Ali',
  'ar.jalalayn': 'Tafsir Al-Jalalayn',
  'ar.tafseer': 'Tafsir Al-Muyassar',
  'fr.hamidullah': 'Hamidullah (French)',
  'es.cortes': 'Cortes (Spanish)',
  'de.bubenheim': 'Bubenheim (German)',
  'tr.yazir': 'Yazır (Turkish)',
  'ur.maududi': 'Maududi (Urdu)',
  'id.muntakhab': 'Muntakhab (Indonesian)',
  'ms.basmeih': 'Basmeih (Malay)',
  'bn.hoque': 'Hoque (Bengali)',
  'hi.hindi': 'Hindi',
  'ru.kuliev': 'Kuliev (Russian)',
  'zh.chinese': 'Chinese',
  'ja.japanese': 'Japanese',
  'nl.dutch': 'Dutch',
};

const translationOptions = Object.entries(translationNames).map(([code, name]) => ({
  code,
  name,
}));

export default function OnboardingClient({
  userFirstName,
  currentTranslation,
  currentLocale,
}: OnboardingClientProps) {
  const router = useRouter();
  const { t, setLocale, locale } = useI18n();
  const { showToast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    referralSource: '',
    ageRange: '',
    preferredLanguage: currentLocale,
    translation: currentTranslation,
  });

  const totalSteps = 4;

  const referralOptions = [
    { value: 'social_media', label: t('onboarding.referralSocialMedia') },
    { value: 'search_engine', label: t('onboarding.referralSearchEngine') },
    { value: 'friend_family', label: t('onboarding.referralFriendFamily') },
    { value: 'youtube', label: t('onboarding.referralYouTube') },
    { value: 'podcast', label: t('onboarding.referralPodcast') },
    { value: 'blog_article', label: t('onboarding.referralBlogArticle') },
    { value: 'other', label: t('onboarding.referralOther') },
  ];

  const ageOptions = [
    { value: 'under_13', label: t('onboarding.ageUnder13'), needsParentalGuidance: true },
    { value: '13_17', label: t('onboarding.age13to17') },
    { value: '18_24', label: t('onboarding.age18to24') },
    { value: '25_34', label: t('onboarding.age25to34') },
    { value: '35_44', label: t('onboarding.age35to44') },
    { value: '45_54', label: t('onboarding.age45to54') },
    { value: '55_plus', label: t('onboarding.age55plus') },
  ];

  const languageOptions: { value: Locale; label: string; nativeName: string }[] = [
    { value: 'en', label: 'English', nativeName: 'English' },
    { value: 'ar', label: 'Arabic', nativeName: 'العربية' },
    { value: 'ru', label: 'Russian', nativeName: 'Русский' },
  ];

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skipped: true }),
      });

      if (response.ok) {
        router.refresh();
        router.push('/dashboard');
      } else {
        showToast('Failed to skip onboarding', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    // Validate current step
    if (currentStep === 1 && !formData.referralSource) {
      showToast('Please select an option', 'error');
      return;
    }
    if (currentStep === 2 && !formData.ageRange) {
      showToast('Please select your age range', 'error');
      return;
    }
    if (currentStep === 3 && !formData.preferredLanguage) {
      showToast('Please select a language', 'error');
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.translation) {
      showToast('Please select a translation', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Profile completed!', 'success');
        router.refresh();
        router.push('/dashboard');
      } else {
        showToast(data.error || 'Failed to save preferences', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLanguageSelect = (lang: Locale) => {
    setFormData({ ...formData, preferredLanguage: lang });
    setLocale(lang);
  };

  const selectedAge = ageOptions.find(opt => opt.value === formData.ageRange);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-white/5 backdrop-blur-md bg-[#0a0a0a]/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Image 
              src="/ayatbits-logo.svg" 
              alt="AyatBits" 
              width={180} 
              height={48}
              priority
              className="h-10 w-auto"
            />
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {t('onboarding.skip')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index + 1 <= currentStep
                      ? 'bg-green-500 w-12'
                      : 'bg-white/10 w-8'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-gray-400">
              {t('onboarding.progressStep', { current: currentStep, total: totalSteps })}
            </p>
          </div>

          {/* Content Card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 sm:p-12"
          >
            <AnimatePresence mode="wait">
              {/* Step 1: Referral Source */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-4">
                      <Sparkles className="w-4 h-4" />
                      <span>{t('onboarding.title')}</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{t('onboarding.step1Title')}</h2>
                    <p className="text-gray-400">{t('onboarding.step1Description')}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {referralOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormData({ ...formData, referralSource: option.value })}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          formData.referralSource === option.value
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-white/10 hover:border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          {formData.referralSource === option.value && (
                            <Check className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Age Range */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">{t('onboarding.step2Title')}</h2>
                    <p className="text-gray-400">{t('onboarding.step2Description')}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {ageOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormData({ ...formData, ageRange: option.value })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.ageRange === option.value
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-white/10 hover:border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className="font-medium text-center">{option.label}</span>
                          {formData.ageRange === option.value && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedAge?.needsParentalGuidance && (
                    <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                      <p className="text-sm text-orange-300 mb-1">
                        {t('onboarding.parentalGuidance')}
                      </p>
                      <Link
                        href="/terms"
                        target="_blank"
                        className="text-sm text-orange-400 hover:text-orange-300 underline"
                      >
                        {t('onboarding.seeTerms')}
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Language */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">{t('onboarding.step3Title')}</h2>
                    <p className="text-gray-400">{t('onboarding.step3Description')}</p>
                  </div>

                  <div className="space-y-3">
                    {languageOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleLanguageSelect(option.value)}
                        className={`w-full p-4 rounded-xl border-2 transition-all ${
                          formData.preferredLanguage === option.value
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-white/10 hover:border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <p className="font-semibold text-lg">{option.nativeName}</p>
                            <p className="text-sm text-gray-400">{option.label}</p>
                          </div>
                          {formData.preferredLanguage === option.value && (
                            <Check className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Translation */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">{t('onboarding.step4Title')}</h2>
                    <p className="text-gray-400">{t('onboarding.step4Description')}</p>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2 space-y-2">
                    {translationOptions.map((option) => (
                      <button
                        key={option.code}
                        onClick={() => setFormData({ ...formData, translation: option.code })}
                        className={`w-full p-3 rounded-xl border transition-all text-left ${
                          formData.translation === option.code
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-white/10 hover:border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.name}</span>
                          {formData.translation === option.code && (
                            <Check className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('onboarding.back')}
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {t('onboarding.next')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : t('onboarding.finish')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

