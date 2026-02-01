// MongoDB models and connection
import connectDB from './mongodb';
import User from './models/User';
import Juz from './models/Juz';
import Surah from './models/Surah';
import Puzzle from './models/Puzzle';
import UserProgress from './models/UserProgress';
import LikedAyat from './models/LikedAyat';
import Trophy from './models/Trophy';
import UserAchievement, { ACHIEVEMENTS } from './models/Achievement';
import AdminGrantLog from './models/AdminGrantLog';
import Waitlist from './models/Waitlist';
import Voucher from './models/Voucher';
import VoucherRedemption from './models/VoucherRedemption';
import TafsirCache from './models/TafsirCache';

// Export models and connection function
export { connectDB };
export { User, Juz, Surah, Puzzle, UserProgress, LikedAyat, Trophy, UserAchievement, ACHIEVEMENTS, AdminGrantLog, Waitlist, Voucher, VoucherRedemption, TafsirCache };

// Export types
export type { IUser } from './models/User';
export type { IJuz } from './models/Juz';
export type { ISurah } from './models/Surah';
export type { IPuzzle } from './models/Puzzle';
export type { IUserProgress } from './models/UserProgress';
export type { ILikedAyat } from './models/LikedAyat';
export type { ITrophy } from './models/Trophy';
export type { IUserAchievement } from './models/Achievement';
export type { IAdminGrantLog } from './models/AdminGrantLog';
export type { IWaitlist } from './models/Waitlist';
export type { IVoucher } from './models/Voucher';
export type { IVoucherRedemption } from './models/VoucherRedemption';
export type { ITafsirCache } from './models/TafsirCache';
export { SubscriptionStatusEnum, UserRole } from './models/User';
export type { SubscriptionPlan, SubscriptionTier } from './models/User';
export { VoucherType } from './models/Voucher';
export { PuzzleType } from './models/Puzzle';
export { ProgressStatus } from './models/UserProgress';
export { WaitlistStatus } from './models/Waitlist';

