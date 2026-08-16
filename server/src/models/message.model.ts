import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { baseSchemaOptions } from '../utils/mongoose';

export interface IMessage {
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export type MessageDocument = HydratedDocument<IMessage>;

const messageSchema = new Schema<IMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 4000 },
    readBy: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
  },
  baseSchemaOptions,
);

// Fetch a conversation's messages in chronological order efficiently.
messageSchema.index({ chat: 1, createdAt: 1 });

export const Message = model<IMessage>('Message', messageSchema);
