/**
 * Verifies that harakat detection is working correctly
 * Run with: npx tsx scripts/verify-harakat.ts
 */
import { isHarakat, ALL_HARAKAT_CHARS, parseArabicText, getHarakatDefinition } from '../lib/harakat-utils';

// Sample Quran text with various harakat (Uthmani script from alquran.cloud)
const SAMPLE_TEXTS = [
  {
    name: 'Al-Fatiha 1:1',
    text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  },
  {
    name: 'Al-Fatiha 1:2',
    text: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
  },
  {
    name: 'Al-Ikhlas 112:1',
    text: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
  },
  {
    name: 'Al-Baqarah 2:255 (Ayatul Kursi start)',
    text: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ',
  },
];

function analyzeText(name: string, text: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Analyzing: ${name}`);
  console.log(`Text: ${text}`);
  console.log('-'.repeat(80));

  let harakatCount = 0;
  const harakatTypes: Map<string, { count: number; char: string; name: string }> = new Map();
  const unrecognizedMarks: string[] = [];

  for (const char of text) {
    const code = char.charCodeAt(0);
    const hex = `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
    
    if (isHarakat(char)) {
      harakatCount++;
      const def = getHarakatDefinition(char);
      const existing = harakatTypes.get(hex) || { count: 0, char, name: def?.nameEnglish || 'Unknown' };
      existing.count++;
      harakatTypes.set(hex, existing);
    } else if (code >= 0x0600 && code <= 0x06FF) {
      // Check if it's in the Arabic block but not recognized
      // Skip base letters (U+0621-U+064A) and digits (U+0660-U+0669)
      if (code < 0x0621 || (code > 0x064A && code < 0x0660) || code > 0x0669) {
        if (!text.includes(char) || !unrecognizedMarks.includes(`${char}(${hex})`)) {
          // Check if it's a potential diacritical mark we're missing
          if ((code >= 0x0610 && code <= 0x061A) || 
              (code >= 0x064B && code <= 0x065F) ||
              (code >= 0x06D6 && code <= 0x06ED) ||
              code === 0x0670) {
            if (!ALL_HARAKAT_CHARS.has(char)) {
              unrecognizedMarks.push(`${char}(${hex})`);
            }
          }
        }
      }
    }
  }

  console.log(`\nResults:`);
  if (harakatCount > 0) {
    console.log(`✅ Found ${harakatCount} harakat characters`);
    console.log(`\nBreakdown by type:`);
    for (const [hex, info] of harakatTypes) {
      console.log(`   ${hex} "${info.char}" - ${info.name}: ${info.count} occurrences`);
    }
  } else {
    console.log(`❌ No harakat found!`);
  }

  if (unrecognizedMarks.length > 0) {
    console.log(`\n⚠️  Unrecognized marks in Arabic block: ${unrecognizedMarks.join(', ')}`);
  }

  // Show unicode breakdown
  console.log(`\nUnicode breakdown (first 60 chars):`);
  const sample = [...text.slice(0, 60)].map(c => {
    const code = c.charCodeAt(0);
    const hex = code.toString(16).toUpperCase().padStart(4, '0');
    const isH = isHarakat(c);
    return `${c}(${hex}${isH ? '✓' : ''})`;
  });
  console.log(`   ${sample.join(' ')}`);

  // Test parseArabicText
  const segments = parseArabicText(text);
  const harakatSegments = segments.filter(s => s.isHarakat);
  console.log(`\nparseArabicText() result:`);
  console.log(`   Total segments: ${segments.length}`);
  console.log(`   Harakat segments: ${harakatSegments.length}`);
  
  return harakatCount;
}

function main() {
  console.log('HARAKAT DETECTION VERIFICATION');
  console.log('==============================\n');
  console.log(`Total harakat characters defined: ${ALL_HARAKAT_CHARS.size}`);
  console.log(`\nExpected Unicode ranges:`);
  console.log(`   Standard: U+064B-U+065F`);
  console.log(`   Extended: U+0610-U+061A`);
  console.log(`   Quranic:  U+06D6-U+06ED`);
  console.log(`   Dagger Alef: U+0670`);

  let totalFound = 0;
  let successCount = 0;

  for (const sample of SAMPLE_TEXTS) {
    const count = analyzeText(sample.name, sample.text);
    totalFound += count;
    if (count > 0) successCount++;
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Samples tested: ${SAMPLE_TEXTS.length}`);
  console.log(`Samples with harakat: ${successCount}/${SAMPLE_TEXTS.length}`);
  console.log(`Total harakat found: ${totalFound}`);
  
  if (successCount === SAMPLE_TEXTS.length) {
    console.log(`\n✅ SUCCESS: Harakat detection is working correctly!`);
  } else if (successCount > 0) {
    console.log(`\n⚠️  PARTIAL: Some harakat detected but not all samples passed`);
  } else {
    console.log(`\n❌ FAILURE: No harakat detected - check if text contains diacritics`);
  }
}

main();
