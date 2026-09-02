import mongoose, { Schema, Document } from 'mongoose';

export interface IApplicationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  location?: string;
  salaryOffered?: number;
  status: 'SAVED' | 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  appliedDate: Date;
  notes?: string;
  interviewDates?: string[];
  contactEmail?: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplicationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobId: { type: String, required: true, index: true },
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    companyLogo: { type: String, default: '' },
    location: { type: String, default: '' },
    salaryOffered: { type: Number },
    status: {
      type: String,
      enum: ['SAVED', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'],
      default: 'SAVED',
      index: true,
    },
    appliedDate: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    interviewDates: [{ type: String }],
    contactEmail: { type: String, default: '' },
    followUpDate: { type: Date },
  },
  { timestamps: true }
);

export const ApplicationModel = mongoose.model<IApplicationDocument>('Application', ApplicationSchema);
