import React, { useState } from 'react';
import { Send, Loader2, MessageSquare, Inbox } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { avatarUrl } from '@/lib/avatar';
import { cn } from '@/lib/utils';
import { getSocket } from '@/lib/socket';

interface ChatMessage {
  id: string;
  conversationId: string;
  clientId: string;
  lawyerId: string;
  senderId: string;
  senderRole: 'client' | 'lawyer';
  senderName: string;
  body: string;
  createdAt: string;
  read: boolean;
}

interface ClientConversation {
  lawyerId: string;
  lawyerName: string;
  lawyerAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: ChatMessage[];
}

const Messages = () => {
  const { token, user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [selectedLawyerId, setSelectedLawyerId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  const queryKey = ['clientMessages'];

  const { data: conversations, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch('/api/client/messages', {
        headers: token ? { authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        signOut();
        throw new Error('Session expired');
      }
      if (!res.ok) throw new Error(`Failed to load messages (HTTP ${res.status})`);
      return res.json() as Promise<ClientConversation[]>;
    },
    refetchInterval: token ? 30000 : false,
  });

  React.useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);
    if (!socket) return;
    const onNew = () => queryClient.invalidateQueries({ queryKey });
    socket.on('message:new', onNew);
    return () => { socket.off('message:new', onNew); };
  }, [token, queryClient]);

  const list = conversations ?? [];
  const active = list.find((c) => c.lawyerId === selectedLawyerId) ?? list[0] ?? null;
  const activeMessages = active?.messages ?? [];

  React.useEffect(() => {
    if (activeMessages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages.length, active?.lawyerId]);

  const handleSelect = async (lawyerId: string) => {
    setSelectedLawyerId(lawyerId);
    setDraft('');
    try {
      await fetch(`/api/messages/${lawyerId}`, {
        headers: token ? { authorization: `Bearer ${token}` } : {},
      });
      await queryClient.invalidateQueries({ queryKey });
    } catch {
      // the polling refetch clears the unread state on the next tick
    }
  };

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending || !active) return;
    setSending(true);
    try {
      const socket = token ? getSocket(token) : null;
      if (socket?.connected) {
        const ack: unknown = await new Promise((resolve) => {
          socket.emit('message:send', { lawyerId: active.lawyerId, body }, (res: unknown) => resolve(res));
          setTimeout(() => resolve({ error: 'timeout' }), 2500);
        });
        const ok = ack && typeof ack === 'object' && 'ok' in (ack as Record<string, unknown>) && (ack as { ok: boolean }).ok;
        if (ok) {
          setDraft('');
          await queryClient.invalidateQueries({ queryKey });
          return;
        }
      }
      const res = await fetch(`/api/messages/${active.lawyerId}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ body }),
      });
      if (res.status === 401) {
        signOut();
        return;
      }
      if (!res.ok) throw new Error(`Send failed (HTTP ${res.status})`);
      setDraft('');
      await queryClient.invalidateQueries({ queryKey });
    } catch {
      // keep draft so the client can retry
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="font-serif text-3xl font-bold">Messages</h2>
        <p className="text-gray-400 font-sans text-sm">Chats with lawyers you've contacted. Messages refresh automatically.</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
        {/* Conversation List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-0">
          <div className="p-4 border-b border-white/10 shrink-0">
            <h3 className="font-bold font-sans text-sm uppercase tracking-wider text-gray-400">Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
                <Inbox className="w-10 h-10 text-red-400" />
                <p className="text-sm text-red-400">Could not load messages. Please refresh.</p>
              </div>
            ) : list.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
                <Inbox className="w-10 h-10 text-gray-600" />
                <p className="text-sm text-gray-400">No conversations yet. Open a lawyer's profile and send them a message to start chatting.</p>
              </div>
            ) : (
              list.map((convo) => {
                const selected = active?.lawyerId === convo.lawyerId;
                return (
                  <button
                    key={convo.lawyerId}
                    onClick={() => handleSelect(convo.lawyerId)}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-4 text-left border-b border-white/5 transition-colors hover:bg-white/5",
                      selected && "bg-[#D4AF37]/10 hover:bg-[#D4AF37]/10"
                    )}
                  >
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8c7324] flex items-center justify-center font-serif font-bold text-[#102542] overflow-hidden shrink-0">
                      {convo.lawyerAvatar ? (
                        <img src={avatarUrl(convo.lawyerAvatar)} alt={convo.lawyerName} className="w-full h-full object-cover" />
                      ) : (
                        convo.lawyerName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-white truncate">{convo.lawyerName}</span>
                        <span className="text-[10px] text-gray-500 shrink-0">{formatTime(convo.lastMessageAt)}</span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{convo.lastMessage}</p>
                    </div>
                    {convo.unreadCount > 0 && (
                      <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-[#D4AF37] text-[#102542] text-[10px] font-bold flex items-center justify-center">
                        {convo.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-0">
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500 px-6 text-center">
              <MessageSquare className="w-12 h-12 text-gray-600" />
              <p className="text-sm">Select a conversation to view messages.</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-white/10 bg-[#0a1929] shrink-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8c7324] flex items-center justify-center font-serif font-bold text-[#102542] overflow-hidden shrink-0">
                  {active.lawyerAvatar ? (
                    <img src={avatarUrl(active.lawyerAvatar)} alt={active.lawyerName} className="w-full h-full object-cover" />
                  ) : (
                    active.lawyerName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{active.lawyerName}</h3>
                  <p className="text-xs text-gray-400 truncate">Advocate</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 scrollbar-hide">
                {activeMessages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-500 text-sm px-6 text-center">
                    No messages yet. Say hello to {active.lawyerName}.
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const mine = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5",
                          mine ? "bg-[#D4AF37] text-[#102542] rounded-br-md" : "bg-white/10 text-white rounded-bl-md"
                        )}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.body}</p>
                          <div className={cn("mt-1 text-[10px]", mine ? "text-[#102542]/60" : "text-gray-400")}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <div className="shrink-0 p-4 border-t border-white/10 bg-[#0a1929] flex items-end gap-3">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder={`Reply to ${active.lawyerName}...`}
                  className="flex-1 bg-white/5 border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-500 resize-none outline-none transition-colors max-h-32"
                />
                <button
                  onClick={handleSend}
                  disabled={!draft.trim() || sending}
                  className="shrink-0 bg-[#D4AF37] hover:bg-[#c4a133] disabled:opacity-40 text-[#102542] font-bold p-3.5 rounded-xl transition-all disabled:hover:bg-[#D4AF37]"
                  aria-label="Send reply"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;