/**
 * Complete list of all 114 Surahs with Arabic names, transliteration, and search tokens
 * Optimized for multi-language search (Arabic, Transliteration, Surah Number)
 */

export interface SurahData {
  id: number;
  transliteration: string;
  arabic: string;
  /**
   * Search tokens for matching queries:
   * - Transliteration variants (with/without hyphen, with/without prefix)
   * - Arabic with and without Tashkeel
   */
  tokens: string[];
}

export const SURAHS: SurahData[] = [
  {
    id: 1,
    transliteration: "Al-Fatiha",
    arabic: "الفاتحة",
    tokens: ["al-fatiha", "alfatiha", "fatiha", "الفاتحة", "فاتحة"]
  },
  {
    id: 2,
    transliteration: "Al-Baqarah",
    arabic: "البقرة",
    tokens: ["al-baqarah", "albaqarah", "baqarah", "البقرة", "بقرة"]
  },
  {
    id: 3,
    transliteration: "Ali 'Imran",
    arabic: "آل عمران",
    tokens: ["ali-imran", "aliimran", "ali", "imran", "آل عمران", "ال عمران", "عمران"]
  },
  {
    id: 4,
    transliteration: "An-Nisa",
    arabic: "النساء",
    tokens: ["an-nisa", "annisa", "nisa", "النساء", "نساء"]
  },
  {
    id: 5,
    transliteration: "Al-Ma'idah",
    arabic: "المائدة",
    tokens: ["al-maidah", "almaidah", "maidah", "المائدة", "مائدة", "المايدة"]
  },
  {
    id: 6,
    transliteration: "Al-An'am",
    arabic: "الأنعام",
    tokens: ["al-anam", "alanam", "anam", "الأنعام", "الانعام", "انعام"]
  },
  {
    id: 7,
    transliteration: "Al-A'raf",
    arabic: "الأعراف",
    tokens: ["al-araf", "alaraf", "araf", "الأعراف", "الاعراف", "اعراف"]
  },
  {
    id: 8,
    transliteration: "Al-Anfal",
    arabic: "الأنفال",
    tokens: ["al-anfal", "alanfal", "anfal", "الأنفال", "الانفال", "انفال"]
  },
  {
    id: 9,
    transliteration: "At-Tawbah",
    arabic: "التوبة",
    tokens: ["at-tawbah", "attawbah", "tawbah", "التوبة", "توبة", "bara'ah", "براءة"]
  },
  {
    id: 10,
    transliteration: "Yunus",
    arabic: "يونس",
    tokens: ["yunus", "يونس"]
  },
  {
    id: 11,
    transliteration: "Hud",
    arabic: "هود",
    tokens: ["hud", "هود"]
  },
  {
    id: 12,
    transliteration: "Yusuf",
    arabic: "يوسف",
    tokens: ["yusuf", "يوسف"]
  },
  {
    id: 13,
    transliteration: "Ar-Ra'd",
    arabic: "الرعد",
    tokens: ["ar-rad", "arrad", "rad", "raad", "الرعد", "رعد"]
  },
  {
    id: 14,
    transliteration: "Ibrahim",
    arabic: "ابراهيم",
    tokens: ["ibrahim", "ابراهيم", "إبراهيم"]
  },
  {
    id: 15,
    transliteration: "Al-Hijr",
    arabic: "الحجر",
    tokens: ["al-hijr", "alhijr", "hijr", "الحجر", "حجر"]
  },
  {
    id: 16,
    transliteration: "An-Nahl",
    arabic: "النحل",
    tokens: ["an-nahl", "annahl", "nahl", "النحل", "نحل"]
  },
  {
    id: 17,
    transliteration: "Al-Isra",
    arabic: "الإسراء",
    tokens: ["al-isra", "alisra", "isra", "الإسراء", "الاسراء", "اسراء", "bani-israel", "بني اسرائيل"]
  },
  {
    id: 18,
    transliteration: "Al-Kahf",
    arabic: "الكهف",
    tokens: ["al-kahf", "alkahf", "kahf", "الكهف", "كهف"]
  },
  {
    id: 19,
    transliteration: "Maryam",
    arabic: "مريم",
    tokens: ["maryam", "مريم"]
  },
  {
    id: 20,
    transliteration: "Ta-Ha",
    arabic: "طه",
    tokens: ["ta-ha", "taha", "طه"]
  },
  {
    id: 21,
    transliteration: "Al-Anbiya",
    arabic: "الأنبياء",
    tokens: ["al-anbiya", "alanbiya", "anbiya", "الأنبياء", "الانبياء", "انبياء"]
  },
  {
    id: 22,
    transliteration: "Al-Hajj",
    arabic: "الحج",
    tokens: ["al-hajj", "alhajj", "hajj", "الحج", "حج"]
  },
  {
    id: 23,
    transliteration: "Al-Mu'minun",
    arabic: "المؤمنون",
    tokens: ["al-muminun", "almuminun", "muminun", "المؤمنون", "المومنون", "مؤمنون"]
  },
  {
    id: 24,
    transliteration: "An-Nur",
    arabic: "النور",
    tokens: ["an-nur", "annur", "nur", "noor", "النور", "نور"]
  },
  {
    id: 25,
    transliteration: "Al-Furqan",
    arabic: "الفرقان",
    tokens: ["al-furqan", "alfurqan", "furqan", "الفرقان", "فرقان"]
  },
  {
    id: 26,
    transliteration: "Ash-Shu'ara",
    arabic: "الشعراء",
    tokens: ["ash-shuara", "ashshuara", "shuara", "الشعراء", "شعراء"]
  },
  {
    id: 27,
    transliteration: "An-Naml",
    arabic: "النمل",
    tokens: ["an-naml", "annaml", "naml", "النمل", "نمل"]
  },
  {
    id: 28,
    transliteration: "Al-Qasas",
    arabic: "القصص",
    tokens: ["al-qasas", "alqasas", "qasas", "القصص", "قصص"]
  },
  {
    id: 29,
    transliteration: "Al-'Ankabut",
    arabic: "العنكبوت",
    tokens: ["al-ankabut", "alankabut", "ankabut", "العنكبوت", "عنكبوت"]
  },
  {
    id: 30,
    transliteration: "Ar-Rum",
    arabic: "الروم",
    tokens: ["ar-rum", "arrum", "rum", "الروم", "روم"]
  },
  {
    id: 31,
    transliteration: "Luqman",
    arabic: "لقمان",
    tokens: ["luqman", "lukman", "لقمان"]
  },
  {
    id: 32,
    transliteration: "As-Sajdah",
    arabic: "السجدة",
    tokens: ["as-sajdah", "assajdah", "sajdah", "sajda", "السجدة", "سجدة"]
  },
  {
    id: 33,
    transliteration: "Al-Ahzab",
    arabic: "الأحزاب",
    tokens: ["al-ahzab", "alahzab", "ahzab", "الأحزاب", "الاحزاب", "احزاب"]
  },
  {
    id: 34,
    transliteration: "Saba",
    arabic: "سبأ",
    tokens: ["saba", "sheba", "سبأ", "سبا"]
  },
  {
    id: 35,
    transliteration: "Fatir",
    arabic: "فاطر",
    tokens: ["fatir", "فاطر"]
  },
  {
    id: 36,
    transliteration: "Ya-Sin",
    arabic: "يس",
    tokens: ["ya-sin", "yasin", "yaseen", "يس"]
  },
  {
    id: 37,
    transliteration: "As-Saffat",
    arabic: "الصافات",
    tokens: ["as-saffat", "assaffat", "saffat", "الصافات", "صافات"]
  },
  {
    id: 38,
    transliteration: "Sad",
    arabic: "ص",
    tokens: ["sad", "saad", "ص"]
  },
  {
    id: 39,
    transliteration: "Az-Zumar",
    arabic: "الزمر",
    tokens: ["az-zumar", "azzumar", "zumar", "الزمر", "زمر"]
  },
  {
    id: 40,
    transliteration: "Ghafir",
    arabic: "غافر",
    tokens: ["ghafir", "gafir", "غافر", "al-mumin", "المؤمن"]
  },
  {
    id: 41,
    transliteration: "Fussilat",
    arabic: "فصلت",
    tokens: ["fussilat", "fusilat", "فصلت", "ha-mim", "حم"]
  },
  {
    id: 42,
    transliteration: "Ash-Shura",
    arabic: "الشورى",
    tokens: ["ash-shura", "ashshura", "shura", "الشورى", "شورى"]
  },
  {
    id: 43,
    transliteration: "Az-Zukhruf",
    arabic: "الزخرف",
    tokens: ["az-zukhruf", "azzukhruf", "zukhruf", "الزخرف", "زخرف"]
  },
  {
    id: 44,
    transliteration: "Ad-Dukhan",
    arabic: "الدخان",
    tokens: ["ad-dukhan", "addukhan", "dukhan", "الدخان", "دخان"]
  },
  {
    id: 45,
    transliteration: "Al-Jathiyah",
    arabic: "الجاثية",
    tokens: ["al-jathiyah", "aljathiyah", "jathiyah", "الجاثية", "جاثية"]
  },
  {
    id: 46,
    transliteration: "Al-Ahqaf",
    arabic: "الأحقاف",
    tokens: ["al-ahqaf", "alahqaf", "ahqaf", "الأحقاف", "الاحقاف", "احقاف"]
  },
  {
    id: 47,
    transliteration: "Muhammad",
    arabic: "محمد",
    tokens: ["muhammad", "محمد"]
  },
  {
    id: 48,
    transliteration: "Al-Fath",
    arabic: "الفتح",
    tokens: ["al-fath", "alfath", "fath", "الفتح", "فتح"]
  },
  {
    id: 49,
    transliteration: "Al-Hujurat",
    arabic: "الحجرات",
    tokens: ["al-hujurat", "alhujurat", "hujurat", "الحجرات", "حجرات"]
  },
  {
    id: 50,
    transliteration: "Qaf",
    arabic: "ق",
    tokens: ["qaf", "qaaf", "ق"]
  },
  {
    id: 51,
    transliteration: "Adh-Dhariyat",
    arabic: "الذاريات",
    tokens: ["adh-dhariyat", "addhariyat", "dhariyat", "الذاريات", "ذاريات"]
  },
  {
    id: 52,
    transliteration: "At-Tur",
    arabic: "الطور",
    tokens: ["at-tur", "attur", "tur", "الطور", "طور"]
  },
  {
    id: 53,
    transliteration: "An-Najm",
    arabic: "النجم",
    tokens: ["an-najm", "annajm", "najm", "النجم", "نجم"]
  },
  {
    id: 54,
    transliteration: "Al-Qamar",
    arabic: "القمر",
    tokens: ["al-qamar", "alqamar", "qamar", "القمر", "قمر"]
  },
  {
    id: 55,
    transliteration: "Ar-Rahman",
    arabic: "الرحمن",
    tokens: ["ar-rahman", "arrahman", "rahman", "الرحمن", "رحمن"]
  },
  {
    id: 56,
    transliteration: "Al-Waqi'ah",
    arabic: "الواقعة",
    tokens: ["al-waqiah", "alwaqiah", "waqiah", "الواقعة", "واقعة"]
  },
  {
    id: 57,
    transliteration: "Al-Hadid",
    arabic: "الحديد",
    tokens: ["al-hadid", "alhadid", "hadid", "الحديد", "حديد"]
  },
  {
    id: 58,
    transliteration: "Al-Mujadilah",
    arabic: "المجادلة",
    tokens: ["al-mujadilah", "almujadilah", "mujadilah", "المجادلة", "مجادلة"]
  },
  {
    id: 59,
    transliteration: "Al-Hashr",
    arabic: "الحشر",
    tokens: ["al-hashr", "alhashr", "hashr", "الحشر", "حشر"]
  },
  {
    id: 60,
    transliteration: "Al-Mumtahanah",
    arabic: "الممتحنة",
    tokens: ["al-mumtahanah", "almumtahanah", "mumtahanah", "الممتحنة", "ممتحنة"]
  },
  {
    id: 61,
    transliteration: "As-Saff",
    arabic: "الصف",
    tokens: ["as-saff", "assaff", "saff", "الصف", "صف"]
  },
  {
    id: 62,
    transliteration: "Al-Jumu'ah",
    arabic: "الجمعة",
    tokens: ["al-jumuah", "aljumuah", "jumuah", "jumah", "الجمعة", "جمعة"]
  },
  {
    id: 63,
    transliteration: "Al-Munafiqun",
    arabic: "المنافقون",
    tokens: ["al-munafiqun", "almunafiqun", "munafiqun", "المنافقون", "منافقون"]
  },
  {
    id: 64,
    transliteration: "At-Taghabun",
    arabic: "التغابن",
    tokens: ["at-taghabun", "attaghabun", "taghabun", "التغابن", "تغابن"]
  },
  {
    id: 65,
    transliteration: "At-Talaq",
    arabic: "الطلاق",
    tokens: ["at-talaq", "attalaq", "talaq", "الطلاق", "طلاق"]
  },
  {
    id: 66,
    transliteration: "At-Tahrim",
    arabic: "التحريم",
    tokens: ["at-tahrim", "attahrim", "tahrim", "التحريم", "تحريم"]
  },
  {
    id: 67,
    transliteration: "Al-Mulk",
    arabic: "الملك",
    tokens: ["al-mulk", "almulk", "mulk", "الملك", "ملك"]
  },
  {
    id: 68,
    transliteration: "Al-Qalam",
    arabic: "القلم",
    tokens: ["al-qalam", "alqalam", "qalam", "القلم", "قلم", "nun", "ن"]
  },
  {
    id: 69,
    transliteration: "Al-Haqqah",
    arabic: "الحاقة",
    tokens: ["al-haqqah", "alhaqqah", "haqqah", "الحاقة", "حاقة"]
  },
  {
    id: 70,
    transliteration: "Al-Ma'arij",
    arabic: "المعارج",
    tokens: ["al-maarij", "almaarij", "maarij", "المعارج", "معارج"]
  },
  {
    id: 71,
    transliteration: "Nuh",
    arabic: "نوح",
    tokens: ["nuh", "noah", "نوح"]
  },
  {
    id: 72,
    transliteration: "Al-Jinn",
    arabic: "الجن",
    tokens: ["al-jinn", "aljinn", "jinn", "الجن", "جن"]
  },
  {
    id: 73,
    transliteration: "Al-Muzzammil",
    arabic: "المزمل",
    tokens: ["al-muzzammil", "almuzzammil", "muzzammil", "المزمل", "مزمل"]
  },
  {
    id: 74,
    transliteration: "Al-Muddaththir",
    arabic: "المدثر",
    tokens: ["al-muddaththir", "almuddaththir", "muddaththir", "المدثر", "مدثر"]
  },
  {
    id: 75,
    transliteration: "Al-Qiyamah",
    arabic: "القيامة",
    tokens: ["al-qiyamah", "alqiyamah", "qiyamah", "القيامة", "قيامة"]
  },
  {
    id: 76,
    transliteration: "Al-Insan",
    arabic: "الإنسان",
    tokens: ["al-insan", "alinsan", "insan", "الإنسان", "الانسان", "انسان", "dahr", "الدهر"]
  },
  {
    id: 77,
    transliteration: "Al-Mursalat",
    arabic: "المرسلات",
    tokens: ["al-mursalat", "almursalat", "mursalat", "المرسلات", "مرسلات"]
  },
  {
    id: 78,
    transliteration: "An-Naba",
    arabic: "النبأ",
    tokens: ["an-naba", "annaba", "naba", "النبأ", "النبا", "نبأ"]
  },
  {
    id: 79,
    transliteration: "An-Nazi'at",
    arabic: "النازعات",
    tokens: ["an-naziat", "annaziat", "naziat", "النازعات", "نازعات"]
  },
  {
    id: 80,
    transliteration: "'Abasa",
    arabic: "عبس",
    tokens: ["abasa", "عبس"]
  },
  {
    id: 81,
    transliteration: "At-Takwir",
    arabic: "التكوير",
    tokens: ["at-takwir", "attakwir", "takwir", "التكوير", "تكوير"]
  },
  {
    id: 82,
    transliteration: "Al-Infitar",
    arabic: "الإنفطار",
    tokens: ["al-infitar", "alinfitar", "infitar", "الإنفطار", "الانفطار", "انفطار"]
  },
  {
    id: 83,
    transliteration: "Al-Mutaffifin",
    arabic: "المطففين",
    tokens: ["al-mutaffifin", "almutaffifin", "mutaffifin", "المطففين", "مطففين"]
  },
  {
    id: 84,
    transliteration: "Al-Inshiqaq",
    arabic: "الإنشقاق",
    tokens: ["al-inshiqaq", "alinshiqaq", "inshiqaq", "الإنشقاق", "الانشقاق", "انشقاق"]
  },
  {
    id: 85,
    transliteration: "Al-Buruj",
    arabic: "البروج",
    tokens: ["al-buruj", "alburuj", "buruj", "البروج", "بروج"]
  },
  {
    id: 86,
    transliteration: "At-Tariq",
    arabic: "الطارق",
    tokens: ["at-tariq", "attariq", "tariq", "الطارق", "طارق"]
  },
  {
    id: 87,
    transliteration: "Al-A'la",
    arabic: "الأعلى",
    tokens: ["al-ala", "alala", "ala", "الأعلى", "الاعلى", "اعلى"]
  },
  {
    id: 88,
    transliteration: "Al-Ghashiyah",
    arabic: "الغاشية",
    tokens: ["al-ghashiyah", "alghashiyah", "ghashiyah", "الغاشية", "غاشية"]
  },
  {
    id: 89,
    transliteration: "Al-Fajr",
    arabic: "الفجر",
    tokens: ["al-fajr", "alfajr", "fajr", "الفجر", "فجر"]
  },
  {
    id: 90,
    transliteration: "Al-Balad",
    arabic: "البلد",
    tokens: ["al-balad", "albalad", "balad", "البلد", "بلد"]
  },
  {
    id: 91,
    transliteration: "Ash-Shams",
    arabic: "الشمس",
    tokens: ["ash-shams", "ashshams", "shams", "الشمس", "شمس"]
  },
  {
    id: 92,
    transliteration: "Al-Layl",
    arabic: "الليل",
    tokens: ["al-layl", "allayl", "layl", "lail", "الليل", "ليل"]
  },
  {
    id: 93,
    transliteration: "Ad-Duha",
    arabic: "الضحى",
    tokens: ["ad-duha", "adduha", "duha", "الضحى", "ضحى"]
  },
  {
    id: 94,
    transliteration: "Ash-Sharh",
    arabic: "الشرح",
    tokens: ["ash-sharh", "ashsharh", "sharh", "الشرح", "شرح", "inshirah", "الانشراح"]
  },
  {
    id: 95,
    transliteration: "At-Tin",
    arabic: "التين",
    tokens: ["at-tin", "attin", "tin", "teen", "التين", "تين"]
  },
  {
    id: 96,
    transliteration: "Al-'Alaq",
    arabic: "العلق",
    tokens: ["al-alaq", "alalaq", "alaq", "العلق", "علق", "iqra", "اقرأ"]
  },
  {
    id: 97,
    transliteration: "Al-Qadr",
    arabic: "القدر",
    tokens: ["al-qadr", "alqadr", "qadr", "القدر", "قدر"]
  },
  {
    id: 98,
    transliteration: "Al-Bayyinah",
    arabic: "البينة",
    tokens: ["al-bayyinah", "albayyinah", "bayyinah", "البينة", "بينة"]
  },
  {
    id: 99,
    transliteration: "Az-Zalzalah",
    arabic: "الزلزلة",
    tokens: ["az-zalzalah", "azzalzalah", "zalzalah", "الزلزلة", "زلزلة"]
  },
  {
    id: 100,
    transliteration: "Al-'Adiyat",
    arabic: "العاديات",
    tokens: ["al-adiyat", "aladiyat", "adiyat", "العاديات", "عاديات"]
  },
  {
    id: 101,
    transliteration: "Al-Qari'ah",
    arabic: "القارعة",
    tokens: ["al-qariah", "alqariah", "qariah", "القارعة", "قارعة"]
  },
  {
    id: 102,
    transliteration: "At-Takathur",
    arabic: "التكاثر",
    tokens: ["at-takathur", "attakathur", "takathur", "التكاثر", "تكاثر"]
  },
  {
    id: 103,
    transliteration: "Al-'Asr",
    arabic: "العصر",
    tokens: ["al-asr", "alasr", "asr", "العصر", "عصر"]
  },
  {
    id: 104,
    transliteration: "Al-Humazah",
    arabic: "الهمزة",
    tokens: ["al-humazah", "alhumazah", "humazah", "الهمزة", "همزة"]
  },
  {
    id: 105,
    transliteration: "Al-Fil",
    arabic: "الفيل",
    tokens: ["al-fil", "alfil", "fil", "feel", "الفيل", "فيل"]
  },
  {
    id: 106,
    transliteration: "Quraysh",
    arabic: "قريش",
    tokens: ["quraysh", "quraish", "قريش"]
  },
  {
    id: 107,
    transliteration: "Al-Ma'un",
    arabic: "الماعون",
    tokens: ["al-maun", "almaun", "maun", "الماعون", "ماعون"]
  },
  {
    id: 108,
    transliteration: "Al-Kawthar",
    arabic: "الكوثر",
    tokens: ["al-kawthar", "alkawthar", "kawthar", "kauthar", "الكوثر", "كوثر"]
  },
  {
    id: 109,
    transliteration: "Al-Kafirun",
    arabic: "الكافرون",
    tokens: ["al-kafirun", "alkafirun", "kafirun", "الكافرون", "كافرون"]
  },
  {
    id: 110,
    transliteration: "An-Nasr",
    arabic: "النصر",
    tokens: ["an-nasr", "annasr", "nasr", "النصر", "نصر"]
  },
  {
    id: 111,
    transliteration: "Al-Masad",
    arabic: "المسد",
    tokens: ["al-masad", "almasad", "masad", "المسد", "مسد", "lahab", "اللهب"]
  },
  {
    id: 112,
    transliteration: "Al-Ikhlas",
    arabic: "الإخلاص",
    tokens: ["al-ikhlas", "alikhlas", "ikhlas", "الإخلاص", "الاخلاص", "اخلاص"]
  },
  {
    id: 113,
    transliteration: "Al-Falaq",
    arabic: "الفلق",
    tokens: ["al-falaq", "alfalaq", "falaq", "الفلق", "فلق"]
  },
  {
    id: 114,
    transliteration: "An-Nas",
    arabic: "الناس",
    tokens: ["an-nas", "annas", "nas", "الناس", "ناس"]
  }
];

/**
 * Helper function to normalize text for search
 * - Removes Arabic diacritics (Tashkeel)
 * - Converts to lowercase
 * - Removes special characters except hyphens
 */
export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove Arabic Tashkeel (diacritics)
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
    // Remove special characters except hyphens and Arabic
    .replace(/[^\w\s\u0600-\u06FF-]/g, '')
    // Normalize multiple spaces to single space
    .replace(/\s+/g, ' ');
}

/**
 * Find Surah by text search (transliteration or Arabic)
 */
export function findSurahByText(searchText: string): SurahData | null {
  const normalized = normalizeSearchText(searchText);
  
  return SURAHS.find(surah => 
    surah.tokens.some(token => normalizeSearchText(token).includes(normalized))
  ) || null;
}

/**
 * Search Surahs by text (returns multiple matches)
 */
export function searchSurahs(searchText: string): SurahData[] {
  const normalized = normalizeSearchText(searchText);
  
  if (!normalized) return [];
  
  return SURAHS.filter(surah => 
    surah.tokens.some(token => normalizeSearchText(token).includes(normalized))
  ).slice(0, 10); // Limit to top 10 results
}

