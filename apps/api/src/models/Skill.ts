import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillDocument extends Document {
  name: string;
  slug: string;
  category: string;
  demandCount: number;
  growthRate: number;
  aliases: string[];
  isSynthetic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkillDocument>(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: { type: String, default: 'Engineering', index: true },
    demandCount: { type: Number, default: 0, index: true },
    growthRate: { type: Number, default: 0, index: true },
    aliases: [{ type: String, index: true }],
    isSynthetic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SkillModel = mongoose.model<ISkillDocument>('Skill', SkillSchema);
