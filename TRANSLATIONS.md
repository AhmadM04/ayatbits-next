# Quran Translations

This document lists all available translations in the application and their mapping to Quran.com API resource IDs.

## Available Translations (18 total)

All translations are fetched from the Quran.com API v4: `https://api.quran.com/api/v4`

### English (3 translations)
- **en.sahih** → Resource ID: 20 - Saheeh International
- **en.pickthall** → Resource ID: 19 - Mohammed Marmaduke William Pickthall
- **en.yusufali** → Resource ID: 22 - Abdullah Yusuf Ali

### Arabic (2 tafsirs)
- **ar.jalalayn** → Resource ID: 20 - Fallback to Sahih International (Jalalayn not available in API)
- **ar.tafseer** → Resource ID: 20 - Fallback to Sahih International (Muyassar not available in API)

### European Languages (4 translations)
- **fr.hamidullah** → Resource ID: 31 - Muhammad Hamidullah (French)
- **es.cortes** → Resource ID: 83 - Sheikh Isa Garcia (Spanish)
- **de.bubenheim** → Resource ID: 27 - Frank Bubenheim and Nadeem (German)
- **nl.dutch** → Resource ID: 144 - Sofian S. Siregar (Dutch)
- **et.estonian** → Resource ID: 20 - Fallback to Sahih International (Estonian not available in API)

### Middle Eastern & Central Asian (2 translations)
- **tr.yazir** → Resource ID: 52 - Elmalili Hamdi Yazir (Turkish)
- **ru.kuliev** → Resource ID: 45 - Elmir Kuliev (Russian)
- **ur.maududi** → Resource ID: 97 - Syed Abu Ali Maududi (Urdu)

### South & Southeast Asian (4 translations)
- **id.muntakhab** → Resource ID: 134 - King Fahad Quran Complex (Indonesian)
- **ms.basmeih** → Resource ID: 39 - Abdullah Muhammad Basmeih (Malay)
- **bn.hoque** → Resource ID: 161 - Tawheed Publication (Bengali)
- **hi.hindi** → Resource ID: 122 - Maulana Azizul Haque al-Umari (Hindi)

### East Asian (2 translations)
- **zh.chinese** → Resource ID: 56 - Ma Jian (Chinese)
- **ja.japanese** → Resource ID: 35 - Ryoichi Mita (Japanese)

## Implementation Details

### Translation Adapter
The translation mapping is implemented in `lib/quran-api-adapter.ts` in the `TRANSLATION_MAP` constant.

### API Endpoint
Translations can be fetched via `/api/verse/translation?surah={surah}&ayah={ayah}&translation={code}`

Example:
```
/api/verse/translation?surah=2&ayah=255&translation=ru.kuliev
```

### UI Components
Translation selection is available in:
- Profile settings: `app/dashboard/profile/TranslationSelector.tsx`
- Verse display: `app/dashboard/juz/[number]/surah/[surahNumber]/TranslationDisplay.tsx`

### Fallback Behavior
If a translation code is not found in the map, the system automatically falls back to Sahih International (Resource ID: 20) and logs a warning to the console.

## Testing
All translations have been tested and verified to work correctly with the Quran.com API v4.

To sync or check available translations, use the endpoint:
```
/api/translations/sync
```

This endpoint fetches all available translations from Quran.com and maps them to the codes used in the UI.

## Notes
- Some translations (Arabic Jalalayn, Arabic Muyassar, Estonian) are not currently available in the Quran.com API and fall back to Sahih International
- The Quran.com API has 126+ translations available, but we've selected the most commonly used ones for each language
- Translation IDs may change if Quran.com updates their API; use the `/api/translations/sync` endpoint to check for updates

