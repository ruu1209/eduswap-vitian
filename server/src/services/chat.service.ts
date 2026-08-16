import { chatRepository } from '../repositories/chat.repository';
import { messageRepository } from '../repositories/message.repository';
import { userRepository } from '../repositories/user.repository';
import type { ChatDocument } from '../models/chat.model';
import type { MessageDocument } from '../models/message.model';
import { AppError } from '../utils/AppError';

interface StartChatInput {
  recipientId: string;
  resourceId?: string;
  bookId?: string;
}

async function assertParticipant(chatId: string, userId: string): Promise<ChatDocument> {
  const chat = await chatRepository.findById(chatId);
  if (!chat) throw AppError.notFound('Conversation not found');
  const isParticipant = chat.participants.some((p) => p._id.toString() === userId);
  if (!isParticipant) throw AppError.forbidden('You are not part of this conversation');
  return chat;
}

export const chatService = {
  async start(userId: string, input: StartChatInput) {
    if (input.recipientId === userId) throw AppError.badRequest('You cannot message yourself');

    const recipient = await userRepository.findById(input.recipientId);
    if (!recipient) throw AppError.notFound('Recipient not found');

    return chatRepository.findOrCreate(userId, input.recipientId, {
      resource: input.resourceId,
      book: input.bookId,
    });
  },

  listMine(userId: string) {
    return chatRepository.listByUser(userId);
  },

  async getMessages(userId: string, chatId: string, page: number, limit: number) {
    await assertParticipant(chatId, userId);
    await messageRepository.markRead(chatId, userId);
    const { items, total } = await messageRepository.listByChat(chatId, page, limit);
    return { items, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  },

  async sendMessage(
    userId: string,
    chatId: string,
    content: string,
  ): Promise<{ message: MessageDocument; recipientId: string }> {
    const chat = await assertParticipant(chatId, userId);
    const message = await messageRepository.create(chatId, userId, content);
    await chatRepository.updateLastMessage(chatId, message._id.toString());

    const other = chat.participants.find((p) => p._id.toString() !== userId);
    return { message, recipientId: other?._id.toString() ?? '' };
  },

  async markRead(userId: string, chatId: string): Promise<void> {
    await assertParticipant(chatId, userId);
    await messageRepository.markRead(chatId, userId);
  },
};
