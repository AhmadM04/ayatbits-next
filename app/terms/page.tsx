'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function TermsPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
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
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('landing.backToHome')}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <p className="text-gray-500 text-sm mb-6">{t('tos.lastUpdated')}</p>

          <div className="space-y-6 text-gray-400 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-white mb-2">{t('tos.tosSimplified1Title')}</h2>
              <p>{t('tos.tosSimplified1')}</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">{t('tos.tosSimplified2Title')}</h2>
              <p>{t('tos.tosSimplified2')}</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">{t('tos.tosSimplified3Title')}</h2>
              <p>{t('tos.tosSimplified3')}</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">{t('tos.tosSimplified4Title')}</h2>
              <p>{t('tos.tosSimplified4')}</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">{t('tos.tosSimplified5Title')}</h2>
              <p>{t('tos.tosSimplified5')}</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">{t('tos.section13Title')}</h2>
              <div className="space-y-3">
                <p>{t('tos.section13Content1')}</p>
                <div className="pl-4 space-y-2">
                  <p><strong className="text-white">{t('tos.section13Under13')}</strong> {t('tos.section13Under13Text')}</p>
                  <p><strong className="text-white">{t('tos.section13Above13')}</strong> {t('tos.section13Above13Text')}</p>
                  <p><strong className="text-white">{t('tos.section13Parents')}</strong> {t('tos.section13ParentsText')}</p>
                </div>
                <p>{t('tos.section13Content2')}</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">{t('tos.tosSimplified7Title')}</h2>
              <p>{t('tos.tosSimplified7')}</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">{t('tos.tosSimplified8Title')}</h2>
              <p>{t('tos.tosSimplified8')}</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">{t('tos.tosSimplified9Title')}</h2>
              <p>{t('tos.tosSimplified9')}</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">{t('tos.section14Title')}</h2>
              <p>{t('tos.section14Content')}</p>
              <p className="mt-2 text-gray-500">{t('tos.section14Copyright')}</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">{t('tos.section15Title')}</h2>
              <p>
                {t('tos.section15Content')}{' '}
                <a href="mailto:hello@ayatbits.com" className="text-green-500 hover:underline">
                  hello@ayatbits.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
