import connectDB from '../lib/mongodb';
import { Juz, Surah, Puzzle, PuzzleType } from '../lib/db';
import {
  fetchAllSurahs,
  getAyahsForSurah,
  sliceAyahsIntoPuzzles,
  type Surah as ApiSurah,
} from '../lib/quran-api';
import { QURAN_CONFIG } from '../lib/quran-config';
import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('📡 Fetching data from Quran API...');

  // Connect to MongoDB
  await connectDB();

  // Fetch all surahs from API
  let apiSurahs: ApiSurah[];
  try {
    console.log('⏳ Fetching surahs from API (this may take a moment)...');
    apiSurahs = await fetchAllSurahs();
    console.log(`✅ Fetched ${apiSurahs.length} surahs from API`);
  } catch (error) {
    console.error('❌ Failed to fetch surahs from API:', error);
    console.error('💡 Make sure you have an internet connection and the API is accessible');
    throw error;
  }

  // Create Juzs (1-30)
  console.log('📚 Creating Juzs...');
  const juzs = [];
  for (let i = 1; i <= 30; i++) {
    const juz = await Juz.findOneAndUpdate(
      { number: i },
      {
        number: i,
        name: `Juz ${i}`,
      },
      {
        upsert: true,
        new: true,
      }
    );
    juzs.push(juz);
  }
  console.log(`✅ Created ${juzs.length} Juzs`);

  // Create all Surahs from API data
  console.log('📖 Creating Surahs from API...');
  const createdSurahs = [];
  const surahJuzMap = new Map<number, number>(); // Map surah number to primary juz

  for (const apiSurah of apiSurahs) {
    // Determine primary juz for this surah (first juz it appears in)
    let primaryJuz: number | undefined;
    if (apiSurah.ayahs.length > 0) {
      primaryJuz = apiSurah.ayahs[0].juz;
    }

    const juz = primaryJuz ? juzs.find(j => j.number === primaryJuz) : undefined;
    
    const created = await Surah.findOneAndUpdate(
      { number: apiSurah.number },
      {
        number: apiSurah.number,
        nameEnglish: apiSurah.englishName,
        nameArabic: apiSurah.name,
        juzId: juz?._id,
      },
      {
        upsert: true,
        new: true,
      }
    );
    createdSurahs.push(created);
    if (primaryJuz) {
      surahJuzMap.set(apiSurah.number, primaryJuz);
    }
  }
  console.log(`✅ Created ${createdSurahs.length} Surahs`);

  // Create puzzles from ayahs using the same slicing logic as Expo
  console.log('🧩 Creating puzzles from ayahs...');
  let totalPuzzles = 0;

  for (const apiSurah of apiSurahs) {
    const surah = createdSurahs.find(s => s.number === apiSurah.number);
    if (!surah) continue;

    // Get ayah texts for this surah
    const ayahTexts = getAyahsForSurah(apiSurah);
    
    // Slice ayahs into puzzles (matching Expo project logic)
    const puzzleTexts = sliceAyahsIntoPuzzles(
      ayahTexts,
      QURAN_CONFIG.AYAH_CHUNK_SIZE,
      QURAN_CONFIG.AYAH_OVERLAP
    );

    // Create puzzles for each chunk
    for (let i = 0; i < puzzleTexts.length; i++) {
      const puzzleText = puzzleTexts[i];
      const ayahNumber = i + 1; // 1-indexed ayah number
      
      // Determine juz for this specific ayah
      const ayah = apiSurah.ayahs[i];
      const ayahJuz = ayah?.juz || surahJuzMap.get(apiSurah.number);
      const juz = ayahJuz ? juzs.find(j => j.number === ayahJuz) : undefined;

      // Determine difficulty based on ayah length
      let difficulty = 'medium';
      const wordCount = puzzleText.split(/\s+/).length;
      if (wordCount <= 5) {
        difficulty = 'easy';
      } else if (wordCount >= 15) {
        difficulty = 'hard';
      }

      await Puzzle.findOneAndUpdate(
        {
          'content.surahNumber': apiSurah.number,
          'content.ayahNumber': ayahNumber,
        },
        {
          type: PuzzleType.ORDERING,
          content: {
            ayahText: puzzleText,
            surahNumber: apiSurah.number,
            ayahNumber: ayahNumber,
            numberOfAyahs: QURAN_CONFIG.AYAH_CHUNK_SIZE,
          },
          difficulty,
          surahId: surah._id,
          juzId: juz?._id,
        },
        {
          upsert: true,
          new: true,
        }
      );

      totalPuzzles++;
    }

    // Log progress every 10 surahs
    if (apiSurah.number % 10 === 0) {
      console.log(`  Processed ${apiSurah.number}/114 surahs (${totalPuzzles} puzzles created so far)...`);
    }
  }

  console.log(`✅ Created ${totalPuzzles} puzzles`);
  console.log('✅ Database seeded successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - ${juzs.length} Juzs`);
  console.log(`   - ${createdSurahs.length} Surahs`);
  console.log(`   - ${totalPuzzles} Puzzles`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.connection.close();
  });

