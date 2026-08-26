import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Scale, Sparkles, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import FocusTrap from 'focus-trap-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ChatMsg = { id: string; role: 'user' | 'assistant'; text: string };

const SUGGESTIONS = [
  'जमानत कैसे मिलता है?',
  'तलाक कैसे दायर करें?',
  'उपभोक्ता शिकायत कैसे करें?',
  'BNS 103 क्या है?',
];

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const [messages, setMessages] = useState<ChatMsg[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      text: 'नमस्ते! 🙏 मैं NyayaConnect Support हूँ — भारतीय कानूनों (BNS, BNSS, संविधान आदि) के बारे में अंग्रेज़ी या हिंदी में कुछ भी पूछें। बोलने के लिए माइक दबाएँ। आज मैं आपकी कैसे मदद कर सकता हूँ?\n\n— यह सामान्य जानकारी है, कानूनी सलाह नहीं।',
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setMicSupported(!!SR);
    return () => {
      try { recognitionRef.current?.stop(); } catch {}
      try { window.speechSynthesis?.cancel(); } catch {}
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [open, messages, loading]);

  const speak = (text: string) => {
    if (!autoSpeak || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text.slice(0, 800));
      // Detect Hindi (Devanagari or common Hinglish) — pick hi-IN else en-IN
      const isHindi = /[\u0900-\u097F]/.test(text) || /\b(kya|hai|kaise|mujhe|hain|nahi|ke liye)\b/i.test(text);
      utter.lang = isHindi ? 'hi-IN' : 'en-IN';
      utter.rate = 1;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utter);
    } catch {}
  };

  const stopSpeaking = () => {
    try { window.speechSynthesis.cancel(); } catch {}
    setSpeaking(false);
  };

  const toggleMic = () => {
    if (listening) {
      try { recognitionRef.current?.stop(); } catch {}
      setListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error('Mic not supported in this browser. Use Chrome/Edge on HTTPS or localhost.');
      return;
    }
    if (!window.isSecureContext && location.hostname !== 'localhost') {
      toast.error('Mic needs HTTPS. Please open site via https://');
      return;
    }
    try {
      stopSpeaking();
      const rec = new SR();
      // en-IN handles Hinglish best; hi-IN also works for Devanagari
      rec.lang = 'en-IN';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.continuous = false;
      rec.onstart = () => setListening(true);
      rec.onend = () => setListening(false);
      rec.onerror = (e: any) => {
        setListening(false);
        const err = e?.error ?? 'unknown';
        if (err === 'not-allowed') toast.error('Mic permission denied. Allow microphone in browser.');
        else if (err !== 'aborted') toast.error(`Mic error: ${err}`);
      };
      rec.onresult = (e: any) => {
        const transcript = e.results?.[0]?.[0]?.transcript ?? '';
        if (transcript.trim()) {
          setInput(transcript);
          // auto-send voice input after short delay so user can edit if needed — we send immediately
          setTimeout(() => send(transcript), 300);
        }
      };
      recognitionRef.current = rec;
      rec.start();
    } catch {
      toast.error('Could not start microphone');
      setListening(false);
    }
  };

  const send = async (text: string = input) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: ChatMsg = { id: `u${Date.now()}`, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', text: m.text }));
      const res = await fetch('/api/chat/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      });
      const data = (await res.json()) as { reply?: string; message?: string; error?: string };
      if (!res.ok) {
        const msg = data.message ?? data.error ?? `Request failed (${res.status})`;
        throw new Error(msg);
      }
      const reply = data.reply?.trim() ?? 'Sorry, I could not generate a reply. Please try rephrasing.';
      setMessages((prev) => [...prev, { id: `a${Date.now()}`, role: 'assistant', text: reply }]);
      speak(reply);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get reply';
      const friendly =
        msg.includes('not_configured') || msg.includes('GEMINI_API_KEY') || msg.includes('not configured')
          ? 'Chat is not configured on the server. Admin: set GEMINI_API_KEY in backend/.env and restart.'
          : msg.includes('rate_limited')
            ? 'Too many messages — please wait a minute.'
            : msg.includes('provider_error') || msg.includes('rejected')
              ? 'AI provider error — check the Gemini API key (remove quotes) or try again.'
              : msg;
      setMessages((prev) => [...prev, { id: `e${Date.now()}`, role: 'assistant', text: `⚠️ ${friendly}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        aria-label={open ? 'Close support chat' : 'Open support chat'}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center justify-center transition-all duration-300',
          open ? 'bg-white text-[#102542] rotate-90' : 'bg-[#D4AF37] text-[#102542] hover:bg-[#c4a133] hover:scale-105'
        )}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>

      <AnimatePresence>
        {open && (
          <FocusTrap active={open} focusTrapOptions={{ fallbackFocus: () => document.body, clickOutsideDeactivates: true }}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              role="dialog"
              aria-modal="true"
              aria-label="NyayaConnect support chat"
              className="fixed z-50 flex flex-col overflow-hidden bg-[#0a1929] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] bottom-20 right-4 w-[92vw] max-w-[380px] h-[520px] max-h-[72vh] rounded-2xl md:rounded-2xl"
            >
            {/* Header */}
            <div className="shrink-0 bg-[#0a1929] border-b border-white/10 px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#D4AF37] flex items-center justify-center">
                <Scale className="w-5 h-5 text-[#102542]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                  NyayaConnect Support <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                </div>
                <div className="text-xs text-gray-400">Indian laws • English + Hindi • {micSupported ? 'Mic ready' : 'Mic unavailable'}</div>
              </div>
              <button
                onClick={() => {
                  if (speaking) stopSpeaking();
                  setAutoSpeak((v) => !v);
                }}
                title={autoSpeak ? 'Voice reply ON — tap to mute' : 'Voice reply OFF — tap to enable'}
                className={cn('w-8 h-8 rounded-full flex items-center justify-center transition-colors', autoSpeak ? 'bg-[#D4AF37] text-[#102542]' : 'hover:bg-white/10 text-gray-400 hover:text-white')}
              >
                {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 bg-[#102542] custom-scrollbar">
              {messages.map((m) => (
                <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
                      m.role === 'user'
                        ? 'bg-[#D4AF37] text-[#102542] rounded-br-md font-medium'
                        : 'bg-white/5 border border-white/10 text-gray-100 rounded-bl-md'
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-3.5 py-2.5 flex items-center gap-2 text-sm text-gray-300">
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> Typing...
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && !loading && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs bg-white/5 hover:bg-[#D4AF37]/15 border border-white/10 hover:border-[#D4AF37]/30 text-gray-300 hover:text-[#D4AF37] px-2.5 py-1 rounded-full transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="shrink-0 p-3 border-t border-white/10 bg-[#0a1929] flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={listening ? 'Listening... bolo' : 'English or Hindi me puchhiye...'}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:border-[#D4AF37]/40 focus:ring-1 focus:ring-[#D4AF37]/20"
              />
              <button
                onClick={toggleMic}
                title={micSupported ? (listening ? 'Stop listening' : 'Tap to speak (Hindi/English)') : 'Mic not supported'}
                disabled={!micSupported}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 border',
                  !micSupported
                    ? 'bg-white/5 text-gray-600 border-white/5 cursor-not-allowed'
                    : listening
                      ? 'bg-red-500 text-white border-red-500 animate-pulse'
                      : 'bg-white/10 hover:bg-white/15 text-gray-300 border-white/10'
                )}
                aria-label={listening ? 'Stop mic' : 'Start mic'}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-full bg-[#D4AF37] hover:bg-[#c4a133] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-[#102542] transition-colors shrink-0"
                aria-label="Send"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <div className="px-3 pb-2 text-[10px] text-center text-gray-500">
              {listening ? <span className="text-red-400 animate-pulse">● Listening — speak now (Hindi/English)</span> : speaking ? <span className="text-[#D4AF37]">● Speaking — tap speaker to mute</span> : 'AI can make mistakes. Verify with a verified advocate.'}
            </div>
          </motion.div>
          </FocusTrap>
        )}
      </AnimatePresence>
    </>
  );
}
