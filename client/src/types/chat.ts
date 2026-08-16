export interface ChatParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
  college?: string;
}

export interface ChatMessage {
  id: string;
  chat: string;
  sender: { id: string; name: string; avatarUrl?: string };
  content: string;
  readBy?: string[];
  createdAt: string;
}

export interface ChatContext {
  id: string;
  title: string;
}

export interface ChatSummary {
  id: string;
  participants: ChatParticipant[];
  resource?: ChatContext | null;
  book?: ChatContext | null;
  lastMessage?: { content: string; createdAt: string } | null;
  lastMessageAt?: string | null;
}
