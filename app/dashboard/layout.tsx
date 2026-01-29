import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { UserSyncProvider } from '@/components/UserSyncProvider';

// Lazy load tutorial provider for performance
const TutorialProvider = dynamic(
  () => import('@/components/tutorial').then(mod => ({ default: mod.TutorialProvider })),
  { ssr: false }
);

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <UserSyncProvider>
      <TutorialProvider>
        {children}
      </TutorialProvider>
    </UserSyncProvider>
  );
}
