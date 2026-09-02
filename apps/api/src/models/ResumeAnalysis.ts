import mongoose, { Schema, Document } from 'mongoose';

export interface IResumeAnalysisDocument extends Document {
  userId: mongoose.Types.ObjectId;
  uploadedAt: Date;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  rawText?: string;
  fileData?: string; // Base64 encoded file data stored in MongoDB
  extractedName?: string;
  education: string[];
  experience: string[];
  extractedSkills: string[];
  roleAlignmentScore: number;
  missingSkills: string[];
  suggestions: string[];
  atsScore: number;
  isSynthetic: boolean;
  createdAt: Date;
}

const ResumeAnalysisSchema = new Schema<IResumeAnalysisDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    uploadedAt: { type: Date, default: Date.now },
    fileName: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: '' },
    rawText: { type: String, default: '' },
    fileData: { type: String, default: '' },
    extractedName: { type: String, default: '' },
    education: [{ type: String }],
    experience: [{ type: String }],
    extractedSkills: [{ type: String }],
    roleAlignmentScore: { type: Number, default: 0 },
    missingSkills: [{ type: String }],
    suggestions: [{ type: String }],
    atsScore: { type: Number, default: 0 },
    isSynthetic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ResumeAnalysisModel = mongoose.model<IResumeAnalysisDocument>('ResumeAnalysis', ResumeAnalysisSchema);
