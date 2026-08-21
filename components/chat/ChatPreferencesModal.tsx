'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useUIStore, AccentColor, ChatDensity, FontSize, TimestampFormat } from '@/lib/store/uiStore';
import {
  Palette,
  Volume2,
  VolumeX,
  Type,
  Maximize2,
  Clock,
  Check,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { playIncomingChime, playSendChime } from '@/lib/audio';

interface ChatPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCENT_COLORS: { id: AccentColor; name: string; bgClass: string; ringColor: string }[] = [
  { id: 'blue', name: 'Sapphire', bgClass: 'bg-blue-600', ringColor: 'ring-blue-500' },
  { id: 'emerald', name: 'Emerald', bgClass: 'bg-emerald-600', ringColor: 'ring-emerald-500' },
  { id: 'purple', name: 'Violet', bgClass: 'bg-purple-600', ringColor: 'ring-purple-500' },
  { id: 'coral', name: 'Coral', bgClass: 'bg-orange-600', ringColor: 'ring-orange-500' },
  { id: 'monochrome', name: 'Slate', bgClass: 'bg-slate-700', ringColor: 'ring-slate-500' },
];

export function ChatPreferencesModal({ isOpen, onClose }: ChatPreferencesModalProps) {
  const {
    accentColor,
    density,
    fontSize,
    timestampFormat,
    incomingSound,
    sentSound,
    setAccentColor,
    setDensity,
    setFontSize,
    setTimestampFormat,
    setIncomingSound,
    setSentSound,
  } = useUIStore();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chat Appearance & Preferences"
      description="Personalize your workspace aesthetics, typography, density, and sound cues."
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs text-foreground">
        {/* 1. ACCENT COLOR SWATCHES */}
        <div className="space-y-2">
          <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10.5px] flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-primary" />
            <span>Accent Theme</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
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

          {/* Timestamp Format */}
          <div className="p-3 rounded-xl border border-border/70 bg-card/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Timestamp Format</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-1 bg-muted/60 p-1 rounded-lg border border-border/50">
              <button
                type="button"
                onClick={() => setTimestampFormat('absolute')}
                className={cn(
                  'py-1.5 px-2 rounded-md text-center font-semibold text-xs transition-all cursor-pointer',
                  timestampFormat === 'absolute'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Exact (10:42 AM)
              </button>
              <button
                type="button"
                onClick={() => setTimestampFormat('relative')}
                className={cn(
                  'py-1.5 px-2 rounded-md text-center font-semibold text-xs transition-all cursor-pointer',
                  timestampFormat === 'relative'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Relative (5m ago)
              </button>
            </div>
          </div>

          {/* Web Audio Cues */}
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
                  const next = !incomingSound;
                  setIncomingSound(next);
                  if (next) playIncomingChime();
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
                  const next = !sentSound;
                  setSentSound(next);
                  if (next) playSendChime();
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

        {/* 3. COMPACT LIVE PREVIEW */}
        <div className="space-y-1.5">
          <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10.5px] flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Live Preview</span>
          </label>

          <div className="p-3.5 rounded-xl border border-border/80 bg-background/60 shadow-xs space-y-2">
            {/* Received message */}
            <div className="flex justify-start">
              <div
                className={cn(
                  'rounded-2xl rounded-tl-xs bg-card border border-border/80 text-foreground shadow-xs leading-relaxed max-w-[75%]',
                  density === 'compact' ? 'py-1 px-3' : 'py-1.5 px-3.5',
                  fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                )}
              >
                <p>Testing real-time message stream appearance.</p>
                <span className="text-[9.5px] text-muted-foreground mt-0.5 block">
                  {timestampFormat === 'absolute' ? '10:41 AM' : '2m ago'}
                </span>
              </div>
            </div>

            {/* Sent message */}
            <div className="flex justify-end">
              <div
                className={cn(
                  'rounded-2xl rounded-tr-xs text-white shadow-xs leading-relaxed max-w-[75%]',
                  accentColor === 'blue' && 'bg-blue-600',
                  accentColor === 'emerald' && 'bg-emerald-600',
                  accentColor === 'purple' && 'bg-purple-600',
                  accentColor === 'coral' && 'bg-orange-600',
                  accentColor === 'monochrome' && 'bg-slate-700',
                  density === 'compact' ? 'py-1 px-3' : 'py-1.5 px-3.5',
                  fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                )}
              >
                <p>Optimistic dispatch sends in &lt; 1ms!</p>
                <span className="text-[9.5px] opacity-80 mt-0.5 block text-right font-mono">
                  {timestampFormat === 'absolute' ? '10:42 AM' : 'Just now'} • ✓✓
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-[10.5px] text-muted-foreground font-mono">
            Auto-saved in <code className="text-primary font-bold">localStorage</code>
          </span>
          <Button onClick={onClose} className="rounded-xl text-xs font-bold px-6 h-8.5">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
