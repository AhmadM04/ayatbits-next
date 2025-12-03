import mongoose, { Schema, Document } from 'mongoose';

export interface ILikedAyat extends Document {
  userId: mongoose.Types.ObjectId;
  puzzleId: mongoose.Types.ObjectId;
  likedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LikedAyatSchema = new Schema<ILikedAyat>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    puzzleId: { type: Schema.Types.ObjectId, ref: 'Puzzle', required: true, index: true },
    likedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Create unique compound index
LikedAyatSchema.index({ userId: 1, puzzleId: 1 }, { unique: true });

export default mongoose.models.LikedAyat || mongoose.model<ILikedAyat>('LikedAyat', LikedAyatSchema);

