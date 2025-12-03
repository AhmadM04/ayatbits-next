// MongoDB models and connection
import connectDB from './mongodb';
import User from './models/User';
import Juz from './models/Juz';
import Surah from './models/Surah';
import Puzzle from './models/Puzzle';
import UserProgress from './models/UserProgress';
import LikedAyat from './models/LikedAyat';
import Trophy from './models/Trophy';

// Export models and connection function
export { connectDB };
export { User, Juz, Surah, Puzzle, UserProgress, LikedAyat, Trophy };

// Export types
export type { IUser } from './models/User';
export type { IJuz } from './models/Juz';
export type { ISurah } from './models/Surah';
export type { IPuzzle } from './models/Puzzle';
export type { IUserProgress } from './models/UserProgress';
export type { ILikedAyat } from './models/LikedAyat';
export type { ITrophy } from './models/Trophy';
export { SubscriptionStatus } from './models/User';
export { PuzzleType } from './models/Puzzle';
export { ProgressStatus } from './models/UserProgress';

