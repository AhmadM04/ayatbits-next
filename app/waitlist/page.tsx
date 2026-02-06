'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Waitlist page is now hidden - redirecting to homepage
export default function WaitlistPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}

