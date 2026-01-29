import { ReactNode } from 'react';
import { UserSyncProvider } from '@/components/UserSyncProvider';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <UserSyncProvider>
      {children}
    </UserSyncProvider>
  );
}
