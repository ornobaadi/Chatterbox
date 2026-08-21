'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { SendHorizonal, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const EMOJI_PALETTE = ['😊', '👍', '❤️', '🔥', '🎉', '😂', '🚀', '✨', '👏', '💯', '🙌', '😅'];

export function MessageComposer({ onSend, disabled = false, placeholder = 'Type a message...' }: MessageComposerProps) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const { accentColor } = useUIStore();

  const canSend = text.trim().length > 0 && !disabled;

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 148)}px`;
    }
  }, [text]);

  // Close emoji on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    if (showEmoji) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showEmoji]);

  const submit = () => {
    if (!canSend) return;
    const msg = text.trim();
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    onSend(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const insertEmoji = (emoji: string) => {
    setText(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  const sendBtnColors: Record<string, string> = {
    blue:       'bg-blue-600 hover:bg-blue-500',
    emerald:    'bg-emerald-600 hover:bg-emerald-500',
    purple:     'bg-violet-600 hover:bg-violet-500',
    coral:      'bg-orange-600 hover:bg-orange-500',
    monochrome: 'bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600',
  };

  return (
    <div className="shrink-0 border-t border-border/60 bg-background/90 px-3 py-2.5 sm:px-4">
      {/* Composer box */}
      <div className={cn(
        'flex items-end gap-1.5 rounded-2xl border bg-card px-2 py-1.5 transition-all',
        'focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15',
        disabled ? 'opacity-60 pointer-events-none' : 'border-border/70'
      )}>

        {/* Emoji picker trigger */}
        <div className="relative" ref={emojiRef}>
          <button
            type="button"
            onClick={() => setShowEmoji(v => !v)}
            disabled={disabled}
            className={cn(
              'mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground',
              'hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer',
              showEmoji && 'text-primary bg-primary/10'
            )}
            title="Emoji"
          >
            <Smile className="h-[18px] w-[18px]" />
          </button>

          {showEmoji && (
            <div className="absolute bottom-11 left-0 z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="grid grid-cols-4 gap-0.5 rounded-2xl border border-border/80 bg-popover p-2 shadow-xl backdrop-blur-md">
                {EMOJI_PALETTE.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-lg hover:bg-muted hover:scale-110 transition-all cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 resize-none bg-transparent py-1.5 text-sm leading-relaxed text-foreground',
            'placeholder:text-muted-foreground/50 focus:outline-none disabled:cursor-not-allowed',
            'max-h-[148px] scrollbar-none'
          )}
        />

        {/* Send button */}
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          className={cn(
            'mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white transition-all cursor-pointer',
            canSend
              ? cn('shadow-sm active:scale-95', sendBtnColors[accentColor] || sendBtnColors.blue)
              : 'bg-muted text-muted-foreground/40 cursor-not-allowed'
          )}
          title="Send (Enter)"
        >
          <SendHorizonal className="h-4 w-4" />
        </button>
      </div>

      {/* Shortcut hint */}
      <p className="mt-1.5 text-center text-[10px] text-muted-foreground/50 select-none">
        <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
