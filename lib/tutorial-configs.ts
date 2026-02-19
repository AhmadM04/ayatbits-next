import { TutorialStep } from '@/components/tutorial';

// ============================================================================
// Shared lifecycle helpers
// ============================================================================

/**
 * Close the mobile burger menu (if it is currently open) and wait for its
 * closing animation to finish before resolving.
 *
 * This is used as an `onBeforeNext` hook on tutorial steps that are displayed
 * inside the mobile menu, so that the menu is neatly closed before the
 * tutorial moves to the next step that lives on the main page.
 *
 * @param delayMs  How long to wait after triggering the close (default 300 ms).
 *                 The burger-menu animation is 150 ms; the extra buffer lets
 *                 React flush and the viewport settle before the next step
 *                 starts positioning itself.
 */
async function closeMobileMenuForTutorial(delayMs = 300): Promise<void> {
  const burgerButton = document.querySelector(
    '[data-mobile-menu-toggle]'
  ) as HTMLButtonElement | null;

  if (burgerButton) {
    const isMenuOpen = burgerButton.getAttribute('data-menu-open') === 'true';
    if (isMenuOpen) {
      burgerButton.click(); // triggers the React state toggle that closes the menu
      await new Promise<void>(resolve => setTimeout(resolve, delayMs));
    }
  }
}

// ============================================================================
// Dashboard tutorial steps
// ============================================================================

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
    target: '[data-tutorial="streak-icon"]',
    title: 'tutorial.trackProgress',
    message: 'tutorial.trackProgressMsg',
    placement: 'bottom',
    // Never auto-advance — the user must click Next manually.
    requireManualAdvance: true,
    // When the user clicks Next, close the burger menu first so that Step 3
    // can scroll to its target on the main dashboard without the menu
    // obscuring the viewport.
    onBeforeNext: () => closeMobileMenuForTutorial(300),
  },
  {
    id: 'dashboard-juz',
    target: '[data-tutorial="juz-grid"]',
    title: 'tutorial.exploreQuran',
    message: 'tutorial.exploreQuranMsg',
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
    id: 'dashboard-nav',
    target: '[data-tutorial="bottom-nav"]',
    title: 'tutorial.easyNavigation',
    message: 'tutorial.easyNavigationMsg',
    placement: 'top',
  },
];

/**
 * Language Selector Tutorial Step (for users with no streak)
 */
export const languageSelectorTutorialStep: TutorialStep = {
  id: 'dashboard-language-selector',
  target: '[data-tutorial="language-selector"]',
  title: 'tutorial.switchLanguage',
  message: 'tutorial.switchLanguageMsg',
  placement: 'bottom',
};

/**
 * Puzzle Tutorial Configuration (static default — 3 hints)
 * Prefer createPuzzleTutorialSteps(hintCount) when the actual ayah is available.
 */
export const puzzleTutorialSteps: TutorialStep[] = [
  {
    id: 'puzzle-intro',
    target: '[data-tutorial="puzzle-container"]',
    title: 'tutorial.puzzleIntro',
    message: 'tutorial.puzzleIntroMsg',
    placement: 'bottom',
  },
  {
    id: 'puzzle-bank',
    target: '[data-tutorial="word-bank"]',
    title: 'tutorial.wordBank',
    message: 'tutorial.wordBankMsg',
    placement: 'bottom',
  },
  {
    id: 'puzzle-answer',
    target: '[data-tutorial="answer-area"]',
    title: 'tutorial.answerArea',
    message: 'tutorial.answerAreaMsg',
    placement: 'top',
  },
  {
    id: 'puzzle-hint',
    target: '[data-tutorial="hint-button"]',
    title: 'tutorial.needHelp',
    message: 'tutorial.needHelpMsg',
    params: { count: 3 },
    placement: 'left',
    offset: { x: -20 },
  },
];

/**
 * Create puzzle tutorial steps with a dynamic hint count.
 * The last step ("Need Help?") will show the real number of hints
 * available for the current ayah instead of a hardcoded value.
 *
 * @param hintCount - Result of calculateTipsForAyah(wordCount)
 */
export function createPuzzleTutorialSteps(hintCount: number): TutorialStep[] {
  return [
    ...puzzleTutorialSteps.slice(0, -1),
    {
      ...puzzleTutorialSteps[puzzleTutorialSteps.length - 1],
      params: { count: hintCount },
    },
  ];
}

/**
 * Profile Tutorial Configuration
 */
export const profileTutorialSteps: TutorialStep[] = [
  {
    id: 'profile-stats',
    target: '[data-tutorial="profile-stats"]',
    title: 'tutorial.yourStats',
    message: 'tutorial.yourStatsMsg',
    placement: 'bottom',
  },
  {
    id: 'profile-translation',
    target: '[data-tutorial="translation-selector"]',
    title: 'tutorial.chooseTranslation',
    message: 'tutorial.chooseTranslationMsg',
    placement: 'bottom',
  },
  {
    id: 'profile-audio',
    target: '[data-tutorial="audio-settings"]',
    title: 'tutorial.audioSettings',
    message: 'tutorial.audioSettingsMsg',
    placement: 'bottom',
  },
  {
    id: 'profile-account',
    target: '[data-tutorial="account-section"]',
    title: 'tutorial.manageAccountTitle',
    message: 'tutorial.manageAccountMsg',
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
    title: 'tutorial.subscriptionStatus',
    message: 'tutorial.subscriptionStatusMsg',
    placement: 'bottom',
  },
  {
    id: 'billing-plans',
    target: '[data-tutorial="plan-options"]',
    title: 'tutorial.choosePlan',
    message: 'tutorial.choosePlanMsg',
    placement: 'bottom',
  },
  {
    id: 'billing-manage',
    target: '[data-tutorial="manage-subscription"]',
    title: 'tutorial.manageSubscription',
    message: 'tutorial.manageSubscriptionMsg',
    placement: 'bottom',
  },
];

/**
 * Verse Browsing Tutorial Configuration
 */
export const verseBrowsingTutorialSteps: TutorialStep[] = [
  {
    id: 'verse-intro',
    target: '[data-tutorial="arabic-text"]',
    title: 'tutorial.verseBrowsingIntro',
    message: 'tutorial.verseBrowsingIntroMsg',
    placement: 'bottom',
  },
  {
    id: 'verse-translation-selector',
    target: '[data-tutorial="translation-button"]',
    title: 'tutorial.changeTranslation',
    message: 'tutorial.changeTranslationMsg',
    placement: 'bottom',
  },
  {
    id: 'verse-transliteration',
    target: '[data-tutorial="transliteration-button"]',
    title: 'tutorial.showTransliteration',
    message: 'tutorial.showTransliterationMsg',
    placement: 'bottom',
  },
  {
    id: 'verse-tafsir',
    target: '[data-tutorial="tafsir-button"]',
    title: 'tutorial.readTafsir',
    message: 'tutorial.readTafsirMsg',
    placement: 'bottom',
  },
  {
    id: 'verse-ai-tafsir',
    target: '[data-tutorial="ai-tafsir-button"]',
    title: 'tutorial.aiTafsir',
    message: 'tutorial.aiTafsirMsg',
    placement: 'bottom',
  },
  {
    id: 'verse-translation',
    target: '[data-tutorial="translation"]',
    title: 'tutorial.viewTranslation',
    message: 'tutorial.viewTranslationMsg',
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
    title: 'tutorial.mushafIntro',
    message: 'tutorial.mushafIntroMsg',
    placement: 'bottom',
  },
  {
    id: 'mushaf-navigation',
    target: '[data-tutorial="page-navigation"]',
    title: 'tutorial.navigatePages',
    message: 'tutorial.navigatePagesMsg',
    placement: 'bottom',
  },
  {
    id: 'mushaf-swipe',
    target: '[data-tutorial="page-content"]',
    title: 'tutorial.swipeNavigate',
    message: 'tutorial.swipeNavigateMsg',
    placement: 'top',
  },
  {
    id: 'mushaf-ayah-actions',
    target: '[data-tutorial="ayah-row"]',
    title: 'tutorial.ayahActions',
    message: 'tutorial.ayahActionsMsg',
    placement: 'top',
  },
  {
    id: 'mushaf-tafsir',
    target: '[data-tutorial="tafsir-button"]',
    title: 'tutorial.learnTafsir',
    message: 'tutorial.learnTafsirMsg',
    placement: 'top',
  },
  {
    id: 'mushaf-harakat-help',
    target: '[data-tutorial="harakat-legend"]',
    title: 'tutorial.learnHarakat',
    message: 'tutorial.learnHarakatMsg',
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
    title: 'tutorial.yourTrophies',
    message: 'tutorial.yourTrophiesMsg',
    placement: 'bottom',
  },
  {
    id: 'achievements-stats',
    target: '[data-tutorial="stats-overview"]',
    title: 'tutorial.yourStatsAchievements',
    message: 'tutorial.yourStatsAchievementsMsg',
    placement: 'bottom',
  },
  {
    id: 'achievements-unlocked',
    target: '[data-tutorial="unlocked-section"]',
    title: 'tutorial.unlockedTrophies',
    message: 'tutorial.unlockedTrophiesMsg',
    placement: 'bottom',
  },
  {
    id: 'achievements-progress',
    target: '[data-tutorial="progress-section"]',
    title: 'tutorial.workInProgress',
    message: 'tutorial.workInProgressMsg',
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
    title: 'tutorial.yourFavorites',
    message: 'tutorial.yourFavoritesMsg',
    placement: 'bottom',
  },
  {
    id: 'liked-list',
    target: '[data-tutorial="liked-list"]',
    title: 'tutorial.browseCollection',
    message: 'tutorial.browseCollectionMsg',
    placement: 'bottom',
  },
  {
    id: 'liked-actions',
    target: '[data-tutorial="liked-actions"]',
    title: 'tutorial.quickActions',
    message: 'tutorial.quickActionsMsg',
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
    case 'verse_browsing':
      return verseBrowsingTutorialSteps;
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

