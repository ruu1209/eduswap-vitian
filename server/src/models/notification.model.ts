import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { baseSchemaOptions } from '../utils/mongoose';
import { NOTIFICATION_TYPES, type NotificationType } from '../utils/enums';

export interface INotification {
  recipient: Types.ObjectId;
  type: NotificationType;
  message: string;
  link?: string;
  isRead: boolean;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationDocument = HydratedDocument<INotification>;

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    link: { type: String, trim: true },
    isRead: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed },
  },
  baseSchemaOptions,
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);
