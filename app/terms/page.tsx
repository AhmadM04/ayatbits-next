import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <p className="text-gray-500 text-sm mb-6">Last updated: December 2025</p>

          <div className="space-y-6 text-gray-400 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-white mb-2">1. Acceptance of Terms</h2>
              <p>By using AyatBits, you agree to these terms. If you don't agree, please don't use the service.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">2. Service Description</h2>
              <p>AyatBits is an educational platform for learning the Quran through interactive word puzzles, translations, and audio recitations.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">3. Subscription & Billing</h2>
              <p>Some features require a paid subscription. Subscriptions auto-renew unless cancelled. You will be charged automatically each billing cycle unless you cancel before the renewal date.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">4. Free Trial</h2>
              <p>New users get a 7-day free trial with full access. <strong>Important:</strong> You must provide payment information to start the trial. If you don't cancel before the trial ends, you will automatically be charged for your selected plan.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">5. User Accounts</h2>
              <p>You're responsible for keeping your account secure. Notify us immediately of any unauthorized use.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">6. Acceptable Use</h2>
              <p>Don't violate laws, attempt unauthorized access, share credentials, copy our content, or use automated systems to access the service.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">7. Intellectual Property</h2>
              <p>AyatBits content is protected by copyright. The Quranic text is in the public domain.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">8. Disclaimer</h2>
              <p>The service is provided "as is" without warranties. We don't guarantee uninterrupted or error-free service.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">9. Company Information</h2>
              <p>
                AyatBits is a product of HIYA FOR EDUCATION AND TUTORING OU, registered in Estonia.
              </p>
              <p className="mt-2 text-gray-500">
                Copyright © 2026 HIYA FOR EDUCATION AND TUTORING OU. All rights reserved.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white mb-2">10. Contact</h2>
              <p>
                Questions? Email us at{' '}
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
