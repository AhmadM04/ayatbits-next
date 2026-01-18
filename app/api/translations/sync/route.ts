import { NextResponse } from 'next/server';

const QURAN_COM_API = 'https://api.quran.com/api/v4';

interface QuranTranslation {
  id: number;
  name: string;
  author_name: string;
  slug: string;
  language_name: string;
  translated_name: {
    name: string;
    language_name: string;
  };
}

interface TranslationResponse {
  translations: QuranTranslation[];
}

/**
 * Fetch all available translations from Quran.com API
 * This endpoint helps identify resource IDs for different translations
 */
export async function GET() {
  try {
    const response = await fetch(`${QURAN_COM_API}/resources/translations`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch translations from Quran.com');
    }

    const data: TranslationResponse = await response.json();
    const translations = data.translations;

    // Map to find resource IDs for translations we use
    const translationMap: Record<string, { id: number; name: string; author: string; language: string }> = {};

    // Helper function to find translation by criteria
    const findTranslation = (criteria: (t: QuranTranslation) => boolean) => {
      return translations.find(criteria);
    };

    // English translations
    const sahih = findTranslation(t => 
      t.author_name.toLowerCase().includes('saheeh') || 
      t.name.toLowerCase().includes('sahih international')
    );
    if (sahih) {
      translationMap['en.sahih'] = { 
        id: sahih.id, 
        name: sahih.name, 
        author: sahih.author_name,
        language: sahih.language_name
      };
    }

    const pickthall = findTranslation(t => 
      t.author_name.toLowerCase().includes('pickthall')
    );
    if (pickthall) {
      translationMap['en.pickthall'] = { 
        id: pickthall.id, 
        name: pickthall.name, 
        author: pickthall.author_name,
        language: pickthall.language_name
      };
    }

    const yusufali = findTranslation(t => 
      t.author_name.toLowerCase().includes('yusuf ali')
    );
    if (yusufali) {
      translationMap['en.yusufali'] = { 
        id: yusufali.id, 
        name: yusufali.name, 
        author: yusufali.author_name,
        language: yusufali.language_name
      };
    }

    // Arabic tafsirs
    const jalalayn = findTranslation(t => 
      t.name.toLowerCase().includes('jalalayn')
    );
    if (jalalayn) {
      translationMap['ar.jalalayn'] = { 
        id: jalalayn.id, 
        name: jalalayn.name, 
        author: jalalayn.author_name,
        language: jalalayn.language_name
      };
    }

    const muyassar = findTranslation(t => 
      t.name.toLowerCase().includes('muyassar')
    );
    if (muyassar) {
      translationMap['ar.tafseer'] = { 
        id: muyassar.id, 
        name: muyassar.name, 
        author: muyassar.author_name,
        language: muyassar.language_name
      };
    }

    // French
    const hamidullah = findTranslation(t => 
      t.language_name.toLowerCase() === 'french' && 
      t.author_name.toLowerCase().includes('hamidullah')
    );
    if (hamidullah) {
      translationMap['fr.hamidullah'] = { 
        id: hamidullah.id, 
        name: hamidullah.name, 
        author: hamidullah.author_name,
        language: hamidullah.language_name
      };
    }

    // Spanish
    const cortes = findTranslation(t => 
      t.language_name.toLowerCase() === 'spanish' && 
      (t.author_name.toLowerCase().includes('cortes') || t.author_name.toLowerCase().includes('cortés'))
    );
    if (cortes) {
      translationMap['es.cortes'] = { 
        id: cortes.id, 
        name: cortes.name, 
        author: cortes.author_name,
        language: cortes.language_name
      };
    }

    // German
    const bubenheim = findTranslation(t => 
      t.language_name.toLowerCase() === 'german' && 
      t.author_name.toLowerCase().includes('bubenheim')
    );
    if (bubenheim) {
      translationMap['de.bubenheim'] = { 
        id: bubenheim.id, 
        name: bubenheim.name, 
        author: bubenheim.author_name,
        language: bubenheim.language_name
      };
    }

    // Turkish
    const yazir = findTranslation(t => 
      t.language_name.toLowerCase() === 'turkish' && 
      (t.author_name.toLowerCase().includes('yazir') || t.author_name.toLowerCase().includes('yazır'))
    );
    if (yazir) {
      translationMap['tr.yazir'] = { 
        id: yazir.id, 
        name: yazir.name, 
        author: yazir.author_name,
        language: yazir.language_name
      };
    }

    // Urdu
    const maududi = findTranslation(t => 
      t.language_name.toLowerCase() === 'urdu' && 
      t.author_name.toLowerCase().includes('maududi')
    );
    if (maududi) {
      translationMap['ur.maududi'] = { 
        id: maududi.id, 
        name: maududi.name, 
        author: maududi.author_name,
        language: maududi.language_name
      };
    }

    // Indonesian
    const indonesian = findTranslation(t => 
      t.language_name.toLowerCase() === 'indonesian'
    );
    if (indonesian) {
      translationMap['id.muntakhab'] = { 
        id: indonesian.id, 
        name: indonesian.name, 
        author: indonesian.author_name,
        language: indonesian.language_name
      };
    }

    // Malay
    const malay = findTranslation(t => 
      t.language_name.toLowerCase() === 'malay'
    );
    if (malay) {
      translationMap['ms.basmeih'] = { 
        id: malay.id, 
        name: malay.name, 
        author: malay.author_name,
        language: malay.language_name
      };
    }

    // Bengali
    const bengali = findTranslation(t => 
      t.language_name.toLowerCase() === 'bengali'
    );
    if (bengali) {
      translationMap['bn.hoque'] = { 
        id: bengali.id, 
        name: bengali.name, 
        author: bengali.author_name,
        language: bengali.language_name
      };
    }

    // Hindi
    const hindi = findTranslation(t => 
      t.language_name.toLowerCase() === 'hindi'
    );
    if (hindi) {
      translationMap['hi.hindi'] = { 
        id: hindi.id, 
        name: hindi.name, 
        author: hindi.author_name,
        language: hindi.language_name
      };
    }

    // Russian
    const russian = findTranslation(t => 
      t.language_name.toLowerCase() === 'russian' && 
      (t.author_name.toLowerCase().includes('kuliev') || t.author_name.toLowerCase().includes('kuliyev'))
    );
    if (russian) {
      translationMap['ru.kuliev'] = { 
        id: russian.id, 
        name: russian.name, 
        author: russian.author_name,
        language: russian.language_name
      };
    }

    // Chinese
    const chinese = findTranslation(t => 
      t.language_name.toLowerCase() === 'chinese'
    );
    if (chinese) {
      translationMap['zh.chinese'] = { 
        id: chinese.id, 
        name: chinese.name, 
        author: chinese.author_name,
        language: chinese.language_name
      };
    }

    // Japanese
    const japanese = findTranslation(t => 
      t.language_name.toLowerCase() === 'japanese'
    );
    if (japanese) {
      translationMap['ja.japanese'] = { 
        id: japanese.id, 
        name: japanese.name, 
        author: japanese.author_name,
        language: japanese.language_name
      };
    }

    // Dutch
    const dutch = findTranslation(t => 
      t.language_name.toLowerCase() === 'dutch'
    );
    if (dutch) {
      translationMap['nl.dutch'] = { 
        id: dutch.id, 
        name: dutch.name, 
        author: dutch.author_name,
        language: dutch.language_name
      };
    }

    // Estonian
    const estonian = findTranslation(t => 
      t.language_name.toLowerCase() === 'estonian'
    );
    if (estonian) {
      translationMap['et.estonian'] = { 
        id: estonian.id, 
        name: estonian.name, 
        author: estonian.author_name,
        language: estonian.language_name
      };
    }

    return NextResponse.json({
      success: true,
      translationMap,
      totalAvailable: translations.length,
      mapped: Object.keys(translationMap).length,
    });
  } catch (error: any) {
    console.error('Translation sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to sync translations' 
      },
      { status: 500 }
    );
  }
}

