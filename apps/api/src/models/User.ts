import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  githubId?: string;
  googleId?: string;
  passwordHash?: string;
  email: string;
  name: string;
  username: string;
  avatar: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    githubId: { type: String, index: true },
    googleId: { type: String, index: true },
    passwordHash: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    username: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
