import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { avatarUrl } from '@/lib/avatar';
import { cn } from '@/lib/utils';

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

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lawyerId: string;
  lawyerName: string;
  lawyerAvatar?: string | null;
}

const ChatDialog = ({ open, onOpenChange, lawyerId, lawyerName, lawyerAvatar }: ChatDialogProps) => {
  const { token, user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const queryKey = ['chat', lawyerId];

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/messages/${lawyerId}`, {
        headers: token ? { authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        signOut();
        throw new Error('Session expired');
      }
      if (!res.ok) throw new Error(`Failed to load messages (HTTP ${res.status})`);
      return res.json() as Promise<{ lawyer: { id: string; name: string; avatar: string }; messages: ChatMessage[] }>;
    },
    enabled: open && Boolean(token),
    refetchInterval: open && token ? 3000 : false,
  });

  const messages = data?.messages ?? [];

  useEffect(() => {
    if (open) setDraft('');
  }, [open]);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${lawyerId}`, {
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg h-[85dvh] sm:h-[600px] bg-[#0a1929] border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 px-5 py-4 border-b border-white/10 bg-[#102542] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8c7324] flex items-center justify-center overflow-hidden text-[#102542] font-serif font-bold">
                {lawyerAvatar ? <img src={avatarUrl(lawyerAvatar)} alt={lawyerName} className="w-full h-full object-cover" /> : lawyerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-bold text-white truncate">{lawyerName}</h3>
                <p className="text-xs text-[#D4AF37]">Advocate • Online</p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!user ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
                <LogIn className="w-10 h-10 text-[#D4AF37]" />
                <p className="text-gray-300 font-sans">Please log in to send a message to {lawyerName}.</p>
                <Link
                  to="/login"
                  onClick={() => onOpenChange(false)}
                  className="bg-[#D4AF37] hover:bg-[#c4a133] text-[#102542] font-bold px-6 py-2.5 rounded-xl transition-all"
                >
                  Log In
                </Link>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 scrollbar-hide">
                  {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                      <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
                    </div>
                  ) : isError ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                      Could not load messages. Please try again.
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500 text-sm px-6 text-center">
                      No messages yet. Say hello to {lawyerName} and start the conversation.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const mine = msg.senderId === user.id;
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

                {/* Input */}
                <div className="shrink-0 p-4 border-t border-white/10 bg-[#102542] flex items-end gap-3">
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
                    placeholder="Type your message..."
                    className="flex-1 bg-white/5 border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-500 resize-none outline-none transition-colors max-h-32"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!draft.trim() || sending}
                    className="shrink-0 bg-[#D4AF37] hover:bg-[#c4a133] disabled:opacity-40 text-[#102542] font-bold p-3.5 rounded-xl transition-all disabled:hover:bg-[#D4AF37]"
                    aria-label="Send message"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatDialog;