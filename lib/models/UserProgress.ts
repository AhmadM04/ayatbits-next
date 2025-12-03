import mongoose, { Schema, Document } from 'mongoose';

export enum ProgressStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
}

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  puzzleId: mongoose.Types.ObjectId;
  status: ProgressStatus;
  score: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    puzzleId: { type: Schema.Types.ObjectId, ref: 'Puzzle', required: true, index: true },
    status: {
      type: String,
      enum: Object.values(ProgressStatus),
      required: true,
    },
    score: { type: Number, default: 0 },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Create unique compound index
UserProgressSchema.index({ userId: 1, puzzleId: 1 }, { unique: true });

export default mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);


