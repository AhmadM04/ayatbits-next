import mongoose, { Schema, Document } from 'mongoose';

export interface ITrophy extends Document {
  userId: mongoose.Types.ObjectId;
  surahNumber: number;
  surahName: string;
  earnedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TrophySchema = new Schema<ITrophy>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    surahNumber: { type: Number, required: true, index: true },
    surahName: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Create unique compound index
TrophySchema.index({ userId: 1, surahNumber: 1 }, { unique: true });

export default mongoose.models.Trophy || mongoose.model<ITrophy>('Trophy', TrophySchema);

