'use client';

import React from 'react';
import { EmojiPicker as FrimoussePicker, useActiveEmoji } from 'frimousse';
import { Search, X, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

function ActiveEmojiBar() {
  const activeEmoji = useActiveEmoji();

  return (
    <div className="flex items-center gap-2 border-t border-border/60 bg-muted/20 px-3 py-1.5 min-h-[32px] text-xs">
      {activeEmoji ? (
        <>
          <span className="text-base leading-none">{activeEmoji.emoji}</span>
          <span className="truncate text-[11px] font-medium text-foreground/80 capitalize">
            {activeEmoji.label}
          </span>
        </>
      ) : (
        <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1.5">
          <Smile className="h-3 w-3" />
          <span>Choose an emoji…</span>
        </span>
      )}
    </div>
  );
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  return (
    <div
      className={cn(
        'w-[min(calc(100vw-32px),320px)] sm:w-80 rounded-2xl border border-border/80 bg-popover text-popover-foreground',
        'shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col',
        'animate-in fade-in-0 zoom-in-95 duration-150 z-50'
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <FrimoussePicker.Root
        onEmojiSelect={({ emoji }) => onSelect(emoji)}
        columns={8}
        className="flex flex-col h-80"
      >
        {/* Search & Header */}
        <div className="p-2.5 border-b border-border/60 flex items-center gap-2 bg-popover">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <FrimoussePicker.Search
            placeholder="Search all emojis…"
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            autoFocus
          />
          <FrimoussePicker.SkinToneSelector
            className="h-7 w-7 flex items-center justify-center rounded-lg text-sm hover:bg-muted transition-colors cursor-pointer shrink-0"
            title="Cycle skin tone"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer transition-colors"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Viewport & Virtualized Emoji List */}
        <FrimoussePicker.Viewport className="flex-1 overflow-y-auto overflow-x-hidden p-1.5 scrollbar-thin">
          <FrimoussePicker.Loading className="flex items-center justify-center h-full text-xs text-muted-foreground py-12">
            Loading emojis…
          </FrimoussePicker.Loading>

          <FrimoussePicker.Empty className="flex items-center justify-center h-full text-xs text-muted-foreground text-center py-12 px-4">
            No emojis found.
          </FrimoussePicker.Empty>

          <FrimoussePicker.List
            className="space-y-1"
            components={{
              CategoryHeader: ({ category, ...props }) => (
                <div
                  className="sticky top-0 z-10 bg-popover/95 backdrop-blur-md px-2 py-1 text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider select-none border-b border-border/20 mb-1"
                  {...props}
                >
                  {category.label}
                </div>
              ),
              Row: ({ children, ...props }) => (
                <div className="grid grid-cols-8 gap-0.5 px-1 py-0.5" {...props}>
                  {children}
                </div>
              ),
              Emoji: ({ emoji, ...props }) => (
                <button
                  type="button"
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg text-lg select-none transition-all cursor-pointer',
                    'hover:bg-muted hover:scale-115 active:scale-95',
                    emoji.isActive && 'bg-muted/80'
                  )}
                  title={emoji.label}
                  {...props}
                >
                  {emoji.emoji}
                </button>
              ),
            }}
          />
        </FrimoussePicker.Viewport>

        {/* Active Emoji Preview Footer */}
        <ActiveEmojiBar />
      </FrimoussePicker.Root>
    </div>
  );
}
