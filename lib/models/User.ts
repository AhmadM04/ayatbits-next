import mongoose, { Schema, Document } from 'mongoose';

export enum SubscriptionPlan {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum SubscriptionStatusEnum {
  INACTIVE = 'inactive',
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
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
  // Subscription fields
  subscriptionStatus: string;
  subscriptionPlan?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialEndsAt?: Date;
  currentPeriodEnd?: Date;
  // Admin access
  isAdmin?: boolean;
  // Admin bypass - users with lifetime access
  hasBypass?: boolean;
  bypassReason?: string;
  // Activity & Progress
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
    clerkId: { type: String, required: false, unique: true, sparse: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: String,
    firstName: String,
    lastName: String,
    username: String,
    imageUrl: String,
    selectedTranslation: { type: String, default: 'en.sahih' },
    // Subscription fields
    subscriptionStatus: {
      type: String,
      enum: Object.values(SubscriptionStatusEnum),
      default: SubscriptionStatusEnum.INACTIVE,
    },
    subscriptionPlan: {
      type: String,
      enum: [...Object.values(SubscriptionPlan), null],
      default: null,
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    trialEndsAt: Date,
    currentPeriodEnd: Date,
    // Admin access
    isAdmin: { type: Boolean, default: false },
    // Admin bypass - users with lifetime access
    hasBypass: { type: Boolean, default: false },
    bypassReason: String,
    // Activity & Progress
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
