import mongoose, { Document, Model } from 'mongoose';

export enum WaitlistStatus {
  PENDING = 'pending',
  CONTACTED = 'contacted',
  CONVERTED = 'converted',
}

export interface IWaitlist extends Document {
  email: string;
  firstName: string;
  source?: string;
  interests: string[];
  metadata?: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
  };
  status: WaitlistStatus;
  createdAt: Date;
  updatedAt: Date;
}

const waitlistSchema = new mongoose.Schema<IWaitlist>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      default: 'web',
    },
    interests: {
      type: [String],
      default: ['news', 'features', 'beta'],
    },
    metadata: {
      ip: { type: String },
      userAgent: { type: String },
      referrer: { type: String },
    },
    status: {
      type: String,
      enum: Object.values(WaitlistStatus),
      default: WaitlistStatus.PENDING,
    },
  },
  { timestamps: true }
);

// Create index for faster queries
waitlistSchema.index({ createdAt: -1 });
waitlistSchema.index({ status: 1 });

const Waitlist: Model<IWaitlist> =
  mongoose.models.Waitlist || mongoose.model<IWaitlist>('Waitlist', waitlistSchema);

export default Waitlist;

