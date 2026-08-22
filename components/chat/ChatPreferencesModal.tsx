'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { useUIStore, AccentColor, ChatDensity, FontSize, TimestampDisplay } from '@/lib/store/uiStore';
import {
  Palette,
  Volume2,
  VolumeX,
  Type,
  Maximize2,
  Clock,
  Check,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { playIncomingChime, playSendChime, primeAudioContext } from '@/lib/audio';

interface ChatPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT_COLORS: { id: AccentColor; name: string; bgClass: string }[] = [
  { id: 'blue', name: 'Sapphire', bgClass: 'bg-blue-600' },
  { id: 'emerald', name: 'Emerald', bgClass: 'bg-emerald-600' },
  { id: 'purple', name: 'Violet', bgClass: 'bg-purple-600' },
  { id: 'coral', name: 'Coral', bgClass: 'bg-orange-600' },
  { id: 'monochrome', name: 'Slate', bgClass: 'bg-slate-700' },
];

export function ChatPreferencesModal({ isOpen, onClose }: ChatPreferencesModalProps) {
  const {
    accentColor,
    density,
    fontSize,
    timestampDisplay,
    incomingSound,
    sentSound,
    setAccentColor,
    setDensity,
    setFontSize,
    setTimestampDisplay,
    setIncomingSound,
    setSentSound,
  } = useUIStore();

  const sentBgMap: Record<AccentColor, string> = {
    blue: 'bg-blue-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    purple: 'bg-violet-600 text-white',
    coral: 'bg-orange-600 text-white',
    monochrome: 'bg-zinc-800 text-white dark:bg-zinc-700',
  };

  const previewTooltipReceived = '10:41 AM';
  const previewTooltipSent = '10:42 AM · Sent';
  const previewInlineReceived = '2m ago';
  const previewInlineSent = 'Just now';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chat Appearance & Preferences"
      description="Personalize your workspace aesthetics, typography, density, timestamps, and sound cues."
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs text-foreground">
        {/* 1. ACCENT COLOR SWATCHES */}
        <div className="space-y-2">
          <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10.5px] flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-primary" />
            <span>Accent Theme</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {ACCENT_COLORS.map((c) => {
              const isSelected = accentColor === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setAccentColor(c.id)}
                  className={cn(
                    'flex items-center justify-center gap-2 py-2 px-2.5 rounded-xl border transition-all cursor-pointer select-none',
                    isSelected
                      ? 'border-primary bg-primary/10 text-foreground font-bold shadow-xs ring-1 ring-primary/40'
                      : 'border-border/70 bg-card/60 hover:bg-muted/60 text-muted-foreground'
                  )}
                >
                  <span className={cn('h-3.5 w-3.5 rounded-full shrink-0 shadow-xs flex items-center justify-center text-white text-[8px]', c.bgClass)}>
                    {isSelected && <Check className="h-2 w-2 stroke-[3]" />}
                  </span>
                  <span className="text-xs font-semibold">{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. COMPACT 2x2 SETTINGS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Density */}
          <div className="p-3 rounded-xl border border-border/70 bg-card/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <Maximize2 className="h-3.5 w-3.5 text-primary" />
                <span>Message Density</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-1 bg-muted/60 p-1 rounded-lg border border-border/50">
              <button
                type="button"
                onClick={() => setDensity('comfortable')}
                className={cn(
                  'py-1.5 px-2 rounded-md text-center font-semibold text-xs transition-all cursor-pointer',
                  density === 'comfortable'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Comfortable
              </button>
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={cn(
                  'py-1.5 px-2 rounded-md text-center font-semibold text-xs transition-all cursor-pointer',
                  density === 'compact'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Compact
              </button>
            </div>
          </div>

          {/* Font Scaling */}
          <div className="p-3 rounded-xl border border-border/70 bg-card/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5 text-primary" />
                <span>Font Scaling</span>
              </label>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-lg border border-border/50">
              {(['sm', 'md', 'lg'] as FontSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  className={cn(
                    'py-1.5 px-1 rounded-md text-center font-semibold text-xs transition-all cursor-pointer',
                    fontSize === size
                      ? 'bg-background text-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {size === 'sm' ? '13px' : size === 'md' ? '14px' : '15px'}
                </button>
              ))}
            </div>
          </div>

          {/* Timestamp Display Options */}
          <div className="p-3 rounded-xl border border-border/70 bg-card/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Inline Timestamp</span>
              </label>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-lg border border-border/50">
              <button
                type="button"
                onClick={() => setTimestampDisplay('last_only')}
                className={cn(
                  'py-1.5 px-1 rounded-md text-center font-semibold text-xs transition-all cursor-pointer',
                  timestampDisplay === 'last_only'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Show relative timestamp only on the last message (clean)"
              >
                Last Message
              </button>
              <button
                type="button"
                onClick={() => setTimestampDisplay('all')}
                className={cn(
                  'py-1.5 px-1 rounded-md text-center font-semibold text-xs transition-all cursor-pointer',
                  timestampDisplay === 'all'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Show relative timestamp on all message clusters"
              >
                All Messages
              </button>
              <button
                type="button"
                onClick={() => setTimestampDisplay('hidden')}
                className={cn(
                  'py-1.5 px-1 rounded-md text-center font-semibold text-xs transition-all cursor-pointer',
                  timestampDisplay === 'hidden'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Hide inline timestamps; view exact time on hover"
              >
                Hover Only
              </button>
            </div>
          </div>

          {/* Sound Effects */}
          <div className="p-3 rounded-xl border border-border/70 bg-card/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-primary" />
                <span>Sound Effects</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  primeAudioContext();
                  const next = !incomingSound;
                  setIncomingSound(next);
                  if (next) {
                    playIncomingChime();
                  }
                }}
                className={cn(
                  'py-1.5 px-2 rounded-lg border text-center text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5',
                  incomingSound
                    ? 'border-primary/40 bg-primary/10 text-primary font-bold shadow-xs'
                    : 'border-border/70 bg-muted/40 text-muted-foreground hover:bg-muted/60'
                )}
              >
                {incomingSound ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                <span>Incoming</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  primeAudioContext();
                  const next = !sentSound;
                  setSentSound(next);
                  if (next) {
                    playSendChime();
                  }
                }}
                className={cn(
                  'py-1.5 px-2 rounded-lg border text-center text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5',
                  sentSound
                    ? 'border-primary/40 bg-primary/10 text-primary font-bold shadow-xs'
                    : 'border-border/70 bg-muted/40 text-muted-foreground hover:bg-muted/60'
                )}
              >
                {sentSound ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                <span>Sent</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. LIVE PREVIEW WITH FAITHFUL REPLICA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10.5px] flex items-center gap-1.5">
              <span>Live Preview</span>
            </label>
            <span className="text-[10px] text-muted-foreground/70">
              Hover over bubbles to view exact time &amp; copy
            </span>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl border border-border/80 bg-background/60 shadow-xs space-y-3">
            {/* Received message */}
            <div className="group relative flex w-full justify-start items-end gap-2">
              <div className="relative flex flex-col max-w-[80%] sm:max-w-[70%] items-start">
                <Tooltip
                  content={
                    <div className="flex items-center gap-1.5 font-normal">
                      <span>{previewTooltipReceived}</span>
                    </div>
                  }
                  side="right"
                >
                  <div
                    className={cn(
                      'relative transition-colors break-words leading-relaxed select-text shadow-xs',
                      'rounded-2xl rounded-bl-xs bg-muted/70 dark:bg-muted/40 text-foreground border border-border/50 cursor-default',
                      density === 'compact' ? 'py-1.5 px-3' : 'py-2 px-3.5',
                      fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                    )}
                  >
                    <button
                      type="button"
                      className="absolute -top-3 -right-3 z-10 opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border shadow-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                      title="Copy message"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <p>Testing real-time message stream appearance.</p>
                  </div>
                </Tooltip>
                {/* Received message inline timestamp: Only shown if timestampDisplay is 'all' */}
                {timestampDisplay === 'all' && (
                  <span className="mt-0.5 text-[10px] font-mono text-muted-foreground/70 px-0.5">
                    {previewInlineReceived}
                  </span>
                )}
              </div>
            </div>

            {/* Sent message (Last message) */}
            <div className="group relative flex w-full justify-end items-end gap-2">
              <div className="relative flex flex-col max-w-[80%] sm:max-w-[70%] items-end">
                <Tooltip
                  content={
                    <div className="flex items-center gap-1.5 font-normal">
                      <span>{previewTooltipSent}</span>
                    </div>
                  }
                  side="left"
                >
                  <div
                    className={cn(
                      'relative transition-colors break-words leading-relaxed select-text shadow-xs',
                      'rounded-2xl rounded-br-xs cursor-default text-white',
                      sentBgMap[accentColor] || sentBgMap.blue,
                      density === 'compact' ? 'py-1.5 px-3' : 'py-2 px-3.5',
                      fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                    )}
                  >
                    <button
                      type="button"
                      className="absolute -top-3 -left-3 z-10 opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border shadow-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                      title="Copy message"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <p>Optimistic dispatch sends in &lt; 1ms!</p>
                  </div>
                </Tooltip>
                {/* Sent message inline timestamp: Shown if 'last_only' or 'all' */}
                {timestampDisplay !== 'hidden' && (
                  <span className="mt-0.5 text-[10px] font-mono text-muted-foreground/70 text-right px-0.5">
                    {previewInlineSent}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-[10.5px] text-muted-foreground font-mono">
            Auto-saved in <code className="text-primary font-bold">localStorage</code>
          </span>
          <Button onClick={onClose} className="rounded-xl text-xs font-bold px-6 h-8.5 cursor-pointer">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
