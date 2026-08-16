import { Types } from 'mongoose';
import { Message } from '../models/message.model';

const SENDER_FIELDS = 'name avatarUrl';

export const messageRepository = {
  async create(chatId: string, senderId: string, content: string) {
    const message = await Message.create({
      chat: new Types.ObjectId(chatId),
      sender: new Types.ObjectId(senderId),
      content,
      readBy: [new Types.ObjectId(senderId)],
    });
    return message.populate('sender', SENDER_FIELDS);
  },

  async listByChat(chatId: string, page: number, limit: number) {
    // Fetch newest first for pagination, then return in chronological order.
    const [items, total] = await Promise.all([
      Message.find({ chat: chatId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('sender', SENDER_FIELDS),
      Message.countDocuments({ chat: chatId }),
    ]);
    return { items: items.reverse(), total };
  },

  markRead(chatId: string, userId: string) {
    return Message.updateMany(
      { chat: chatId, sender: { $ne: userId }, readBy: { $ne: userId } },
      { $addToSet: { readBy: new Types.ObjectId(userId) } },
    );
  },
};
