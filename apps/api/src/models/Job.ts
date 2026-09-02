import mongoose, { Schema, Document } from 'mongoose';

export interface IJobDocument extends Document {
  externalId?: string;
  source: string;
  title: string;
  normalizedTitle: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  country: string;
  city: string;
  remoteType: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  postedDate: Date;
  closingDate?: Date;
  applicationUrl: string;
  status: 'ACTIVE' | 'CLOSED';
  isSynthetic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJobDocument>(
  {
    externalId: { type: String, index: true },
    source: { type: String, default: 'synthetic', index: true },
    title: { type: String, required: true },
    normalizedTitle: { type: String, required: true, index: true },
    companyId: { type: String, required: true, index: true },
    companyName: { type: String, required: true, index: true },
    companyLogo: { type: String, default: '' },
    location: { type: String, required: true, index: true },
    country: { type: String, default: 'India', index: true },
    city: { type: String, default: 'Bangalore', index: true },
    remoteType: { type: String, enum: ['REMOTE', 'HYBRID', 'ON_SITE'], required: true, index: true },
    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'],
      default: 'FULL_TIME',
      index: true,
    },
    salaryMin: { type: Number, index: true },
    salaryMax: { type: Number, index: true },
    salaryCurrency: { type: String, default: 'INR' },
    experienceLevel: {
      type: String,
      enum: ['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'],
      default: 'MID',
      index: true,
    },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    benefits: [{ type: String }],
    skills: [{ type: String, index: true }],
    postedDate: { type: Date, default: Date.now, index: true },
    closingDate: { type: Date },
    applicationUrl: { type: String, default: '#' },
    status: { type: String, enum: ['ACTIVE', 'CLOSED'], default: 'ACTIVE', index: true },
    isSynthetic: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

JobSchema.index({ title: 'text', description: 'text', skills: 'text' });

export const JobModel = mongoose.model<IJobDocument>('Job', JobSchema);
