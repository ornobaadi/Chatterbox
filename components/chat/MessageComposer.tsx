'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { SendHorizonal, Smile, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MessageComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const COMMON_EMOJIS = ['😊', '🔥', '❤️', '🎉', '🚀', '✨', '👍', '😂', '👏', '👀', '💯', '🙌'];

export function MessageComposer({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageComposerProps) {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const { accentColor } = useUIStore();

  const canSend = text.trim().length > 0 && !disabled;

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canSend) return;

    const messageToSend = text.trim();
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onSend(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    setText((prev) => `${prev}${emoji}`);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleAttachPlaceholder = () => {
    toast.info('File attachments simulated for demo.', { duration: 2000 });
  };

  const sendButtonColors: Record<string, string> = {
    blue: 'bg-primary text-primary-foreground shadow-primary/25',
    emerald: 'bg-emerald-600 text-white shadow-emerald-600/25',
    purple: 'bg-purple-600 text-white shadow-purple-600/25',
    coral: 'bg-orange-600 text-white shadow-orange-600/25',
    monochrome: 'bg-slate-800 text-white shadow-slate-800/25 dark:bg-slate-700',
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex flex-col p-3 sm:p-4 bg-card/85 border-t border-border/70 backdrop-blur-md transition-all"
    >
      {/* COMPOSER BAR */}
      <div className="relative flex items-end gap-2 rounded-2xl border border-border/80 bg-background/70 p-1.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-xs">
        {/* Emoji Trigger */}
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={cn(
              'h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer',
              showEmojiPicker && 'text-primary bg-primary/10'
            )}
            title="Emoji palette"
          >
            <Smile className="h-4 w-4" />
          </button>

          {/* Emoji Popover Palette */}
          {showEmojiPicker && (
            <div className="absolute bottom-11 left-0 z-30 grid grid-cols-4 gap-1 p-2 rounded-2xl border border-border/80 bg-popover/95 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 w-44">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    handleInsertEmoji(emoji);
                  }}
                  className="h-8 w-8 text-base flex items-center justify-center rounded-lg hover:bg-muted hover:scale-115 transition-all cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Attachment Trigger */}
        <button
          type="button"
          onClick={handleAttachPlaceholder}
          className="h-9 w-9 hidden sm:flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
          title="Attach file / image"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        {/* Auto-Expanding Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 max-h-[160px] min-h-[38px] resize-none bg-transparent px-2 py-2 text-xs sm:text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!canSend}
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-150',
            canSend
              ? cn('shadow-md hover:scale-105 active:scale-95 cursor-pointer font-bold', sendButtonColors[accentColor] || sendButtonColors.blue)
              : 'bg-muted/70 text-muted-foreground/40 cursor-not-allowed border border-border/40'
          )}
          title={canSend ? 'Send message (Enter)' : 'Type a message to send'}
        >
          <SendHorizonal className="h-4 w-4" />
        </button>
      </div>

      {/* Keyboard Shortcut Hint & Character count */}
      <div className="flex items-center justify-between px-2 pt-1.5 text-[10px] text-muted-foreground/70 select-none">
        <span>
          <kbd className="font-mono rounded border border-border px-1 py-0.2 bg-muted/40 text-[9.5px]">Enter</kbd> to send, <kbd className="font-mono rounded border border-border px-1 py-0.2 bg-muted/40 text-[9.5px]">Shift + Enter</kbd> for new line
        </span>
        {text.length > 0 && (
          <span className="font-mono text-[10px] opacity-70">
            {text.length} chars
          </span>
        )}
      </div>
    </form>
  );
}
