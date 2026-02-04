import { ReactNode } from 'react';

export default function MushafLayout({ children }: { children: ReactNode }) {
  // Mushaf has its own navigation, no bottom nav
  return <>{children}</>;
}


