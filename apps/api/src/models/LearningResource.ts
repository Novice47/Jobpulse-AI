import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningResourceDocument extends Document {
  title: string;
  provider: string;
  url: string;
  skills: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  format: 'COURSE' | 'ARTICLE' | 'VIDEO' | 'BOOK';
  isFree: boolean;
  duration?: string;
  verified: boolean;
  createdAt: Date;
}

const LearningResourceSchema = new Schema<ILearningResourceDocument>(
  {
    title: { type: String, required: true },
    provider: { type: String, required: true },
    url: { type: String, required: true },
    skills: [{ type: String, index: true }],
    difficulty: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER' },
    format: { type: String, enum: ['COURSE', 'ARTICLE', 'VIDEO', 'BOOK'], default: 'COURSE' },
    isFree: { type: Boolean, default: true },
    duration: { type: String, default: '10 hours' },
    verified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const LearningResourceModel = mongoose.model<ILearningResourceDocument>('LearningResource', LearningResourceSchema);
