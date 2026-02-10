import mongoose, { Document, Model } from 'mongoose';

export enum SubscriptionStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TRIALING = 'trialing', // Added for the 7-day trial period
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export type SubscriptionPlan = 'monthly' | 'yearly' | 'lifetime'; // Removed 'free'

export type SubscriptionTier = 'basic' | 'pro';

export type SubscriptionPlatform = 'web' | 'ios';

export interface IUser extends Document {
  clerkIds?: string[]; // Array to support multiple Clerk instances (dev/prod). Admin-created users may not have any.
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  imageUrl?: string;
  appleId?: string; // Apple's unique user identifier (sub claim from token)
  stripeCustomerId?: string;
  subscriptionStatus?: SubscriptionStatusEnum;
  subscriptionPlan?: SubscriptionPlan; // Optional: Undefined if no plan selected
  subscriptionTier?: SubscriptionTier; // 'basic' or 'pro' tier
  subscriptionEndDate?: Date;
  trialEndsAt?: Date; // Specific field for the 7-day trial
  subscriptionPlatform?: SubscriptionPlatform; // Track where user subscribed
  iosTransactionId?: string; // Track iOS transaction for verification
  preferredLanguage?: string;
  preferredTranslation?: string;
  selectedTranslation?: string;
  showTransliteration?: boolean;
  enableWordByWordAudio?: boolean;
  role?: UserRole; // Role-based access control (admin or user)
  isAdmin?: boolean; // DEPRECATED: Use 'role' field instead. Kept for backwards compatibility during migration.
  hasDirectAccess?: boolean; // Granted by admin to bypass subscription
  lastActivityDate?: Date;
  currentStreak?: number;
  longestStreak?: number;
  lastPuzzleId?: mongoose.Types.ObjectId;
  totalPuzzlesCompleted?: number;
  onboardingCompleted?: boolean;
  onboardingSkipped?: boolean;
  referralSource?: string;
  ageRange?: string;
  onboardingCompletedAt?: Date;
  // User Preferences
  themePreference?: 'light' | 'dark' | 'system';
  emailNotifications?: boolean;
  inAppNotifications?: boolean; // Future feature
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    clerkIds: { type: [String], required: false, index: true },
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
    subscriptionTier: {
      type: String,
      enum: ['basic', 'pro'],
      // No default value - assigned when user subscribes or gets admin access
    },
    preferredLanguage: { type: String, default: 'en' },
    preferredTranslation: { type: String },
    selectedTranslation: { type: String, default: 'en.sahih' },
    showTransliteration: { type: Boolean, default: false },
    enableWordByWordAudio: { type: Boolean, default: false },
    role: { 
      type: String, 
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isAdmin: { type: Boolean, default: false }, // DEPRECATED: Kept for backwards compatibility
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
    onboardingCompleted: { type: Boolean, default: false },
    onboardingSkipped: { type: Boolean, default: false },
    referralSource: { type: String },
    ageRange: { type: String },
    onboardingCompletedAt: { type: Date },
    // User Preferences
    themePreference: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
    emailNotifications: { type: Boolean, default: true },
    inAppNotifications: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Middleware to sync role and isAdmin for backwards compatibility
userSchema.pre('save', function(next) {
  // Sync role -> isAdmin
  if (this.isModified('role')) {
    this.isAdmin = this.role === UserRole.ADMIN;
  }
  // Sync isAdmin -> role (for legacy code that still sets isAdmin)
  else if (this.isModified('isAdmin')) {
    this.role = this.isAdmin ? UserRole.ADMIN : UserRole.USER;
  }
  next();
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;