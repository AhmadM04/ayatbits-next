import mongoose, { Schema, Document } from 'mongoose';

export interface ISurah extends Document {
  number: number; // 1-114
  nameEnglish: string;
  nameArabic: string;
  juzId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SurahSchema = new Schema<ISurah>(
  {
    number: { type: Number, required: true, unique: true, index: true },
    nameEnglish: { type: String, required: true },
    nameArabic: { type: String, required: true },
    juzId: { type: Schema.Types.ObjectId, ref: 'Juz', index: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Surah || mongoose.model<ISurah>('Surah', SurahSchema);



