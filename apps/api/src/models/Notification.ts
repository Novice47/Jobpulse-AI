import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'JOB_ALERT' | 'APPLICATION_REMINDER' | 'ROADMAP_UPDATE' | 'MARKET_ALERT';
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['JOB_ALERT', 'APPLICATION_REMINDER', 'ROADMAP_UPDATE', 'MARKET_ALERT'],
      default: 'JOB_ALERT',
    },
    read: { type: Boolean, default: false, index: true },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
