import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { chatPath } from '@/utils/constants';
import { otherParticipant, chatContextTitle } from '@/features/chat/helpers';
import type { ChatSummary } from '@/types';

interface ChatListProps {
  chats: ChatSummary[];
  activeId?: string;
  userId?: string;
}

export function ChatList({ chats, activeId, userId }: ChatListProps) {
  if (chats.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>;
  }
  return (
    <ul className="divide-y divide-border">
      {chats.map((chat) => {
        const other = otherParticipant(chat, userId);
        const context = chatContextTitle(chat);
        return (
          <li key={chat.id}>
            <Link
              to={chatPath(chat.id)}
              className={cn(
                'block px-4 py-3 transition-colors hover:bg-secondary',
                activeId === chat.id && 'bg-secondary',
              )}
            >
              <p className="font-medium">{other?.name ?? 'Unknown'}</p>
              {context && <p className="truncate text-xs text-primary">Re: {context}</p>}
              {chat.lastMessage && (
                <p className="truncate text-sm text-muted-foreground">{chat.lastMessage.content}</p>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
