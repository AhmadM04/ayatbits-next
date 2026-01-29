'use client';

import { useEffect, ReactNode } from 'react';
import { useTutorial } from './TutorialManager';
import { TutorialSection, shouldShowTutorial } from '@/lib/tutorial-manager';
import { TutorialStep } from './TutorialOverlay';

interface TutorialWrapperProps {
  children: ReactNode;
  sectionId: TutorialSection;
  steps: TutorialStep[];
  delay?: number;
  enabled?: boolean;
}

/**
 * Wrapper component that automatically starts a tutorial on first visit
 */
export function TutorialWrapper({
  children,
  sectionId,
  steps,
  delay = 500,
  enabled = true,
}: TutorialWrapperProps) {
  const { startTutorial, isActive } = useTutorial();

  useEffect(() => {
    if (!enabled || isActive) return;

    const timer = setTimeout(() => {
      if (shouldShowTutorial(sectionId)) {
        startTutorial(sectionId, steps);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [sectionId, steps, delay, enabled, startTutorial, isActive]);

  return <>{children}</>;
}

