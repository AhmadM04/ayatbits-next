import { TutorialStep } from '@/components/tutorial';

/**
 * Dashboard Tutorial Configuration
 * Note: title and message are now translation keys from lib/i18n.tsx
 */
export const dashboardTutorialSteps: TutorialStep[] = [
  {
    id: 'dashboard-welcome',
    target: '[data-tutorial="welcome-section"]',
    title: 'tutorial.dashboardWelcome',
    message: 'tutorial.dashboardWelcomeMsg',
    placement: 'bottom',
  },
  {
    id: 'dashboard-stats',
    target: '[data-tutorial="stats-cards"]',
    title: 'tutorial.trackProgress',
    message: 'tutorial.trackProgressMsg',
    placement: 'bottom',
  },
  {
    id: 'dashboard-quote',
    target: '[data-tutorial="daily-quote"]',
    title: 'tutorial.dailyInspiration',
    message: 'tutorial.dailyInspirationMsg',
    placement: 'bottom',
  },
  {
    id: 'dashboard-juz',
    target: '[data-tutorial="juz-grid"]',
    title: 'tutorial.exploreQuran',
    message: 'tutorial.exploreQuranMsg',
    placement: 'bottom',
  },
  {
    id: 'dashboard-nav',
    target: '[data-tutorial="bottom-nav"]',
    title: 'tutorial.easyNavigation',
    message: 'tutorial.easyNavigationMsg',
    placement: 'top',
  },
];

/**
 * Puzzle Tutorial Configuration
 * Note: These are legacy steps - translations are not yet added to i18n.tsx
 * TODO: Add puzzle tutorial translations to i18n.tsx
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
    message: 'Toggle transliteration to see pronunciation, or tap tafsir to understand the deeper meaning.',
    placement: 'left',
    offset: { x: -20 },
  },
  {
    id: 'puzzle-tafsir',
    target: '[data-tutorial="tafsir-button"]',
    title: 'Understand the Ayah',
    message: 'View tafsir (explanation) to understand the deeper meaning and context of the verse you\'re learning.',
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
 * Mushaf Reading Tutorial Configuration
 */
export const mushafTutorialSteps: TutorialStep[] = [
  {
    id: 'mushaf-intro',
    target: '[data-tutorial="mushaf-page"]',
    title: 'Welcome to Mushaf View! 📖',
    message: 'Read the Quran in traditional Mushaf format, page by page with beautiful Arabic script.',
    placement: 'bottom',
  },
  {
    id: 'mushaf-navigation',
    target: '[data-tutorial="page-navigation"]',
    title: 'Navigate Pages',
    message: 'Jump to any page or Juz quickly using the page selector.',
    placement: 'bottom',
  },
  {
    id: 'mushaf-swipe',
    target: '[data-tutorial="page-content"]',
    title: 'Swipe to Navigate',
    message: 'Swipe left/right or use arrow keys to move between pages. Long press any ayah for options.',
    placement: 'top',
  },
  {
    id: 'mushaf-ayah-actions',
    target: '[data-tutorial="ayah-row"]',
    title: 'Ayah Actions',
    message: 'Long press any ayah to see options: practice puzzle, play audio, view translation, or read tafsir explanation.',
    placement: 'top',
  },
  {
    id: 'mushaf-tafsir',
    target: '[data-tutorial="tafsir-button"]',
    title: 'Learn Tafsir',
    message: 'Tap the tafsir button to read detailed explanations and context of any ayah from authentic sources.',
    placement: 'top',
  },
  {
    id: 'mushaf-harakat-help',
    target: '[data-tutorial="harakat-legend"]',
    title: 'Learn Harakat',
    message: 'Need help with Arabic pronunciation marks? Tap the help button to see the harakat guide.',
    placement: 'left',
    offset: { x: -20 },
  },
];

/**
 * Achievements/Trophies Tutorial Configuration
 */
export const achievementsTutorialSteps: TutorialStep[] = [
  {
    id: 'achievements-intro',
    target: '[data-tutorial="achievements-header"]',
    title: 'Your Trophies! 🏆',
    message: 'Track your achievements and unlock trophies as you progress in your Quran journey.',
    placement: 'bottom',
  },
  {
    id: 'achievements-stats',
    target: '[data-tutorial="stats-overview"]',
    title: 'Your Stats',
    message: 'See your total puzzles completed, best streak, and unlocked trophies at a glance.',
    placement: 'bottom',
  },
  {
    id: 'achievements-unlocked',
    target: '[data-tutorial="unlocked-section"]',
    title: 'Unlocked Trophies',
    message: 'View all the achievements you\'ve earned. Each trophy celebrates your dedication!',
    placement: 'bottom',
  },
  {
    id: 'achievements-progress',
    target: '[data-tutorial="progress-section"]',
    title: 'Work In Progress',
    message: 'Track your progress toward locked achievements. Keep learning to unlock them all!',
    placement: 'bottom',
  },
];

/**
 * Liked Collection Tutorial Configuration
 */
export const likedTutorialSteps: TutorialStep[] = [
  {
    id: 'liked-intro',
    target: '[data-tutorial="liked-header"]',
    title: 'Your Favorites! ❤️',
    message: 'All your liked ayahs are saved here. Build your personal collection of meaningful verses.',
    placement: 'bottom',
  },
  {
    id: 'liked-list',
    target: '[data-tutorial="liked-list"]',
    title: 'Browse Your Collection',
    message: 'Each ayah shows the surah name, ayah number, and Juz. Tap to read the full verse.',
    placement: 'bottom',
  },
  {
    id: 'liked-actions',
    target: '[data-tutorial="liked-actions"]',
    title: 'Quick Actions',
    message: 'Visit the ayah in Mushaf view or remove it from your collection with a tap.',
    placement: 'left',
    offset: { x: -20 },
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
    case 'mushaf_reading':
      return mushafTutorialSteps;
    case 'achievements_trophies':
      return achievementsTutorialSteps;
    case 'liked_collection':
      return likedTutorialSteps;
    default:
      return [];
  }
}

