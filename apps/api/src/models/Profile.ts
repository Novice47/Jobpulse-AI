import mongoose, { Schema, Document } from 'mongoose';

export interface IProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  username: string;
  avatar: string;
  education: string;
  degree: string;
  graduationYear?: number;
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  currentRole: string;
  targetRoles: string[];
  skills: string[];
  preferredLocations: string[];
  remotePreference: 'REMOTE' | 'HYBRID' | 'ON_SITE' | 'ANY';
  salaryExpectation: number;
  industries: string[];
  yearsOfExperience: number;
  profileVisibility: 'PUBLIC' | 'PRIVATE';
  profileCompleteness: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    name: { type: String, required: true },
    username: { type: String, default: '' },
    avatar: { type: String, default: '' },
    education: { type: String, default: '' },
    degree: { type: String, default: '' },
    graduationYear: { type: Number },
    experienceLevel: {
      type: String,
      enum: ['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'],
      default: 'MID',
    },
    currentRole: { type: String, default: '' },
    targetRoles: [{ type: String }],
    skills: [{ type: String, index: true }],
    preferredLocations: [{ type: String }],
    remotePreference: {
      type: String,
      enum: ['REMOTE', 'HYBRID', 'ON_SITE', 'ANY'],
      default: 'ANY',
    },
    salaryExpectation: { type: Number, default: 0 },
    industries: [{ type: String }],
    yearsOfExperience: { type: Number, default: 0 },
    profileVisibility: { type: String, enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' },
    profileCompleteness: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ProfileModel = mongoose.model<IProfileDocument>('Profile', ProfileSchema);
