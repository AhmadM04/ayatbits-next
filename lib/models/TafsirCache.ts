import mongoose, { Document, Model } from 'mongoose';

export interface ITafsirCache extends Document {
  surahNumber: number;
  ayahNumber: number;
  language: string; // 'en', 'ar', 'ru', etc.
  tafsirText: string; // The generated tafsir content
  source: string; // e.g., "Tafsir Ibn Kathir (AI Translated to English)"
  aiModel: string; // AI model used (e.g., "gemini-2.0-flash-exp")
  generatedAt: Date;
  version: number; // For tracking regenerations/updates
  createdAt: Date;
  updatedAt: Date;
}

const tafsirCacheSchema = new mongoose.Schema<ITafsirCache>(
  {
    surahNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 114,
    },
    ayahNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    language: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    tafsirText: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    aiModel: {
      type: String,
      required: true,
      default: 'gemini-2.0-flash-exp',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Compound index for fast lookups
tafsirCacheSchema.index({ surahNumber: 1, ayahNumber: 1, language: 1 }, { unique: true });

// Index for bulk queries by language
tafsirCacheSchema.index({ language: 1, generatedAt: -1 });

const TafsirCache: Model<ITafsirCache> = 
  mongoose.models.TafsirCache || 
  mongoose.model<ITafsirCache>('TafsirCache', tafsirCacheSchema);

export default TafsirCache;

