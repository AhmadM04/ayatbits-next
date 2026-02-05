const fs = require('fs');
const path = require('path');

// Read English translations as the base
const enJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'messages', 'en.json'), 'utf8'));

// Get the list of required sections and keys
const requiredSections = {
  tutorial: enJson.tutorial,
  wordPuzzle: enJson.wordPuzzle,
  mushaf: enJson.mushaf,
  juz: enJson.juz,
  dailyQuote: enJson.dailyQuote,
  transliteration: enJson.transliteration,
  harakat: enJson.harakat
};

// Additional keys to add to existing sections
const additionalKeys = {
  common: {
    ayahs: enJson.common.ayahs,
    page: enJson.common.page,
    of: enJson.common.of,
    retry: enJson.common.retry,
    listen: enJson.common.listen,
    gotIt: enJson.common.gotIt,
    playing: enJson.common.playing
  },
  search: {
    searchVerse: enJson.search.searchVerse
  },
  dashboard: {
    restartTutorial: enJson.dashboard.restartTutorial,
    returnToDashboard: enJson.dashboard.returnToDashboard
  },
  profile: {
    myProfile: enJson.profile.myProfile,
    userProfile: enJson.profile.userProfile,
    surahsCompleted: enJson.profile.surahsCompleted,
    puzzlesSolved: enJson.profile.puzzlesSolved,
    daysLeft: enJson.profile.daysLeft,
    admin: enJson.profile.admin,
    lifetime: enJson.profile.lifetime,
    monthly: enJson.profile.monthly
  },
  puzzle: {
    mashallah: enJson.puzzle.mashallah,
    youCompleted: enJson.puzzle.youCompleted,
    achievementsUnlocked: enJson.puzzle.achievementsUnlocked,
    continueTo: enJson.puzzle.continueTo
  },
  onboarding: {
    completeProfile: enJson.onboarding.completeProfile,
    completeProfileDescription: enJson.onboarding.completeProfileDescription
  }
};

// Languages to update (excluding en, ar, ru which are already done)
const languages = ['bn', 'de', 'es', 'fr', 'hi', 'id', 'ja', 'ms', 'nl', 'tr', 'ur', 'zh'];

let totalUpdated = 0;

languages.forEach(lang => {
  const filePath = path.join(__dirname, 'messages', `${lang}.json`);
  
  try {
    const langJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Add new sections
    Object.keys(requiredSections).forEach(section => {
      if (!langJson[section]) {
        langJson[section] = {};
      }
      Object.assign(langJson[section], requiredSections[section]);
    });
    
    // Add additional keys to existing sections
    Object.keys(additionalKeys).forEach(section => {
      if (!langJson[section]) {
        langJson[section] = {};
      }
      Object.assign(langJson[section], additionalKeys[section]);
    });
    
    // Write back
    fs.writeFileSync(filePath, JSON.stringify(langJson, null, 2), 'utf8');
    console.log(`✅ Updated ${lang}.json`);
    totalUpdated++;
  } catch (error) {
    console.error(`❌ Failed to update ${lang}.json:`, error.message);
  }
});

console.log(`\n🎉 Successfully updated ${totalUpdated}/${languages.length} language files!`);
console.log('\n📝 Note: These files now have English text as placeholders.');
console.log('   Translations should be provided by native speakers or translation services.');

