// Types for word-by-word audio recitation

export interface WordSegment {
  position: number;
  text: string;
  audioUrl: string;
  startTime: number;  // in seconds
  endTime: number;    // in seconds
}

export interface AyahAudioSegments {
  surahNumber: number;
  ayahNumber: number;
  segments: WordSegment[];
  audioUrl: string; // Full ayah audio URL
}

// Response types from Quran.com API
export interface QuranComWord {
  id: number;
  position: number;
  audio_url: string;
  char_type_name: string;
  text_uthmani: string;
  page_number: number;
  line_number: number;
  text: string;
  translation?: {
    text: string;
    language_name: string;
  };
  transliteration?: {
    text: string;
    language_name: string;
  };
}

export interface QuranComAudioSegment {
  start_time: number;
  end_time: number;
  segments: number[];
  timestamp_from: number;
  timestamp_to: number;
}

export interface QuranComVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  words: QuranComWord[];
  audio?: {
    url: string;
    segments?: QuranComAudioSegment[];
  };
}

export interface QuranComResponse {
  verse: QuranComVerse;
}

