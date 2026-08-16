import type { ChatSummary } from '@/types';

export function otherParticipant(chat: ChatSummary, userId?: string) {
  return chat.participants.find((p) => p.id !== userId) ?? chat.participants[0];
}

export function chatContextTitle(chat: ChatSummary): string | null {
  return chat.resource?.title ?? chat.book?.title ?? null;
}
