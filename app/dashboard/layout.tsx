import { ReactNode } from 'react';
import { UserSyncProvider } from '@/components/UserSyncProvider';
import { TutorialProvider } from '@/components/tutorial';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <UserSyncProvider>
      <TutorialProvider>
        {children}
      </TutorialProvider>
    </UserSyncProvider>
  );
}
