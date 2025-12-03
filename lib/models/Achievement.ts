import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: string;
  unlockedAt: Date;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserAchievementSchema = new Schema<IUserAchievement>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    achievementId: { type: String, required: true },
    unlockedAt: { type: Date },
    progress: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export default mongoose.models.UserAchievement || mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);

// Achievement definitions
export const ACHIEVEMENTS = [
  {
    id: 'first_puzzle',
    name: 'First Step',
    description: 'Complete your first puzzle',
    icon: '🎯',
    requirement: 1,
    type: 'puzzles_completed',
  },
  {
    id: 'puzzle_10',
    name: 'Getting Started',
    description: 'Complete 10 puzzles',
    icon: '📚',
    requirement: 10,
    type: 'puzzles_completed',
  },
  {
    id: 'puzzle_50',
    name: 'Dedicated Learner',
    description: 'Complete 50 puzzles',
    icon: '⭐',
    requirement: 50,
    type: 'puzzles_completed',
  },
  {
    id: 'puzzle_100',
    name: 'Century',
    description: 'Complete 100 puzzles',
    icon: '💯',
    requirement: 100,
    type: 'puzzles_completed',
  },
  {
    id: 'puzzle_500',
    name: 'Scholar',
    description: 'Complete 500 puzzles',
    icon: '🎓',
    requirement: 500,
    type: 'puzzles_completed',
  },
  {
    id: 'streak_3',
    name: 'Consistent',
    description: 'Achieve a 3-day streak',
    icon: '🔥',
    requirement: 3,
    type: 'streak',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Achieve a 7-day streak',
    icon: '🏆',
    requirement: 7,
    type: 'streak',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Achieve a 30-day streak',
    icon: '👑',
    requirement: 30,
    type: 'streak',
  },
  {
    id: 'juz_1',
    name: 'First Juz',
    description: 'Complete all puzzles in one Juz',
    icon: '📖',
    requirement: 1,
    type: 'juz_completed',
  },
  {
    id: 'juz_5',
    name: 'Five Juz',
    description: 'Complete 5 Juz',
    icon: '📕',
    requirement: 5,
    type: 'juz_completed',
  },
  {
    id: 'surah_fatiha',
    name: 'The Opening',
    description: 'Complete Surah Al-Fatiha',
    icon: '🌟',
    requirement: 1,
    type: 'special_surah',
    surahNumber: 1,
  },
  {
    id: 'liked_10',
    name: 'Collector',
    description: 'Like 10 ayahs',
    icon: '❤️',
    requirement: 10,
    type: 'liked_ayahs',
  },
];

