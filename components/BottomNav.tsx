'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Trophy, Play, Home, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResumeData {
  resumeUrl: string | null;
  surahName?: string;
  ayahNumber?: number;
}

export default function BottomNav() {
  const pathname = usePathname();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  useEffect(() => {
    fetch('/api/user/resume')
      .then(res => res.json())
      .then(data => setResumeData(data))
      .catch(console.error);
  }, []);

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/dashboard/liked', icon: Heart, label: 'Liked' },
    { href: 'resume', icon: Play, label: 'Resume', isResume: true },
    { href: '/dashboard/achievements', icon: Trophy, label: 'Awards' },
    { href: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#111]/95 backdrop-blur-md border-t border-white/5 safe-area-bottom">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isResume = item.isResume;
            
            if (isResume) {
              return (
                <Link
                  key={item.label}
                  href={resumeData?.resumeUrl || '/dashboard'}
                  className="relative -mt-6"
                >
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/30"
                  >
                    <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                  </motion.div>
                  {resumeData?.surahName && (
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[10px] text-gray-500">
                        {resumeData.surahName}
                      </span>
                    </div>
                  )}
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                  isActive ? 'text-green-500' : 'text-gray-500'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-green-500' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

