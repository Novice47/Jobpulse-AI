import mongoose, { Schema, Document } from 'mongoose';

export interface ILocationDocument extends Document {
  city: string;
  state?: string;
  country: string;
  normalizedName: string;
  timezone?: string;
  activeJobsCount: number;
  remoteShare: number;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocationDocument>(
  {
    city: { type: String, required: true, index: true },
    state: { type: String, default: '' },
    country: { type: String, required: true, default: 'India', index: true },
    normalizedName: { type: String, required: true, unique: true, index: true },
    timezone: { type: String, default: 'IST' },
    activeJobsCount: { type: Number, default: 0 },
    remoteShare: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const LocationModel = mongoose.model<ILocationDocument>('Location', LocationSchema);
