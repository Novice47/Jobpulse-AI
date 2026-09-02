import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanyDocument extends Document {
  name: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  industry: string;
  description: string;
  locations: string[];
  activeJobCount: number;
  hiringTrend: number;
  verified: boolean;
  isSynthetic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompanyDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    logoUrl: { type: String, default: '' },
    website: { type: String, default: '' },
    industry: { type: String, default: 'Technology', index: true },
    description: { type: String, default: '' },
    locations: [{ type: String }],
    activeJobCount: { type: Number, default: 0 },
    hiringTrend: { type: Number, default: 0 },
    verified: { type: Boolean, default: true },
    isSynthetic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CompanyModel = mongoose.model<ICompanyDocument>('Company', CompanySchema);
