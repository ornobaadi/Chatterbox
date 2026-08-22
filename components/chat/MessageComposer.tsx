'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { EmojiPicker } from './EmojiPicker';
import { SendHorizonal, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { primeAudioContext } from '@/lib/audio';

interface MessageComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function MessageComposer({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  value: controlledValue,
  onChange: controlledOnChange,
}: MessageComposerProps) {
  const [internalText, setInternalText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiTriggerRef = useRef<HTMLDivElement>(null);
  const { accentColor } = useUIStore();

  const isControlled = controlledValue !== undefined;
  const text = isControlled ? controlledValue : internalText;

  const setText = (newText: string | ((prev: string) => string)) => {
    if (typeof newText === 'function') {
      const next = newText(text);
      if (isControlled) {
        controlledOnChange?.(next);
      } else {
        setInternalText(next);
      }
    } else {
      if (isControlled) {
        controlledOnChange?.(newText);
      } else {
        setInternalText(newText);
      }
    }
  };

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
    const handleOutsideClick = (e: MouseEvent) => {
      if (emojiTriggerRef.current && !emojiTriggerRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    if (showEmoji) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showEmoji]);

  const submit = () => {
    if (!canSend) return;
    const msg = text.trim();
    setText('');
    setShowEmoji(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onSend(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  const sendBtnColors: Record<string, string> = {
    blue: 'bg-blue-600 hover:bg-blue-500',
    emerald: 'bg-emerald-600 hover:bg-emerald-500',
    purple: 'bg-violet-600 hover:bg-violet-500',
    coral: 'bg-orange-600 hover:bg-orange-500',
    monochrome: 'bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600',
  };

  return (
    <div className="shrink-0 border-t border-border/60 bg-background/90 px-3 py-2.5 sm:px-4 relative">
      {/* Composer Container */}
      <div
        className={cn(
          'flex items-end gap-2 rounded-2xl border bg-card px-2.5 py-1.5 transition-all',
          'focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15',
          disabled ? 'opacity-60 pointer-events-none' : 'border-border/70'
        )}
      >
        {/* Emoji trigger & popover */}
        <div className="relative shrink-0" ref={emojiTriggerRef}>
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            disabled={disabled}
            className={cn(
              'mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground',
              'hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer',
              showEmoji && 'text-primary bg-primary/10'
            )}
            title="Add emoji"
          >
            <Smile className="h-5 w-5" />
          </button>

          {/* Render EmojiPicker anchored above the button */}
          {showEmoji && (
            <div className="absolute bottom-12 left-0 z-50">
              <EmojiPicker
                onSelect={handleSelectEmoji}
                onClose={() => setShowEmoji(false)}
              />
            </div>
          )}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={primeAudioContext}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 resize-none bg-transparent py-1.5 text-sm leading-relaxed text-foreground',
            'placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed',
            'max-h-[148px] scrollbar-none'
          )}
        />

        {/* Send button */}
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          className={cn(
            'mb-0.5 flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl text-white transition-all cursor-pointer',
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
      <p className="mt-1.5 text-center text-[11px] text-muted-foreground/60 select-none">
        <kbd className="font-mono text-[10px] bg-muted/60 px-1 py-0.5 rounded border border-border/50">Enter</kbd> to send · <kbd className="font-mono text-[10px] bg-muted/60 px-1 py-0.5 rounded border border-border/50">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
