import mongoose, { Document, Model } from 'mongoose';

export interface IVoucherRedemption extends Document {
  userId: mongoose.Types.ObjectId;
  voucherId: mongoose.Types.ObjectId;
  redeemedAt: Date;
  grantedTier: 'basic' | 'pro';
  grantedDuration: number; // months
  createdAt: Date;
  updatedAt: Date;
}

const voucherRedemptionSchema = new mongoose.Schema<IVoucherRedemption>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voucher',
      required: true,
      index: true,
    },
    redeemedAt: {
      type: Date,
      default: Date.now,
    },
    grantedTier: {
      type: String,
      enum: ['basic', 'pro'],
      required: true,
    },
    grantedDuration: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate redemptions
voucherRedemptionSchema.index({ userId: 1, voucherId: 1 }, { unique: true });

const VoucherRedemption: Model<IVoucherRedemption> = 
  mongoose.models.VoucherRedemption || 
  mongoose.model<IVoucherRedemption>('VoucherRedemption', voucherRedemptionSchema);

export default VoucherRedemption;


