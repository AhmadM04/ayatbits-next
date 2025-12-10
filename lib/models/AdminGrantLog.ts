import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminGrantLog extends Document {
  adminId?: string;
  adminEmail?: string;
  targetEmail: string;
  duration: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminGrantLogSchema = new Schema<IAdminGrantLog>(
  {
    adminId: { type: String },
    adminEmail: { type: String },
    targetEmail: { type: String, required: true, index: true },
    duration: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.AdminGrantLog || mongoose.model<IAdminGrantLog>('AdminGrantLog', AdminGrantLogSchema);