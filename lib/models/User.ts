import mongoose, { Schema, Document } from 'mongoose';

export enum SubscriptionStatusEnum {
  INACTIVE = 'inactive',
  TRIALING = 'trialing',
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  LIFETIME = 'lifetime',
}

export enum SubscriptionPlan {
  FREE = 'free',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  LIFETIME = 'lifetime',
}

export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  imageUrl?: string;
  subscriptionStatus: SubscriptionStatusEnum;
  subscriptionPlan?: SubscriptionPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialEndDate?: Date;
  selectedTranslation: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: Date;
  hasBypass?: boolean; // Admin bypass for premium features
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, index: true },
    firstName: String,
    lastName: String,
    name: String,
    imageUrl: String,
    subscriptionStatus: {
      type: String,
      enum: Object.values(SubscriptionStatusEnum),
      default: SubscriptionStatusEnum.TRIALING, // New users get a free trial automatically
    },
    trialEndDate: { 
      type: Date, 
      default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days free trial for new users
    },
    subscriptionPlan: {
      type: String,
      enum: Object.values(SubscriptionPlan),
      default: SubscriptionPlan.FREE,
    },
    stripeCustomerId: { type: String, index: true },
    stripeSubscriptionId: String,
    // trialEndDate: Moved above to have default value for new users
    selectedTranslation: { type: String, default: 'en.sahih' },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: Date,
    hasBypass: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
