import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessagesSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';
import { ChatList } from '@/features/chat/ChatList';
import { ChatThread } from '@/features/chat/ChatThread';
import { otherParticipant, chatContextTitle } from '@/features/chat/helpers';
import { chatService } from '@/services/chatService';
import { getSocket } from '@/services/socket';
import { useAuth } from '@/context/AuthContext';

export function ChatPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: chats, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatService.list(),
  });

  // Refresh the conversation list when the server signals an update.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onUpdate = () => queryClient.invalidateQueries({ queryKey: ['chats'] });
    socket.on('chat:updated', onUpdate);
    return () => {
      socket.off('chat:updated', onUpdate);
    };
  }, [queryClient]);

  const active = chats?.find((c) => c.id === id);
  const activeOther = active ? otherParticipant(active, user?.id) : undefined;
  const activeContext = active ? chatContextTitle(active) : null;

  return (
    <div className="grid h-[calc(100vh-11rem)] grid-cols-1 overflow-hidden rounded-lg border border-border md:grid-cols-[320px_1fr]">
      <aside className={cn('overflow-y-auto border-r border-border', id && 'hidden md:block')}>
        <div className="border-b border-border p-4">
          <h1 className="font-display text-lg font-semibold">Messages</h1>
        </div>
        {isLoading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <ChatList chats={chats ?? []} activeId={id} userId={user?.id} />
        )}
      </aside>

      <section className={cn('flex flex-col', !id && 'hidden md:flex')}>
        {id ? (
          <>
            <div className="border-b border-border p-4">
              <p className="font-medium">{activeOther?.name ?? 'Conversation'}</p>
              {activeContext && <p className="text-xs text-primary">Re: {activeContext}</p>}
            </div>
            <ChatThread chatId={id} />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
            <MessagesSquare className="mb-2 h-8 w-8" />
            <p className="text-sm">Select a conversation to start chatting.</p>
          </div>
        )}
      </section>
    </div>
  );
}
