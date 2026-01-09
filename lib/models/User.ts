import mongoose, { Document, Model } from 'mongoose';

export enum SubscriptionStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TRIALING = 'trialing', // Added for the 7-day trial period
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
}

export type SubscriptionPlan = 'monthly' | 'yearly' | 'lifetime'; // Removed 'free'

export type SubscriptionPlatform = 'web' | 'ios';

export interface IUser extends Document {
  clerkId?: string; // Optional: Admin-created users may not have a Clerk account yet
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  imageUrl?: string;
  appleId?: string; // Apple's unique user identifier (sub claim from token)
  stripeCustomerId?: string;
  subscriptionStatus?: SubscriptionStatusEnum;
  subscriptionPlan?: SubscriptionPlan; // Optional: Undefined if no plan selected
  subscriptionEndDate?: Date;
  trialEndsAt?: Date; // Specific field for the 7-day trial
  subscriptionPlatform?: SubscriptionPlatform; // Track where user subscribed
  iosTransactionId?: string; // Track iOS transaction for verification
  preferredLanguage?: string;
  preferredTranslation?: string;
  selectedTranslation?: string;
  showTransliteration?: boolean;
  isAdmin?: boolean;
  hasDirectAccess?: boolean; // Granted by admin to bypass subscription
  lastActivityDate?: Date;
  currentStreak?: number;
  longestStreak?: number;
  lastPuzzleId?: mongoose.Types.ObjectId;
  totalPuzzlesCompleted?: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    clerkId: { type: String, required: false, unique: true, sparse: true, index: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    name: { type: String },
    imageUrl: { type: String },
    appleId: { type: String }, // Apple's unique user identifier
    stripeCustomerId: { type: String },
    subscriptionStatus: {
      type: String,
      enum: Object.values(SubscriptionStatusEnum),
      default: SubscriptionStatusEnum.INACTIVE,
    },
    subscriptionPlan: {
      type: String,
      enum: ['monthly', 'yearly', 'lifetime'],
      // No default value - user has no plan until they select one
    },
    preferredLanguage: { type: String, default: 'en' },
    preferredTranslation: { type: String },
    selectedTranslation: { type: String, default: 'en.sahih' },
    showTransliteration: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    hasDirectAccess: { type: Boolean, default: false },
    subscriptionEndDate: { type: Date },
    trialEndsAt: { type: Date },
    subscriptionPlatform: { type: String, enum: ['web', 'ios'] },
    iosTransactionId: { type: String },
    lastActivityDate: { type: Date },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastPuzzleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Puzzle' },
    totalPuzzlesCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;