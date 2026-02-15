'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface TutorialPortalProps {
  children: ReactNode;
}

/**
 * Portal component that renders tutorial overlay directly to document.body
 * This ensures the tutorial is not constrained by parent position: relative styles
 */
export function TutorialPortal({ children }: TutorialPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}

