import { Types } from 'mongoose';
import { Chat } from '../models/chat.model';

interface Context {
  resource?: string;
  book?: string;
}

const PARTICIPANT_FIELDS = 'name avatarUrl college';

export const chatRepository = {
  async findOrCreate(userA: string, userB: string, context: Context) {
    const filter: Record<string, unknown> = { participants: { $all: [userA, userB] } };
    if (context.resource) filter.resource = context.resource;
    else if (context.book) filter.book = context.book;
    else {
      filter.resource = null;
      filter.book = null;
    }

    let chat = await Chat.findOne(filter);
    if (!chat) {
      chat = await Chat.create({
        participants: [new Types.ObjectId(userA), new Types.ObjectId(userB)],
        resource: context.resource ? new Types.ObjectId(context.resource) : null,
        book: context.book ? new Types.ObjectId(context.book) : null,
      });
    }
    return this.findById(chat._id.toString());
  },

  findById(id: string) {
    return Chat.findById(id)
      .populate('participants', PARTICIPANT_FIELDS)
      .populate('resource', 'title')
      .populate('book', 'title');
  },

  listByUser(userId: string) {
    return Chat.find({ participants: userId })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate('participants', PARTICIPANT_FIELDS)
      .populate('resource', 'title')
      .populate('book', 'title')
      .populate('lastMessage', 'content sender createdAt');
  },

  updateLastMessage(id: string, messageId: string) {
    return Chat.findByIdAndUpdate(id, {
      lastMessage: new Types.ObjectId(messageId),
      lastMessageAt: new Date(),
    });
  },
};
