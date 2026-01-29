// Tutorial state management with localStorage

const STORAGE_KEY = 'ayatbits_tutorials';

export type TutorialSection = 
  | 'dashboard_intro'
  | 'puzzle_guide'
  | 'profile_settings'
  | 'billing_overview';

interface TutorialState {
  [key: string]: boolean;
}

/**
 * Get the tutorial completion state from localStorage
 */
export function getTutorialStatus(): TutorialState {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to load tutorial state:', error);
    return {};
  }
}

/**
 * Check if a specific tutorial should be shown (not completed)
 */
export function shouldShowTutorial(section: TutorialSection): boolean {
  const state = getTutorialStatus();
  return !state[section];
}

/**
 * Mark a tutorial as completed
 */
export function markTutorialComplete(section: TutorialSection): void {
  if (typeof window === 'undefined') return;
  
  try {
    const state = getTutorialStatus();
    state[section] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save tutorial state:', error);
  }
}

/**
 * Reset all tutorials (for testing or user preference)
 */
export function resetTutorials(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset tutorial state:', error);
  }
}

/**
 * Reset a specific tutorial
 */
export function resetTutorial(section: TutorialSection): void {
  if (typeof window === 'undefined') return;
  
  try {
    const state = getTutorialStatus();
    delete state[section];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to reset tutorial:', error);
  }
}

/**
 * Get list of completed tutorials
 */
export function getCompletedTutorials(): TutorialSection[] {
  const state = getTutorialStatus();
  return Object.entries(state)
    .filter(([_, completed]) => completed)
    .map(([section]) => section as TutorialSection);
}

