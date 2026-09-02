import mongoose, { Schema, Document } from 'mongoose';

export interface IRoleDocument extends Document {
  title: string;
  slug: string;
  category: string;
  demandCount: number;
  avgSalary: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRoleDocument>(
  {
    title: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, default: 'Engineering', index: true },
    demandCount: { type: Number, default: 0, index: true },
    avgSalary: { type: Number, default: 0 },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export const RoleModel = mongoose.model<IRoleDocument>('Role', RoleSchema);
