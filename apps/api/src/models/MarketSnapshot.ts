import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketSnapshotDocument extends Document {
  timestamp: Date;
  totalJobs: number;
  remotePercentage: number;
  period: '7d' | '30d' | '90d' | '180d' | '365d';
  topRoles: { role: string; count: number; growthRate: number }[];
  topSkills: { skill: string; count: number; growthRate: number }[];
  salaryStats: { median: number; p25: number; p75: number };
  locationStats: { location: string; count: number }[];
  isSynthetic: boolean;
  createdAt: Date;
}

const MarketSnapshotSchema = new Schema<IMarketSnapshotDocument>(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    totalJobs: { type: Number, required: true },
    remotePercentage: { type: Number, required: true },
    period: {
      type: String,
      enum: ['7d', '30d', '90d', '180d', '365d'],
      default: '30d',
      index: true,
    },
    topRoles: [
      {
        role: String,
        count: Number,
        growthRate: Number,
      },
    ],
    topSkills: [
      {
        skill: String,
        count: Number,
        growthRate: Number,
      },
    ],
    salaryStats: {
      median: { type: Number, default: 0 },
      p25: { type: Number, default: 0 },
      p75: { type: Number, default: 0 },
    },
    locationStats: [
      {
        location: String,
        count: Number,
      },
    ],
    isSynthetic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const MarketSnapshotModel = mongoose.model<IMarketSnapshotDocument>('MarketSnapshot', MarketSnapshotSchema);
