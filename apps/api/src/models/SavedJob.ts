import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedJobDocument extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: string;
  savedAt: Date;
  notes?: string;
  reminderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SavedJobSchema = new Schema<ISavedJobDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobId: { type: String, required: true, index: true },
    savedAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    reminderDate: { type: Date },
  },
  { timestamps: true }
);

SavedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const SavedJobModel = mongoose.model<ISavedJobDocument>('SavedJob', SavedJobSchema);
