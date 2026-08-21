'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SendHorizonal, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageComposer({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageComposerProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = text.trim().length > 0 && !disabled;

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

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

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex flex-col p-3.5 bg-card/80 border-t border-border/70 backdrop-blur-md"
    >
      <div className="flex items-end gap-2.5 rounded-2xl border border-border/80 bg-background/60 p-1.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-xs">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 max-h-[140px] min-h-[38px] resize-none bg-transparent px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!canSend}
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-150',
            canSend
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:scale-105 active:scale-95 cursor-pointer'
              : 'bg-muted/70 text-muted-foreground/40 cursor-not-allowed border border-border/40'
          )}
          title={canSend ? 'Send message (Enter)' : 'Type a message to send'}
        >
          <SendHorizonal className="h-4 w-4" />
        </button>
      </div>

      {/* Keyboard Shortcut Hint */}
      <div className="flex items-center justify-between px-2 pt-1.5 text-[10.5px] text-muted-foreground/65 select-none">
        <span>
          <kbd className="font-mono rounded border border-border px-1 py-0.2 bg-muted/40 text-[10px]">Enter</kbd> to send, <kbd className="font-mono rounded border border-border px-1 py-0.2 bg-muted/40 text-[10px]">Shift + Enter</kbd> for new line
        </span>
      </div>
    </form>
  );
}
