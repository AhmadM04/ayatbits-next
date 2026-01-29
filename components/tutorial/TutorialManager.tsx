'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { TutorialOverlay, TutorialStep } from './TutorialOverlay';
import { TutorialSection, shouldShowTutorial, markTutorialComplete } from '@/lib/tutorial-manager';

interface TutorialContextValue {
  startTutorial: (section: TutorialSection, steps: TutorialStep[]) => void;
  skipTutorial: () => void;
  isActive: boolean;
  currentSection: TutorialSection | null;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
}

interface TutorialProviderProps {
  children: ReactNode;
}

export function TutorialProvider({ children }: TutorialProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [currentSection, setCurrentSection] = useState<TutorialSection | null>(null);

  const startTutorial = useCallback((section: TutorialSection, tutorialSteps: TutorialStep[]) => {
    setCurrentSection(section);
    setSteps(tutorialSteps);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const skipTutorial = useCallback(() => {
    if (currentSection) {
      markTutorialComplete(currentSection);
    }
    setIsActive(false);
    setCurrentStep(0);
    setSteps([]);
    setCurrentSection(null);
  }, [currentSection]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Tutorial complete
      skipTutorial();
    }
  }, [currentStep, steps.length, skipTutorial]);

  // Prevent body scroll when tutorial is active and cleanup
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
      document.body.style.pointerEvents = 'auto';
    } else {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    };
  }, [isActive]);

  return (
    <TutorialContext.Provider
      value={{
        startTutorial,
        skipTutorial,
        isActive,
        currentSection,
      }}
    >
      {children}
      <TutorialOverlay
        steps={steps}
        currentStep={currentStep}
        onNext={handleNext}
        onSkip={skipTutorial}
        isActive={isActive}
      />
    </TutorialContext.Provider>
  );
}

