/**
 * Seeds basic Juz (1-30) and Surah (1-114) data.
 * Run with: npm run db:seed
 */
import dotenv from 'dotenv';
// Load .env.local first (if present), then fallback to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

import { connectDB, Juz, Surah } from '../lib/db';

type SurahSeed = { number: number; nameEnglish: string; nameArabic: string };

const juzSeeds = Array.from({ length: 30 }, (_, i) => ({
  number: i + 1,
  name: `Juz ${i + 1}`,
}));

const surahSeeds: SurahSeed[] = [
  { number: 1, nameEnglish: 'Al-Fatihah', nameArabic: 'ٱلْفَاتِحَة' },
  { number: 2, nameEnglish: 'Al-Baqarah', nameArabic: 'ٱلْبَقَرَة' },
  { number: 3, nameEnglish: 'Ali Imran', nameArabic: 'آلِ عِمْرَان' },
  { number: 4, nameEnglish: 'An-Nisa', nameArabic: 'ٱلنِّسَاء' },
  { number: 5, nameEnglish: 'Al-Ma’idah', nameArabic: 'ٱلْمَائِدَة' },
  { number: 6, nameEnglish: 'Al-An’am', nameArabic: 'ٱلْأَنْعَام' },
  { number: 7, nameEnglish: "Al-A'raf", nameArabic: 'ٱلْأَعْرَاف' },
  { number: 8, nameEnglish: 'Al-Anfal', nameArabic: 'ٱلْأَنْفَال' },
  { number: 9, nameEnglish: 'At-Tawbah', nameArabic: 'ٱلتَّوْبَة' },
  { number: 10, nameEnglish: 'Yunus', nameArabic: 'يُونُس' },
  { number: 11, nameEnglish: 'Hud', nameArabic: 'هُود' },
  { number: 12, nameEnglish: 'Yusuf', nameArabic: 'يُوسُف' },
  { number: 13, nameEnglish: 'Ar-Ra’d', nameArabic: 'ٱلرَّعْد' },
  { number: 14, nameEnglish: 'Ibrahim', nameArabic: 'إِبْرَاهِيم' },
  { number: 15, nameEnglish: 'Al-Hijr', nameArabic: 'ٱلْحِجْر' },
  { number: 16, nameEnglish: 'An-Nahl', nameArabic: 'ٱلنَّحْل' },
  { number: 17, nameEnglish: 'Al-Isra', nameArabic: 'ٱلْإِسْرَاء' },
  { number: 18, nameEnglish: 'Al-Kahf', nameArabic: 'ٱلْكَهْف' },
  { number: 19, nameEnglish: 'Maryam', nameArabic: 'مَرْيَم' },
  { number: 20, nameEnglish: 'Ta-Ha', nameArabic: 'طه' },
  { number: 21, nameEnglish: 'Al-Anbiya', nameArabic: 'ٱلْأَنْبِيَاء' },
  { number: 22, nameEnglish: 'Al-Hajj', nameArabic: 'ٱلْحَجّ' },
  { number: 23, nameEnglish: 'Al-Mu’minun', nameArabic: 'ٱلْمُؤْمِنُون' },
  { number: 24, nameEnglish: 'An-Nur', nameArabic: 'ٱلنُّور' },
  { number: 25, nameEnglish: 'Al-Furqan', nameArabic: 'ٱلْفُرْقَان' },
  { number: 26, nameEnglish: 'Ash-Shu’ara', nameArabic: 'ٱلشُّعَرَاء' },
  { number: 27, nameEnglish: 'An-Naml', nameArabic: 'ٱلنَّمْل' },
  { number: 28, nameEnglish: 'Al-Qasas', nameArabic: 'ٱلْقَصَص' },
  { number: 29, nameEnglish: 'Al-Ankabut', nameArabic: 'ٱلْعَنْكَبُوت' },
  { number: 30, nameEnglish: 'Ar-Rum', nameArabic: 'ٱلرُّوم' },
  { number: 31, nameEnglish: 'Luqman', nameArabic: 'لُقْمَان' },
  { number: 32, nameEnglish: 'As-Sajdah', nameArabic: 'ٱلسَّجْدَة' },
  { number: 33, nameEnglish: 'Al-Ahzab', nameArabic: 'ٱلْأَحْزَاب' },
  { number: 34, nameEnglish: 'Saba', nameArabic: 'سَبَأ' },
  { number: 35, nameEnglish: 'Fatir', nameArabic: 'فَاطِر' },
  { number: 36, nameEnglish: 'Ya-Sin', nameArabic: 'يس' },
  { number: 37, nameEnglish: 'As-Saffat', nameArabic: 'ٱلصَّافَّات' },
  { number: 38, nameEnglish: 'Sad', nameArabic: 'ص' },
  { number: 39, nameEnglish: 'Az-Zumar', nameArabic: 'ٱلزُّمَر' },
  { number: 40, nameEnglish: 'Ghafir', nameArabic: 'غَافِر' },
  { number: 41, nameEnglish: 'Fussilat', nameArabic: 'فُصِّلَت' },
  { number: 42, nameEnglish: 'Ash-Shura', nameArabic: 'ٱلشُّورَى' },
  { number: 43, nameEnglish: 'Az-Zukhruf', nameArabic: 'ٱلزُّخْرُف' },
  { number: 44, nameEnglish: 'Ad-Dukhan', nameArabic: 'ٱلدُّخَان' },
  { number: 45, nameEnglish: 'Al-Jathiyah', nameArabic: 'ٱلْجَاثِيَة' },
  { number: 46, nameEnglish: 'Al-Ahqaf', nameArabic: 'ٱلْأَحْقَاف' },
  { number: 47, nameEnglish: 'Muhammad', nameArabic: 'مُحَمَّد' },
  { number: 48, nameEnglish: 'Al-Fath', nameArabic: 'ٱلْفَتْح' },
  { number: 49, nameEnglish: 'Al-Hujurat', nameArabic: 'ٱلْحُجُرَات' },
  { number: 50, nameEnglish: 'Qaf', nameArabic: 'ق' },
  { number: 51, nameEnglish: 'Adh-Dhariyat', nameArabic: 'ٱلذَّارِيَات' },
  { number: 52, nameEnglish: 'At-Tur', nameArabic: 'ٱلطُّور' },
  { number: 53, nameEnglish: 'An-Najm', nameArabic: 'ٱلنَّجْم' },
  { number: 54, nameEnglish: 'Al-Qamar', nameArabic: 'ٱلْقَمَر' },
  { number: 55, nameEnglish: 'Ar-Rahman', nameArabic: 'ٱلرَّحْمَٰن' },
  { number: 56, nameEnglish: 'Al-Waqi’ah', nameArabic: 'ٱلْوَاقِعَة' },
  { number: 57, nameEnglish: 'Al-Hadid', nameArabic: 'ٱلْحَدِيد' },
  { number: 58, nameEnglish: 'Al-Mujadila', nameArabic: 'ٱلْمُجَادِلَة' },
  { number: 59, nameEnglish: 'Al-Hashr', nameArabic: 'ٱلْحَشْر' },
  { number: 60, nameEnglish: 'Al-Mumtahanah', nameArabic: 'ٱلْمُمْتَحَنَة' },
  { number: 61, nameEnglish: 'As-Saff', nameArabic: 'ٱلصَّف' },
  { number: 62, nameEnglish: "Al-Jumu'ah", nameArabic: 'ٱلْجُمُعَة' },
  { number: 63, nameEnglish: 'Al-Munafiqun', nameArabic: 'ٱلْمُنَافِقُون' },
  { number: 64, nameEnglish: 'At-Taghabun', nameArabic: 'ٱلتَّغَابُن' },
  { number: 65, nameEnglish: 'At-Talaq', nameArabic: 'ٱلطَّلَاق' },
  { number: 66, nameEnglish: 'At-Tahrim', nameArabic: 'ٱلتَّحْرِيم' },
  { number: 67, nameEnglish: 'Al-Mulk', nameArabic: 'ٱلْمُلْك' },
  { number: 68, nameEnglish: 'Al-Qalam', nameArabic: 'ٱلْقَلَم' },
  { number: 69, nameEnglish: 'Al-Haqqah', nameArabic: 'ٱلْحَاقَّة' },
  { number: 70, nameEnglish: "Al-Ma'arij", nameArabic: 'ٱلْمَعَارِج' },
  { number: 71, nameEnglish: 'Nuh', nameArabic: 'نُوح' },
  { number: 72, nameEnglish: 'Al-Jinn', nameArabic: 'ٱلْجِنّ' },
  { number: 73, nameEnglish: 'Al-Muzzammil', nameArabic: 'ٱلْمُزَّمِّل' },
  { number: 74, nameEnglish: 'Al-Muddaththir', nameArabic: 'ٱلْمُدَّثِّر' },
  { number: 75, nameEnglish: 'Al-Qiyamah', nameArabic: 'ٱلْقِيَامَة' },
  { number: 76, nameEnglish: 'Al-Insan', nameArabic: 'ٱلْإِنسَان' },
  { number: 77, nameEnglish: 'Al-Mursalat', nameArabic: 'ٱلْمُرْسَلَات' },
  { number: 78, nameEnglish: 'An-Naba', nameArabic: 'ٱلنَّبَأ' },
  { number: 79, nameEnglish: 'An-Nazi’at', nameArabic: 'ٱلنَّازِعَات' },
  { number: 80, nameEnglish: 'Abasa', nameArabic: 'عَبَس' },
  { number: 81, nameEnglish: 'At-Takwir', nameArabic: 'ٱلتَّكْوِير' },
  { number: 82, nameEnglish: 'Al-Infitar', nameArabic: 'ٱلْإِنْفِطَار' },
  { number: 83, nameEnglish: 'Al-Mutaffifin', nameArabic: 'ٱلْمُطَفِّفِين' },
  { number: 84, nameEnglish: 'Al-Inshiqaq', nameArabic: 'ٱلْإِنْشِقَاق' },
  { number: 85, nameEnglish: 'Al-Buruj', nameArabic: 'ٱلْبُرُوج' },
  { number: 86, nameEnglish: 'At-Tariq', nameArabic: 'ٱلطَّارِق' },
  { number: 87, nameEnglish: "Al-A'la", nameArabic: 'ٱلْأَعْلَى' },
  { number: 88, nameEnglish: 'Al-Ghashiyah', nameArabic: 'ٱلْغَاشِيَة' },
  { number: 89, nameEnglish: 'Al-Fajr', nameArabic: 'ٱلْفَجْر' },
  { number: 90, nameEnglish: 'Al-Balad', nameArabic: 'ٱلْبَلَد' },
  { number: 91, nameEnglish: 'Ash-Shams', nameArabic: 'ٱلشَّمْس' },
  { number: 92, nameEnglish: 'Al-Layl', nameArabic: 'ٱلَّيْل' },
  { number: 93, nameEnglish: 'Ad-Duhaa', nameArabic: 'ٱلضُّحَى' },
  { number: 94, nameEnglish: 'Ash-Sharh', nameArabic: 'ٱلشَّرْح' },
  { number: 95, nameEnglish: 'At-Tin', nameArabic: 'ٱلتِّين' },
  { number: 96, nameEnglish: 'Al-Alaq', nameArabic: 'ٱلْعَلَق' },
  { number: 97, nameEnglish: 'Al-Qadr', nameArabic: 'ٱلْقَدْر' },
  { number: 98, nameEnglish: 'Al-Bayyinah', nameArabic: 'ٱلْبَيِّنَة' },
  { number: 99, nameEnglish: 'Az-Zalzalah', nameArabic: 'ٱلزَّلْزَلَة' },
  { number: 100, nameEnglish: "Al-'Adiyat", nameArabic: 'ٱلْعَادِيَات' },
  { number: 101, nameEnglish: "Al-Qari'ah", nameArabic: 'ٱلْقَارِعَة' },
  { number: 102, nameEnglish: 'At-Takathur', nameArabic: 'ٱلتَّكَاثُر' },
  { number: 103, nameEnglish: 'Al-Asr', nameArabic: 'ٱلْعَصْر' },
  { number: 104, nameEnglish: 'Al-Humazah', nameArabic: 'ٱلْهُمَزَة' },
  { number: 105, nameEnglish: 'Al-Fil', nameArabic: 'ٱلْفِيل' },
  { number: 106, nameEnglish: 'Quraysh', nameArabic: 'قُرَيْش' },
  { number: 107, nameEnglish: 'Al-Ma’un', nameArabic: 'ٱلْمَاعُون' },
  { number: 108, nameEnglish: 'Al-Kawthar', nameArabic: 'ٱلْكَوْثَر' },
  { number: 109, nameEnglish: 'Al-Kafirun', nameArabic: 'ٱلْكَافِرُون' },
  { number: 110, nameEnglish: 'An-Nasr', nameArabic: 'ٱلنَّصْر' },
  { number: 111, nameEnglish: 'Al-Masad', nameArabic: 'ٱلْمَسَد' },
  { number: 112, nameEnglish: 'Al-Ikhlas', nameArabic: 'ٱلْإِخْلَاص' },
  { number: 113, nameEnglish: 'Al-Falaq', nameArabic: 'ٱلْفَلَق' },
  { number: 114, nameEnglish: 'An-Nas', nameArabic: 'ٱلنَّاس' },
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await connectDB();
  console.log('Connected. Seeding...');

  // Upsert Juz
  for (const j of juzSeeds) {
    await Juz.findOneAndUpdate(
      { number: j.number },
      { $set: j },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  // Upsert Surahs
  for (const s of surahSeeds) {
    await Surah.findOneAndUpdate(
      { number: s.number },
      { $set: s },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }

  const juzCount = await Juz.countDocuments();
  const surahCount = await Surah.countDocuments();
  console.log(`Seeded ${juzSeeds.length} juz and ${surahSeeds.length} surahs`);
  console.log(`Current counts -> Juz: ${juzCount}, Surahs: ${surahCount}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});



