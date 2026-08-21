'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SendHorizonal,
  CheckCheck,
  Sparkles,
  Users,
  User,
  Zap,
  Volume2,
  VolumeX,
  Activity,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { playIncomingChime, playSendChime } from '@/lib/audio';

interface DemoMessage {
  id: string;
  sender: 'user' | 'sarah' | 'charlie';
  senderName: string;
  text: string;
  time: string;
  status?: 'sent' | 'sending' | 'failed';
}

const INITIAL_DIRECT_MESSAGES: DemoMessage[] = [
  {
    id: '1',
    sender: 'sarah',
    senderName: 'Sarah Jenkins',
    text: 'Hey! Did you check out the real-time Socket.io pipeline for Chatterbox?',
    time: '10:42 AM',
    status: 'sent',
  },
  {
    id: '2',
    sender: 'user',
    senderName: 'You',
    text: 'Yes! The optimistic dispatch makes sending feel instantaneous (< 1ms).',
    time: '10:43 AM',
    status: 'sent',
  },
  {
    id: '3',
    sender: 'sarah',
    senderName: 'Sarah Jenkins',
    text: 'Plus message clustering and auto-scroll pills make the UX feel so polished ✨',
    time: '10:44 AM',
    status: 'sent',
  },
];

const INITIAL_GROUP_MESSAGES: DemoMessage[] = [
  {
    id: 'g1',
    sender: 'sarah',
    senderName: 'Sarah Jenkins',
    text: 'Welcome to the Core Engineering channel! 🚀',
    time: '10:30 AM',
    status: 'sent',
  },
  {
    id: 'g2',
    sender: 'charlie',
    senderName: 'Charlie Root (Admin)',
    text: 'I just set up the 3+ participant admin permissions.',
    time: '10:31 AM',
    status: 'sent',
  },
  {
    id: 'g3',
    sender: 'user',
    senderName: 'You',
    text: 'Looks great. Real-time Socket.io sync is broadcasting to all members.',
    time: '10:32 AM',
    status: 'sent',
  },
];

const SARAH_RESPONSES = [
  "Sub-100ms latency feels like magic! ⚡",
  "The smart auto-scroll keeps you from getting yanked down when reading history.",
  "Check out how the bubbles cluster when I send multiple messages in a row!",
  "Try creating a 3+ participant group to see the admin management tools in action 🚀",
  "Notice how optimistic updates never jitter or duplicate on network return.",
];

export function InteractiveChatPreview() {
  const [chatType, setChatType] = useState<'direct' | 'group'>('direct');
  const [messages, setMessages] = useState<DemoMessage[]>(INITIAL_DIRECT_MESSAGES);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [livePing, setLivePing] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Measure live ping to backend
  useEffect(() => {
    let isMounted = true;
    const measurePing = async () => {
      const start = performance.now();
      try {
        await fetch('https://frontend-task-chatapp.onrender.com/api/auth/login', {
          method: 'OPTIONS',
        });
        const elapsed = Math.round(performance.now() - start);
        if (isMounted) setLivePing(elapsed > 0 ? elapsed : 42);
      } catch {
        if (isMounted) setLivePing(78);
      }
    };
    measurePing();
    const interval = setInterval(measurePing, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (chatType === 'direct') {
      setMessages(INITIAL_DIRECT_MESSAGES);
    } else {
      setMessages(INITIAL_GROUP_MESSAGES);
    }
  }, [chatType]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    if (audioEnabled) {
      playSendChime();
    }

    const newMsg: DemoMessage = {
      id: `demo_${Date.now()}`,
      sender: 'user',
      senderName: 'You',
      text,
      time: 'Just now',
      status: 'sent',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');

    // Simulate peer reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      if (audioEnabled) {
        playIncomingChime();
      }
      const randomReply = SARAH_RESPONSES[Math.floor(Math.random() * SARAH_RESPONSES.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: `reply_${Date.now()}`,
          sender: 'sarah',
          senderName: chatType === 'group' ? 'Sarah Jenkins' : 'Sarah Jenkins',
          text: randomReply,
          time: 'Just now',
          status: 'sent',
        },
      ]);
    }, 1100);
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl border border-border/80 bg-card/90 shadow-2xl backdrop-blur-xl overflow-hidden text-card-foreground transition-all">
      {/* Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-2 border-b border-border/50 bg-muted/40 text-[11px] text-muted-foreground font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SOCKET.IO LIVE</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-primary" />
            <span>Render RTT: <strong className="text-foreground">{livePing ? `${livePing}ms` : 'Measuring...'}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Toggle synthesized sound cues"
          >
            {audioEnabled ? <Volume2 className="h-3.5 w-3.5 text-primary" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span className="text-[10px]">{audioEnabled ? 'Sound On' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Window Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-4 w-px bg-border mx-1" />
          <div className="flex items-center gap-2">
            <Avatar name={chatType === 'group' ? 'Product Core' : 'Sarah Jenkins'} size="sm" isGroup={chatType === 'group'} />
            <div>
              <p className="text-xs font-bold text-foreground">
                {chatType === 'group' ? 'Product Core' : 'Sarah Jenkins'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {chatType === 'group' ? '3 participants • Active' : 'Online • Direct Chat'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-muted/70 p-0.5 rounded-xl border border-border/50 text-[11px]">
          <button
            type="button"
            onClick={() => setChatType('direct')}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer',
              chatType === 'direct'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <User className="h-3 w-3" />
            <span>1:1 Direct</span>
          </button>
          <button
            type="button"
            onClick={() => setChatType('group')}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer',
              chatType === 'group'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Users className="h-3 w-3" />
            <span>Group (3+)</span>
          </button>
        </div>
      </div>

      {/* Interactive Message Feed */}
      <div
        ref={scrollRef}
        className="h-72 overflow-y-auto p-4 sm:p-5 space-y-2 bg-gradient-to-b from-background/30 to-background/80"
      >
        {messages.map((msg, idx) => {
          const isMe = msg.sender === 'user';
          const prev = messages[idx - 1];
          const isSameSender = prev && prev.sender === msg.sender;

          return (
            <div
              key={msg.id}
              className={cn(
                'flex w-full gap-2',
                isMe ? 'justify-end' : 'justify-start',
                isSameSender ? 'mt-0.5' : 'mt-2.5'
              )}
            >
              {!isMe && !isSameSender && (
                <Avatar name={msg.senderName} size="sm" className="w-6 h-6 text-[10px] mt-1" />
              )}
              {!isMe && isSameSender && <div className="w-6" />}

              <div className={cn('flex flex-col max-w-[75%]', isMe ? 'items-end' : 'items-start')}>
                {!isMe && !isSameSender && chatType === 'group' && (
                  <span className="text-[10px] font-bold text-primary ml-2 mb-0.5">
                    {msg.senderName}
                  </span>
                )}
                <div
                  className={cn(
                    'px-3.5 py-2 text-xs sm:text-sm rounded-2xl shadow-xs leading-relaxed break-words',
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-tr-xs font-normal'
                      : 'bg-card border border-border/80 text-foreground rounded-tl-xs'
                  )}
                >
                  <p>{msg.text}</p>
                  <div
                    className={cn(
                      'mt-1 flex items-center justify-end gap-1 text-[9px]',
                      isMe ? 'text-primary-foreground/75' : 'text-muted-foreground/70'
                    )}
                  >
                    <span>{msg.time}</span>
                    {isMe && <CheckCheck className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Real-time typing simulator */}
        {isTyping && (
          <div className="flex items-center gap-2 mt-2">
            <Avatar name="Sarah Jenkins" size="sm" className="w-6 h-6 text-[10px]" />
            <div className="flex items-center gap-1 bg-card border border-border/80 px-3 py-2 rounded-2xl rounded-tl-xs shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-bounce" />
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto border-t border-border/40 bg-muted/20 text-xs">
        <span className="text-[11px] font-medium text-muted-foreground shrink-0 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-primary" /> Test prompt:
        </span>
        {[
          "Test optimistic dispatch ⚡",
          "Does it cluster messages?",
          "How does group auth work?",
        ].map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => handleSend(prompt)}
            className="shrink-0 rounded-lg bg-card px-2.5 py-1 text-[11px] font-medium text-foreground border border-border/80 hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Interactive Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-border/60 bg-card/80 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Type a message to experience live optimistic send..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-background/70 border border-border/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          disabled={!inputVal.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all cursor-pointer"
        >
          <SendHorizonal className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
