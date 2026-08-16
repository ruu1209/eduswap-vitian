import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';
import { chatService } from '../services/chat.service';
import { emitToChat, emitToUser } from '../sockets/io';

export const chatController = {
  start: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const chat = await chatService.start(req.user.id, req.body);
    sendSuccess(res, { statusCode: 201, message: 'Conversation ready', data: chat });
  }),

  list: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const chats = await chatService.listMine(req.user.id);
    sendSuccess(res, { data: chats });
  }),

  messages: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await chatService.getMessages(req.user.id, req.params.id, page, limit);
    sendSuccess(res, { data: result.items, meta: result.meta });
  }),

  send: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    const { message, recipientId } = await chatService.sendMessage(
      req.user.id,
      req.params.id,
      req.body.content,
    );

    // Live delivery: everyone in the chat room + the recipient's personal room.
    emitToChat(req.params.id, 'message:new', message);
    if (recipientId) emitToUser(recipientId, 'chat:updated', { chatId: req.params.id });

    sendSuccess(res, { statusCode: 201, message: 'Sent', data: message });
  }),

  markRead: asyncHandler(async (req, res) => {
    if (!req.user) throw AppError.unauthorized();
    await chatService.markRead(req.user.id, req.params.id);
    sendSuccess(res, { message: 'Marked as read' });
  }),
};
