# Language Selector Tutorial Implementation

## Overview
Added a tutorial step for the language selector (globe icon) in the dashboard header. This tutorial appears **only for users with no streak** (currentStreak === 0), helping new users discover they can switch the interface language between Arabic, English, and Russian.

## Changes Made

### 1. LanguageSelector Component
**File:** `components/LanguageSelector.tsx`
- Added `data-tutorial="language-selector"` attribute to the wrapper div
- This allows the tutorial system to target this element

### 2. Tutorial Configuration
**File:** `lib/tutorial-configs.ts`
- Created new tutorial step: `languageSelectorTutorialStep`
- Configuration:
  ```typescript
  {
    id: 'dashboard-language-selector',
    target: '[data-tutorial="language-selector"]',
    title: 'tutorial.switchLanguage',
    message: 'tutorial.switchLanguageMsg',
    placement: 'bottom',
  }
  ```
- Exported as a named export for use in dashboard

### 3. Dashboard Integration
**File:** `app/dashboard/DashboardContent.tsx`
- Imported `languageSelectorTutorialStep` from tutorial configs
- Added the language selector step to the tutorial flow for users with no streak
- Tutorial order for new users (streak === 0):
  1. Welcome section
  2. Awards button (trophies)
  3. **Language selector** (NEW)
  4. Daily quote
  5. Juz grid
  6. Bottom navigation

### 4. Translation Keys
Added translation keys to all three supported languages:

#### English (`messages/en.json`)
```json
"switchLanguage": "Switch Interface Language",
"switchLanguageMsg": "Change the app interface language. Currently supports Arabic, English, and Russian. Your Quran translation is set separately in Profile settings."
```

#### Arabic (`messages/ar.json`)
```json
"switchLanguage": "تبديل لغة الواجهة",
"switchLanguageMsg": "قم بتغيير لغة واجهة التطبيق. يدعم حالياً العربية والإنجليزية والروسية. يتم تعيين ترجمة القرآن بشكل منفصل في إعدادات الملف الشخصي."
```

#### Russian (`messages/ru.json`)
```json
"switchLanguage": "Сменить язык интерфейса",
"switchLanguageMsg": "Измените язык интерфейса приложения. В настоящее время поддерживаются арабский, английский и русский. Перевод Корана устанавливается отдельно в настройках профиля."
```

## User Experience

### When Users Will See This Tutorial
- **New users** visiting the dashboard for the first time with no streak
- Users who **restart the tutorial** while having no streak
- The tutorial step appears after the awards button step and before the daily quote step

### What Users Will Learn
- How to change the interface language (Arabic, English, Russian)
- That the interface language is separate from the Quran translation preference
- Where to find the language selector (globe icon in the header)

### Tutorial Flow
1. User lands on dashboard
2. Tutorial automatically starts after 800ms delay
3. User sees welcome message
4. User sees awards button highlight
5. **User sees language selector highlight with explanation** (NEW)
6. User sees daily quote
7. User sees juz grid
8. User sees bottom navigation

## Technical Details

### Conditional Display
The language selector tutorial step is only shown when:
```typescript
if (currentStreak === 0) {
  // Include languageSelectorTutorialStep
}
```

This ensures that:
- New users get guidance on language switching
- Users with streaks see the original tutorial focusing on streak tracking
- The tutorial remains contextual and relevant

### Placement
- Tutorial tooltip appears **below** the language selector button
- Placement: `bottom`
- This ensures good visibility and doesn't overlap with other header elements

## Benefits

1. **Discoverability**: New users immediately learn about multi-language support
2. **Clarity**: Explains difference between interface language and Quran translation
3. **User-Friendly**: Appears at the right time for users who need it most
4. **Localized**: Tutorial text is translated into all three interface languages

## Testing Recommendations

To test this feature:
1. Create a new user account or reset tutorial for existing user
2. Ensure user has `currentStreak === 0`
3. Visit the dashboard
4. Tutorial should automatically start and include the language selector step
5. Click through tutorial steps to verify proper flow
6. Test in all three languages (EN, AR, RU) to verify translations

## Files Modified

1. `components/LanguageSelector.tsx` - Added data-tutorial attribute
2. `lib/tutorial-configs.ts` - Added language selector tutorial step
3. `app/dashboard/DashboardContent.tsx` - Integrated tutorial step for users with no streak
4. `messages/en.json` - Added English translations
5. `messages/ar.json` - Added Arabic translations
6. `messages/ru.json` - Added Russian translations

## No Breaking Changes

- Existing users with streaks will not see this tutorial step
- Existing tutorial functionality remains unchanged
- No impact on other features or components
- Backward compatible with existing tutorial system

