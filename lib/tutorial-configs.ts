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
    placement: 'left',
    offset: { x: -20 },
  },
  {
    id: 'puzzle-audio',
    target: '[data-tutorial="audio-button"]',
    title: 'tutorial.listenLearn',
    message: 'tutorial.listenLearnMsg',
    placement: 'left',
    offset: { x: -20 },
  },
  {
    id: 'puzzle-tafsir',
    target: '[data-tutorial="tafsir-button"]',
    title: 'tutorial.understandAyah',
    message: 'tutorial.understandAyahMsg',
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

