const fs = require('fs');
const path = require('path');

// Common keys that need to be added to AR and RU
const commonKeysAr = {
  dailyQuote: {
    verseOfTheDay: 'آية اليوم',
    playRecitation: 'تشغيل التلاوة',
    openAyah: 'فتح الآية',
    translationNotAvailable: 'الترجمة غير متاحة',
    unableToLoad: 'تعذر تحميل الآية. تحقق من اتصالك.',
    failedToLoad: 'فشل تحميل الآية.'
  },
  transliteration: {
    show: 'إظهار النسخ الصوتي',
    hide: 'إخفاء النسخ الصوتي',
    label: 'النسخ الصوتي',
    loading: 'جارٍ تحميل النسخ الصوتي...',
    notAvailable: 'النسخ الصوتي غير متاح'
  },
  harakat: {
    guide: 'دليل الحركات',
    closeGuide: 'إغلاق الدليل',
    diacriticalMarks: 'علامات التشكيل العربية',
    tapToSeeDetails: 'انقر على أي حركة في النص لرؤية تفاصيلها',
    sound: 'الصوت',
    transliteration: 'النسخ الصوتي',
    description: 'الوصف',
    examples: 'أمثلة',
    shortVowels: 'الحركات القصيرة',
    nunation: 'التنوين',
    otherMarks: 'علامات أخرى',
    fatha: 'فَتْحَة',
    kasra: 'كَسْرَة',
    damma: 'ضَمَّة',
    sukun: 'سُكُون',
    shadda: 'شَدَّة',
    tanweenFath: 'تَنْوِين فَتْح',
    tanweenKasr: 'تَنْوِين كَسْر',
    tanweenDamm: 'تَنْوِين ضَمّ',
    maddah: 'مَدَّة',
    hamzaAbove: 'هَمْزَة فَوْق',
    hamzaBelow: 'هَمْزَة تَحْت',
    superscriptAlef: 'أَلِف خَنْجَرِيَّة'
  }
};

const commonKeysRu = {
  common: {
    ayahs: 'аяты',
    page: 'Страница',
    of: 'из',
    retry: 'Повторить',
    listen: 'Слушать',
    gotIt: 'Понятно',
    playing: 'Воспроизведение'
  },
  dailyQuote: {
    verseOfTheDay: 'Аят дня',
    playRecitation: 'Воспроизвести чтение',
    openAyah: 'Открыть аят',
    translationNotAvailable: 'Перевод недоступен',
    unableToLoad: 'Не удалось загрузить аят. Проверьте подключение.',
    failedToLoad: 'Не удалось загрузить аят.'
  },
  transliteration: {
    show: 'Показать транслитерацию',
    hide: 'Скрыть транслитерацию',
    label: 'Транслитерация',
    loading: 'Загрузка транслитерации...',
    notAvailable: 'Транслитерация недоступна'
  },
  harakat: {
    guide: 'Руководство по харакату',
    closeGuide: 'Закрыть руководство',
    diacriticalMarks: 'Арабские диакритические знаки',
    tapToSeeDetails: 'Нажмите на любой харакат в тексте, чтобы увидеть детали',
    sound: 'Звук',
    transliteration: 'Транслитерация',
    description: 'Описание',
    examples: 'Примеры',
    shortVowels: 'Короткие гласные',
    nunation: 'Нунация (Танвин)',
    otherMarks: 'Другие знаки',
    fatha: 'Фатха',
    kasra: 'Касра',
    damma: 'Дамма',
    sukun: 'Сукун',
    shadda: 'Шадда',
    tanweenFath: 'Танвин Фатх',
    tanweenKasr: 'Танвин Каср',
    tanweenDamm: 'Танвин Дамм',
    maddah: 'Мадда',
    hamzaAbove: 'Хамза сверху',
    hamzaBelow: 'Хамза снизу',
    superscriptAlef: 'Надстрочный Алиф'
  },
  search: {
    searchVerse: 'Поиск аята'
  }
};

// Update RU
const ruJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'messages', 'ru.json'), 'utf8'));

// Add missing keys to common
Object.assign(ruJson.common, commonKeysRu.common);

// Add missing sections
if (!ruJson.dailyQuote) ruJson.dailyQuote = {};
Object.assign(ruJson.dailyQuote, commonKeysRu.dailyQuote);

if (!ruJson.transliteration) ruJson.transliteration = {};
Object.assign(ruJson.transliteration, commonKeysRu.transliteration);

if (!ruJson.harakat) ruJson.harakat = {};
Object.assign(ruJson.harakat, commonKeysRu.harakat);

// Add search.searchVerse
if (!ruJson.search) ruJson.search = {};
Object.assign(ruJson.search, commonKeysRu.search);

fs.writeFileSync(
  path.join(__dirname, 'messages', 'ru.json'),
  JSON.stringify(ruJson, null, 2),
  'utf8'
);

console.log('✅ Updated ru.json with common keys!');

