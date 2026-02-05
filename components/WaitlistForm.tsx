'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Mail, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useI18n } from '@/lib/i18n';

interface WaitlistFormProps {
  source?: string;
}

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function WaitlistForm({ source = 'web' }: WaitlistFormProps) {
  const { t } = useI18n();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || firstName.trim().length < 2) {
      setErrorMessage(t('waitlist.errorInvalidName'));
      setState('error');
      return;
    }
    
    if (!email || !email.includes('@')) {
      setErrorMessage(t('waitlist.errorInvalidEmail'));
      setState('error');
      return;
    }

    setState('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName: firstName.trim(), email, source }),
      });

      const data = await response.json();

      if (data.success) {
        setState('success');
        setFirstName('');
        setEmail('');
        
        // Trigger confetti celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#16a34a', '#22c55e', '#86efac'],
        });

        // Additional confetti burst
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#16a34a', '#22c55e', '#86efac'],
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#16a34a', '#22c55e', '#86efac'],
          });
        }, 200);
      } else {
        setState('error');
        setErrorMessage(data.error || t('waitlist.errorGeneric'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setState('error');
      setErrorMessage(t('waitlist.errorNetwork'));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {state === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{t('waitlist.success')}</h3>
            <p className="text-gray-400 mb-6">
              {t('waitlist.successMessage')}
            </p>
            <Button
              onClick={() => setState('idle')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              {t('waitlist.joinAnother')}
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (state === 'error') setState('idle');
                }}
                placeholder={t('waitlist.firstName')}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                disabled={state === 'loading'}
                required
                minLength={2}
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === 'error') setState('idle');
                }}
                placeholder={t('waitlist.email')}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                disabled={state === 'loading'}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={state === 'loading'}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-4 text-lg font-semibold rounded-xl shadow-lg shadow-green-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('waitlist.joining')}
                </span>
              ) : (
                t('waitlist.joinButton')
              )}
            </Button>

            <AnimatePresence>
              {state === 'error' && errorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400 text-sm text-center"
                >
                  {errorMessage}
                </motion.p>
              )}
            </AnimatePresence>

            <p className="text-xs text-gray-500 text-center">
              {t('waitlist.disclaimer')}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

