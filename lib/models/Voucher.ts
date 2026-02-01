import mongoose, { Document, Model } from 'mongoose';

export enum VoucherType {
  RAMADAN = 'ramadan',
  PROMO = 'promo',
  SPECIAL = 'special',
}

export interface IVoucher extends Document {
  code: string; // Unique voucher code (e.g., "RAMADAN2026")
  type: VoucherType;
  tier: 'basic' | 'pro'; // Which tier this voucher grants
  duration: number; // Duration in months
  maxRedemptions: number; // Max number of times it can be redeemed
  redemptionCount: number; // Current number of redemptions
  expiresAt: Date; // Expiration date
  createdBy: mongoose.Types.ObjectId; // Admin who created it
  isActive: boolean; // Can be deactivated
  description?: string; // Optional description
  createdAt: Date;
  updatedAt: Date;
}

const voucherSchema = new mongoose.Schema<IVoucher>(
  {
    code: { 
      type: String, 
      required: true, 
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(VoucherType),
      required: true,
    },
    tier: {
      type: String,
      enum: ['basic', 'pro'],
      required: true,
      default: 'pro',
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    maxRedemptions: {
      type: Number,
      required: true,
      min: 1,
      default: 1000,
    },
    redemptionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound index for efficient lookups
voucherSchema.index({ code: 1, isActive: 1 });

const Voucher: Model<IVoucher> = mongoose.models.Voucher || mongoose.model<IVoucher>('Voucher', voucherSchema);

export default Voucher;

