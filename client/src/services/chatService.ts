import { apiClient } from './apiClient';
import type { ApiSuccess, ChatMessage, ChatSummary } from '@/types';

export interface StartChatInput {
  recipientId: string;
  resourceId?: string;
  bookId?: string;
}

export const chatService = {
  async start(input: StartChatInput): Promise<ChatSummary> {
    const { data } = await apiClient.post<ApiSuccess<ChatSummary>>('/chats', input);
    return data.data;
  },

  async list(): Promise<ChatSummary[]> {
    const { data } = await apiClient.get<ApiSuccess<ChatSummary[]>>('/chats');
    return data.data;
  },

  async messages(chatId: string): Promise<ChatMessage[]> {
    const { data } = await apiClient.get<ApiSuccess<ChatMessage[]>>(`/chats/${chatId}/messages`);
    return data.data;
  },

  async send(chatId: string, content: string): Promise<ChatMessage> {
    const { data } = await apiClient.post<ApiSuccess<ChatMessage>>(`/chats/${chatId}/messages`, { content });
    return data.data;
  },

  async markRead(chatId: string): Promise<void> {
    await apiClient.post(`/chats/${chatId}/read`);
  },
};
