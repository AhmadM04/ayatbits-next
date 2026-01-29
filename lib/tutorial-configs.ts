import { TutorialStep } from '@/components/tutorial';

/**
 * Dashboard Tutorial Configuration
 */
export const dashboardTutorialSteps: TutorialStep[] = [
  {
    id: 'dashboard-welcome',
    target: '[data-tutorial="welcome-section"]',
    title: 'Welcome to Ayatbits! 👋',
    message: 'Your personal dashboard for exploring the Quran through interactive puzzles.',
    placement: 'bottom',
  },
  {
    id: 'dashboard-stats',
    target: '[data-tutorial="stats-cards"]',
    title: 'Track Your Progress',
    message: 'Keep an eye on your streak, completed puzzles, and Juz explored here.',
    placement: 'bottom',
  },
  {
    id: 'dashboard-quote',
    target: '[data-tutorial="daily-quote"]',
    title: 'Daily Inspiration',
    message: 'Get inspired with a new Quranic verse every day. Tap to hear the recitation!',
    placement: 'bottom',
  },
  {
    id: 'dashboard-juz',
    target: '[data-tutorial="juz-grid"]',
    title: 'Explore the Quran',
    message: 'Choose any Juz to start solving puzzles and learning the Quran in a fun way.',
    placement: 'bottom',
  },
  {
    id: 'dashboard-nav',
    target: '[data-tutorial="bottom-nav"]',
    title: 'Easy Navigation',
    message: 'Use the bottom navigation to quickly access your dashboard, search, and profile.',
    placement: 'top',
  },
];

/**
 * Puzzle Tutorial Configuration
 */
export const puzzleTutorialSteps: TutorialStep[] = [
  {
    id: 'puzzle-intro',
    target: '[data-tutorial="puzzle-container"]',
    title: 'Welcome to Puzzle Mode! 🧩',
    message: 'Complete the verse by dragging words from the bank to the correct positions.',
    placement: 'bottom',
  },
  {
    id: 'puzzle-bank',
    target: '[data-tutorial="word-bank"]',
    title: 'Word Bank',
    message: 'All the words you need are here. Drag them to the answer area or tap to place them.',
    placement: 'bottom',
  },
  {
    id: 'puzzle-answer',
    target: '[data-tutorial="answer-area"]',
    title: 'Answer Area',
    message: 'Drop words here in the correct order. Tap any word to hear its pronunciation.',
    placement: 'top',
  },
  {
    id: 'puzzle-hint',
    target: '[data-tutorial="hint-button"]',
    title: 'Need Help?',
    message: 'Stuck? Use the hint button to reveal the next word. You have 3 hints per puzzle.',
    placement: 'left',
    offset: { x: -20 },
  },
  {
    id: 'puzzle-audio',
    target: '[data-tutorial="audio-button"]',
    title: 'Listen & Learn',
    message: 'Play the complete verse audio to hear the beautiful recitation.',
    placement: 'left',
    offset: { x: -20 },
  },
];

/**
 * Profile Tutorial Configuration
 */
export const profileTutorialSteps: TutorialStep[] = [
  {
    id: 'profile-stats',
    target: '[data-tutorial="profile-stats"]',
    title: 'Your Stats',
    message: 'View your account details, join date, and learning progress here.',
    placement: 'bottom',
  },
  {
    id: 'profile-translation',
    target: '[data-tutorial="translation-selector"]',
    title: 'Choose Your Translation',
    message: 'Select from multiple English translations to enhance your understanding.',
    placement: 'bottom',
  },
  {
    id: 'profile-audio',
    target: '[data-tutorial="audio-settings"]',
    title: 'Audio Settings',
    message: 'Enable word-by-word audio to hear the pronunciation of each word in puzzles.',
    placement: 'bottom',
  },
  {
    id: 'profile-account',
    target: '[data-tutorial="account-section"]',
    title: 'Manage Your Account',
    message: 'Update your email, password, and other account settings in this section.',
    placement: 'bottom',
  },
];

/**
 * Billing Tutorial Configuration
 */
export const billingTutorialSteps: TutorialStep[] = [
  {
    id: 'billing-status',
    target: '[data-tutorial="subscription-status"]',
    title: 'Subscription Status',
    message: 'View your current plan, trial status, and subscription details here.',
    placement: 'bottom',
  },
  {
    id: 'billing-plans',
    target: '[data-tutorial="plan-options"]',
    title: 'Choose Your Plan',
    message: 'Explore monthly, yearly, and lifetime plans to continue your learning journey.',
    placement: 'bottom',
  },
  {
    id: 'billing-manage',
    target: '[data-tutorial="manage-subscription"]',
    title: 'Manage Subscription',
    message: 'Update your payment method, cancel, or modify your subscription anytime.',
    placement: 'bottom',
  },
];

/**
 * Helper function to get tutorial steps by section
 */
export function getTutorialSteps(section: string): TutorialStep[] {
  switch (section) {
    case 'dashboard_intro':
      return dashboardTutorialSteps;
    case 'puzzle_guide':
      return puzzleTutorialSteps;
    case 'profile_settings':
      return profileTutorialSteps;
    case 'billing_overview':
      return billingTutorialSteps;
    default:
      return [];
  }
}

