import mongoose, { Schema, Document } from 'mongoose';

export interface IJuz extends Document {
  number: number; // 1-30
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const JuzSchema = new Schema<IJuz>(
  {
    number: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Juz || mongoose.model<IJuz>('Juz', JuzSchema);


