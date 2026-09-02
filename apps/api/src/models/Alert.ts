import mongoose, { Schema, Document } from 'mongoose';

export interface IAlertDocument extends Document {
  userId: mongoose.Types.ObjectId;
  targetRole: string;
  skills: string[];
  location?: string;
  remoteOnly: boolean;
  minSalary?: number;
  frequency: 'DAILY' | 'WEEKLY';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlertDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetRole: { type: String, required: true },
    skills: [{ type: String }],
    location: { type: String, default: '' },
    remoteOnly: { type: Boolean, default: false },
    minSalary: { type: Number },
    frequency: { type: String, enum: ['DAILY', 'WEEKLY'], default: 'DAILY' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AlertModel = mongoose.model<IAlertDocument>('Alert', AlertSchema);
