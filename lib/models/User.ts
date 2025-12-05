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

export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  stripeCustomerId?: string;
  subscriptionStatus: SubscriptionStatusEnum;
  subscriptionPlan?: SubscriptionPlan; // Optional: Undefined if no plan selected
  subscriptionEndDate?: Date;
  trialEndsAt?: Date; // Specific field for the 7-day trial
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
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
    subscriptionEndDate: { type: Date },
    trialEndsAt: { type: Date },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;