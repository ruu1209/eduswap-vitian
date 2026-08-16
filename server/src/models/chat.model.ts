import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { baseSchemaOptions } from '../utils/mongoose';

export interface IChat {
  participants: Types.ObjectId[]; // exactly two users
  resource?: Types.ObjectId | null; // optional context: a resource
  book?: Types.ObjectId | null; // ...or a book being negotiated
  lastMessage?: Types.ObjectId | null;
  lastMessageAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ChatDocument = HydratedDocument<IChat>;

const chatSchema = new Schema<IChat>(
  {
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      required: true,
      validate: {
        validator: (v: Types.ObjectId[]) => v.length === 2,
        message: 'A chat must have exactly two participants',
      },
    },
    resource: { type: Schema.Types.ObjectId, ref: 'Resource', default: null },
    book: { type: Schema.Types.ObjectId, ref: 'Book', default: null },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
    lastMessageAt: { type: Date, default: null },
  },
  baseSchemaOptions,
);

chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });

export const Chat = model<IChat>('Chat', chatSchema);
