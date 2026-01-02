'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqItems = [
  {
    question: "What is AyatBits?",
    answer: "AyatBits is an interactive Quran learning app that uses word puzzles to help you memorize and understand the Quran. By arranging words in the correct order, you actively engage with each ayah, making memorization more effective and enjoyable."
  },
  {
    question: "How does the puzzle system work?",
    answer: "Each puzzle presents you with the words of an ayah in a shuffled order. Your task is to drag or tap the words to arrange them in the correct sequence. This active engagement helps reinforce your memory of the verse structure and word order."
  },
  {
    question: "What happens if I make mistakes?",
    answer: "You have 3 attempts per puzzle. If you exceed the mistake limit, you'll be prompted to review the ayah before trying again. This ensures you understand the verse before moving on."
  },
  {
    question: "How do streaks work?",
    answer: "Your streak increases by 1 for each consecutive day you complete at least one puzzle. If you miss a day, your streak resets to zero. Streaks help motivate consistent daily practice."
  },
  {
    question: "What translations are available?",
    answer: "We offer 18+ translations including English (Sahih International, Pickthall, Yusuf Ali), Arabic Tafsir, French, German, Spanish, Turkish, Urdu, Indonesian, Malay, Bengali, Hindi, Russian, Chinese, Japanese, and Dutch."
  },
  {
    question: "What is the 7-day free trial?",
    answer: "New users get full access to all features for 7 days. You must provide payment information to start the trial. If you don't cancel before the trial ends, you will be automatically charged for your selected subscription plan."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach our support team at hello@ayatbits.com. We typically respond within 24-48 hours."
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-medium text-white pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-gray-400 text-sm pb-4 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
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
            <h1 className="text-lg font-semibold">FAQ</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Got Questions?</h2>
            <p className="text-gray-400 text-sm">Find answers to common questions below.</p>
          </div>

          <div className="space-y-0">
            {faqItems.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm mb-3">Still have questions?</p>
          <Link
            href="mailto:hello@ayatbits.com"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Contact Support
          </Link>
        </div>
      </main>
    </div>
  );
}
