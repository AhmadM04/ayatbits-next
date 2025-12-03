import mongoose, { Schema, Document } from 'mongoose';

export enum SubscriptionStatus {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  imageUrl?: string;
  selectedTranslation?: string;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  lastPuzzleId?: mongoose.Types.ObjectId;
  totalPuzzlesCompleted: number;
  totalTimeSpent: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: String,
    firstName: String,
    lastName: String,
    username: String,
    imageUrl: String,
    selectedTranslation: { type: String, default: 'en.sahih' },
    subscriptionStatus: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.FREE,
    },
    stripeCustomerId: String,
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: Date,
    lastPuzzleId: { type: Schema.Types.ObjectId, ref: 'Puzzle' },
    totalPuzzlesCompleted: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

