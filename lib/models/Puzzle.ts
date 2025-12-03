import mongoose, { Schema, Document } from 'mongoose';

export enum PuzzleType {
  ORDERING = 'ORDERING',
  FILL_BLANK = 'FILL_BLANK',
  MATCHING = 'MATCHING',
}

export interface IPuzzle extends Document {
  juzId?: mongoose.Types.ObjectId;
  surahId?: mongoose.Types.ObjectId;
  type: PuzzleType;
  content: Record<string, any>; // JSON data
  difficulty?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PuzzleSchema = new Schema<IPuzzle>(
  {
    juzId: { type: Schema.Types.ObjectId, ref: 'Juz', index: true },
    surahId: { type: Schema.Types.ObjectId, ref: 'Surah', index: true },
    type: {
      type: String,
      enum: Object.values(PuzzleType),
      required: true,
      index: true,
    },
    content: { type: Schema.Types.Mixed, required: true },
    difficulty: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Puzzle || mongoose.model<IPuzzle>('Puzzle', PuzzleSchema);

