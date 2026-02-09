'use client';

import { useState, useEffect } from 'react';
import { X, Share, Download, MoreVertical, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function AddToHomeScreen() {
  const { t } = useI18n();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [deviceOS, setDeviceOS] = useState<'ios' | 'android' | 'other'>('other');
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect OS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS) {
      setDeviceOS('ios');
    } else if (isAndroid) {
      setDeviceOS('android');
    } else {
      setDeviceOS('other');
    }

    // Check if already installed (PWA mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);

    // Check if user has dismissed the prompt before
    const hasPromptBeenDismissed = localStorage.getItem('a2hs-dismissed');
    
    if (!isStandalone && !hasPromptBeenDismissed) {
      // Show prompt after 10 seconds
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 10000);

      return () => clearTimeout(timer);
    }

    // Listen for beforeinstallprompt event (Android Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setShowModal(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // If no native prompt, show manual instructions
      setShowModal(true);
      return;
    }

    // Show native install prompt (Android Chrome)
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('a2hs-dismissed', 'true');
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setShowPrompt(false);
  };

  // Don't show anything if already installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Floating Prompt Banner */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
          >
            <div className="bg-gradient-to-r from-green-600/95 to-emerald-600/95 backdrop-blur-lg border border-green-500/30 rounded-2xl shadow-2xl p-4">
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              
              <div className="flex items-start gap-3 pr-6">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-1">
                    {t('addToHomeScreen.installPromptTitle')}
                  </h3>
                  <p className="text-white/90 text-xs mb-3">
                    {t('addToHomeScreen.installPromptText')}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={deferredPrompt ? handleInstall : handleOpenModal}
                      size="sm"
                      className="bg-white text-green-600 hover:bg-white/90 font-semibold text-xs h-8"
                    >
                      {deferredPrompt ? t('addToHomeScreen.installNow') : t('addToHomeScreen.learnHow')}
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      size="sm"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 text-xs h-8"
                    >
                      {t('addToHomeScreen.maybeLater')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (always visible when not installed) */}
      {!showPrompt && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenModal}
          className="fixed bottom-24 right-4 md:bottom-6 md:right-6 w-14 h-14 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-600/30 flex items-center justify-center z-40 hover:shadow-xl hover:shadow-green-600/40 transition-shadow"
          aria-label="Add to Home Screen"
        >
          <Download className="w-6 h-6 text-white" />
        </motion.button>
      )}

      {/* Installation Instructions Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#111] border-b border-white/10 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-lg">
                      {t('addToHomeScreen.install')}
                    </h2>
                    <p className="text-gray-400 text-xs">
                      {t('addToHomeScreen.addToHomeScreen')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* iOS Instructions */}
                {deviceOS === 'ios' && (
                  <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Share className="w-5 h-5 text-blue-400" />
                        <h3 className="text-white font-semibold">
                          {t('addToHomeScreen.forIPhone')}
                        </h3>
                      </div>
                      <ol className="space-y-3 text-gray-300 text-sm">
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold">
                            1
                          </span>
                          <span>
                            {t('addToHomeScreen.iosStep1')}
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold">
                            2
                          </span>
                          <span>
                            {t('addToHomeScreen.iosStep2')}
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-semibold">
                            3
                          </span>
                          <span>
                            {t('addToHomeScreen.iosStep3')}
                          </span>
                        </li>
                      </ol>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                      <p className="text-amber-200 text-xs flex items-start gap-2">
                        <span className="text-amber-400 text-lg leading-none">⚠️</span>
                        <span>
                          {t('addToHomeScreen.iosNote')}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Android Instructions */}
                {deviceOS === 'android' && (
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Download className="w-5 h-5 text-green-400" />
                        <h3 className="text-white font-semibold">
                          {t('addToHomeScreen.forAndroid')}
                        </h3>
                      </div>
                      
                      {deferredPrompt ? (
                        <div className="space-y-3">
                          <p className="text-gray-300 text-sm">
                            {t('addToHomeScreen.installPromptText')}
                          </p>
                          <Button
                            onClick={handleInstall}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {t('addToHomeScreen.installNow')}
                          </Button>
                        </div>
                      ) : (
                        <ol className="space-y-3 text-gray-300 text-sm">
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-semibold">
                              1
                            </span>
                            <span>
                              {t('addToHomeScreen.androidStep1')}
                            </span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-semibold">
                              2
                            </span>
                            <span>
                              {t('addToHomeScreen.androidStep2')}
                            </span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-semibold">
                              3
                            </span>
                            <span>
                              {t('addToHomeScreen.androidStep3')}
                            </span>
                          </li>
                        </ol>
                      )}
                    </div>
                  </div>
                )}

                {/* Desktop/Other Instructions */}
                {deviceOS === 'other' && (
                  <div className="space-y-4">
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Download className="w-5 h-5 text-purple-400" />
                        <h3 className="text-white font-semibold">
                          {t('addToHomeScreen.forDesktop')}
                        </h3>
                      </div>
                      <ol className="space-y-3 text-gray-300 text-sm">
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-semibold">
                            1
                          </span>
                          <span>
                            {t('addToHomeScreen.desktopStep1')}
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-semibold">
                            2
                          </span>
                          <span>
                            {t('addToHomeScreen.desktopStep2')}
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-semibold">
                            3
                          </span>
                          <span>
                            {t('addToHomeScreen.desktopStep3')}
                          </span>
                        </li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* Benefits Section */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-400" />
                    {t('addToHomeScreen.whyInstall')}
                  </h4>
                  <ul className="space-y-2 text-gray-300 text-xs">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span>{t('addToHomeScreen.benefit1')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span>{t('addToHomeScreen.benefit2')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span>{t('addToHomeScreen.benefit3')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span>{t('addToHomeScreen.benefit4')}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-[#111] border-t border-white/10 p-4">
                <Button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  {t('addToHomeScreen.gotItThanks')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Helper component to show sparkles icon
function Sparkles({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3L14 8L19 10L14 12L12 17L10 12L5 10L10 8L12 3Z" />
      <path d="M19 4L20 7L23 8L20 9L19 12L18 9L15 8L18 7L19 4Z" />
    </svg>
  );
}

