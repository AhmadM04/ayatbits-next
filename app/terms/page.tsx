import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            <Link
              href="/dashboard/profile"
              className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <h1 className="text-lg font-semibold">Terms of Service</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
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
