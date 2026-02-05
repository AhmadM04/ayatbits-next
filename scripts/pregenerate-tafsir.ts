/**
 * Pre-generate AI Tafsir for all ayahs in priority languages
 * This script generates tafsir using Gemini 2.0 Flash and caches them in the database
 * for instant loading when users request them.
 * 
 * Run with: npx tsx -r dotenv/config scripts/pregenerate-tafsir.ts
 */

import connectDB from '../lib/mongodb';
import { GoogleGenAI } from '@google/genai';
import { saveTafsir, getCacheStats } from '../lib/tafsir-cache';
import { fetchTafsir } from '../lib/tafsir-api';

// Quran structure: [surah number, total ayahs in that surah]
const QURAN_STRUCTURE = [
  [1, 7], [2, 286], [3, 200], [4, 176], [5, 120], [6, 165], [7, 206], [8, 75], [9, 129], [10, 109],
  [11, 123], [12, 111], [13, 43], [14, 52], [15, 99], [16, 128], [17, 111], [18, 110], [19, 98], [20, 135],
  [21, 112], [22, 78], [23, 118], [24, 64], [25, 77], [26, 227], [27, 93], [28, 88], [29, 69], [30, 60],
  [31, 34], [32, 30], [33, 73], [34, 54], [35, 45], [36, 83], [37, 182], [38, 88], [39, 75], [40, 85],
  [41, 54], [42, 53], [43, 89], [44, 59], [45, 37], [46, 35], [47, 38], [48, 29], [49, 18], [50, 45],
  [51, 60], [52, 49], [53, 62], [54, 55], [55, 78], [56, 96], [57, 29], [58, 22], [59, 24], [60, 13],
  [61, 14], [62, 11], [63, 11], [64, 18], [65, 12], [66, 12], [67, 30], [68, 52], [69, 52], [70, 44],
  [71, 28], [72, 28], [73, 20], [74, 56], [75, 40], [76, 31], [77, 50], [78, 40], [79, 46], [80, 42],
  [81, 29], [82, 19], [83, 36], [84, 25], [85, 22], [86, 17], [87, 19], [88, 26], [89, 30], [90, 20],
  [91, 15], [92, 21], [93, 11], [94, 8], [95, 8], [96, 19], [97, 5], [98, 8], [99, 8], [100, 11],
  [101, 11], [102, 8], [103, 3], [104, 9], [105, 5], [106, 4], [107, 7], [108, 3], [109, 6], [110, 3],
  [111, 5], [112, 4], [113, 5], [114, 6],
];

// Priority languages to pre-generate (in order of priority)
const PRIORITY_LANGUAGES = ['en', 'ar', 'ru', 'tr', 'ur', 'id', 'ms', 'bn', 'hi', 'fr'];

// Language names for prompts
const LANGUAGE_NAMES: Record<string, string> = {
  'en': 'English',
  'ar': 'Arabic',
  'ru': 'Russian',
  'tr': 'Turkish',
  'ur': 'Urdu',
  'id': 'Indonesian',
  'ms': 'Malay',
  'bn': 'Bengali',
  'hi': 'Hindi',
  'fr': 'French',
};

const ai = process.env.GEMINI_API_KEY 
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// Progress tracking
let totalGenerated = 0;
let totalSkipped = 0;
let totalErrors = 0;
let startTime = Date.now();

async function generateTafsirForAyah(
  surahNumber: number,
  ayahNumber: number,
  language: string
): Promise<boolean> {
  try {
    const languageName = LANGUAGE_NAMES[language] || 'English';

    // Fetch Arabic Ibn Kathir tafsir
    let arabicTafsir = '';
    try {
      const tafsirResponse = await fetchTafsir(
        surahNumber,
        ayahNumber,
        'ar',
        'ibn_kathir',
        { next: { revalidate: 86400 } }
      );
      
      if (tafsirResponse?.data?.text) {
        arabicTafsir = tafsirResponse.data.text;
      }
    } catch (error) {
      console.error(`  ⚠️  Could not fetch Arabic tafsir for ${surahNumber}:${ayahNumber}`);
    }

    // Build prompt
    const systemPrompt = `You are a professional translator specializing in Islamic scholarly texts. Your role is STRICTLY limited to:
1. Translating Tafsir Ibn Kathir (Quranic exegesis) from Arabic to other languages
2. Maintaining scholarly accuracy and Islamic terminology
3. Preserving the original meaning and context

Your translations should be:
- Accurate and faithful to the original Arabic text
- Clear and readable in the target language
- Respectful of Islamic terminology
- Concise while preserving all key information
- Scholarly yet accessible`;

    let userPrompt = '';
    if (arabicTafsir) {
      userPrompt = `Translate the following Tafsir Ibn Kathir for Quran ${surahNumber}:${ayahNumber} from Arabic to ${languageName}.

Arabic Tafsir Ibn Kathir (Muhtasar):
${arabicTafsir}

Please translate this tafsir to ${languageName}, maintaining:
1. All scholarly references and citations
2. Proper Islamic terminology
3. The concise, clear style of the original
4. Respectful language for Prophet Muhammad (peace be upon him) and other prophets

Provide ONLY the translation, without adding commentary.`;
    } else {
      userPrompt = `Provide a brief Tafsir Ibn Kathir style explanation in ${languageName} for Quran ${surahNumber}:${ayahNumber}

Based on Ibn Kathir's methodology, provide a concise tafsir covering:
1. Context of revelation (if significant)
2. Key meanings from classical scholars
3. Main lessons and applications

Keep it brief (2-3 paragraphs), scholarly, and in clear ${languageName}.`;
    }

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // Generate with AI
    const response = await ai!.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    const tafsirText = response.text || '';
    if (!tafsirText) {
      throw new Error('Empty response from AI');
    }

    // Save to cache
    const sourceText = arabicTafsir 
      ? `Tafsir Ibn Kathir (AI Translated to ${languageName})`
      : `AI-Generated Tafsir (${languageName})`;

    await saveTafsir(
      surahNumber,
      ayahNumber,
      language,
      tafsirText,
      sourceText,
      'gemini-2.5-flash'
    );

    totalGenerated++;
    return true;
  } catch (error: any) {
    console.error(`  ❌ Error generating ${surahNumber}:${ayahNumber} (${language}):`, error.message);
    totalErrors++;
    return false;
  }
}

async function pregenerateAll() {
  console.log('='.repeat(70));
  console.log('🚀 Starting Tafsir Pre-generation');
  console.log('='.repeat(70));
  console.log(`Languages: ${PRIORITY_LANGUAGES.join(', ')}`);
  console.log(`Total ayahs: 6,236`);
  console.log(`Total generations planned: ${6236 * PRIORITY_LANGUAGES.length}`);
  console.log('='.repeat(70));
  console.log('');

  if (!ai) {
    console.error('❌ GEMINI_API_KEY not configured!');
    process.exit(1);
  }

  await connectDB();
  console.log('✅ Connected to MongoDB\n');

  // Process each language
  for (const language of PRIORITY_LANGUAGES) {
    console.log(`\n📖 Processing language: ${LANGUAGE_NAMES[language]} (${language})`);
    console.log('-'.repeat(70));

    // Check current cache stats
    const stats = await getCacheStats(language);
    console.log(`   Already cached: ${stats?.totalCached || 0} tafsirs\n`);

    let langGenerated = 0;
    let langSkipped = 0;

    // Process each surah
    for (const [surahNumber, totalAyahs] of QURAN_STRUCTURE) {
      process.stdout.write(`   Surah ${surahNumber.toString().padStart(3)} (${totalAyahs.toString().padStart(3)} ayahs): `);

      for (let ayahNumber = 1; ayahNumber <= totalAyahs; ayahNumber++) {
        // Check if already cached
        const { getCachedTafsir } = await import('../lib/tafsir-cache');
        const cached = await getCachedTafsir(surahNumber, ayahNumber, language);
        
        if (cached) {
          totalSkipped++;
          langSkipped++;
          continue;
        }

        // Generate and save
        await generateTafsirForAyah(surahNumber, ayahNumber, language);
        langGenerated++;

        // Rate limiting: small delay to avoid API throttling
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      process.stdout.write(`✓ (${langGenerated} new, ${langSkipped} cached)\n`);
    }

    console.log(`\n   Language complete: ${langGenerated} generated, ${langSkipped} skipped`);

    // Show progress
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = totalGenerated / elapsed;
    const remaining = (6236 * PRIORITY_LANGUAGES.length) - (totalGenerated + totalSkipped);
    const estimatedRemaining = remaining / rate / 60;

    console.log(`\n   Progress: ${totalGenerated + totalSkipped} / ${6236 * PRIORITY_LANGUAGES.length}`);
    console.log(`   Rate: ${rate.toFixed(1)} generations/sec`);
    console.log(`   Estimated time remaining: ${estimatedRemaining.toFixed(0)} minutes`);
  }

  // Final summary
  console.log('\n' + '='.repeat(70));
  console.log('✨ Pre-generation Complete!');
  console.log('='.repeat(70));
  console.log(`✅ Generated: ${totalGenerated}`);
  console.log(`⏭️  Skipped (cached): ${totalSkipped}`);
  console.log(`❌ Errors: ${totalErrors}`);
  console.log(`⏱️  Total time: ${((Date.now() - startTime) / 1000 / 60).toFixed(1)} minutes`);
  console.log('='.repeat(70));
}

// Run the script
pregenerateAll()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

