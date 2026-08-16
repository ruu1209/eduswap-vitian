import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';
import { chatService } from '@/services/chatService';
import { getSocket } from '@/services/socket';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/utils/apiError';
import type { ChatMessage } from '@/types';

export function ChatThread({ chatId }: { chatId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => chatService.messages(chatId),
  });

  useEffect(() => {
    if (data) setMessages(data);
  }, [data]);

  // Join the chat room and append messages pushed live by the server.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('chat:join', chatId);
    const onNew = (msg: ChatMessage) => {
      if (msg.chat !== chatId) return;
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    };
    socket.on('message:new', onNew);
    return () => {
      socket.emit('chat:leave', chatId);
      socket.off('message:new', onNew);
    };
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useMutation({
    mutationFn: (content: string) => chatService.send(chatId, content),
    onSuccess: (msg) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not send')),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    send.mutate(trimmed);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          <>
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="ml-auto h-10 w-1/2" />
          </>
        ) : messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No messages yet. Say hello 👋
          </p>
        ) : (
          messages.map((m) => {
            const own = m.sender.id === user?.id;
            return (
              <div key={m.id} className={cn('flex', own ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                    own ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground',
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-border p-3">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
        <Button type="submit" size="icon" disabled={send.isPending || !text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
