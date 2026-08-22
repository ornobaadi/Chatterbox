'use client';

import React, { useState } from 'react';
import { Message, DirectParticipant } from '@/lib/types';
import { useUIStore } from '@/lib/store/uiStore';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, Loader2, AlertCircle, RotateCw, Copy } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { toast } from 'sonner';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  isGroup: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  senderParticipant?: DirectParticipant;
  onRetry?: (message: Message) => void;
  onStartDirectChat?: (participant: DirectParticipant) => void;
}

function senderHue(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function MessageBubble({
  message,
  isMe,
  isGroup,
  isFirstInGroup,
  isLastInGroup,
  senderParticipant,
  onRetry,
  onStartDirectChat,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const { accentColor, density, fontSize } = useUIStore();

  const senderName = senderParticipant?.name || 'Participant';
  const status = message.status || 'sent';
  const hue = senderHue(message.sender || '');

  const formatTooltipTime = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    if (isToday(date)) {
      return format(date, 'h:mm a');
    }
    if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, yyyy · h:mm a');
  };

  const tooltipTime = formatTooltipTime(message.createdAt);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    toast.success('Copied to clipboard', { duration: 1200 });
    setTimeout(() => setCopied(false), 2000);
  };

  // Accent color mapping for sent bubbles
  const sentBg: Record<string, string> = {
    blue: 'bg-blue-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    purple: 'bg-violet-600 text-white',
    coral: 'bg-orange-600 text-white',
    monochrome: 'bg-zinc-800 text-white dark:bg-zinc-700',
  };

  const padding = density === 'compact' ? 'px-3 py-1.5' : 'px-3.5 py-2';
  const textSize = fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm';
  const clusterGap = isFirstInGroup
    ? density === 'compact' ? 'mt-2.5' : 'mt-3.5'
    : density === 'compact' ? 'mt-0.5' : 'mt-1';

  return (
    <div
      className={cn(
        'group relative flex w-full items-end gap-2 transition-all',
        isMe ? 'justify-end' : 'justify-start',
        clusterGap
      )}
    >
      {/* Avatar for received group messages */}
      {!isMe && isGroup && (
        <div className="w-7 shrink-0 self-end mb-0.5">
          {isLastInGroup ? (
            <button
              type="button"
              onClick={() => senderParticipant && onStartDirectChat?.(senderParticipant)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold select-none shadow-xs hover:scale-110 active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: `hsl(${hue}, 55%, 45%)` }}
              title={senderParticipant ? `Direct message ${senderName}` : senderName}
            >
              {senderName[0]?.toUpperCase()}
            </button>
          ) : (
            <div className="w-7" />
          )}
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={cn(
          'relative flex flex-col max-w-[75%] sm:max-w-[65%]',
          isMe ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender name for group chats - click to DM */}
        {!isMe && isGroup && isFirstInGroup && (
          <button
            type="button"
            onClick={() => senderParticipant && onStartDirectChat?.(senderParticipant)}
            className="mb-1 ml-1 text-xs font-semibold select-none hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors text-left"
            style={{ color: `hsl(${hue}, 60%, 45%)` }}
            title={senderParticipant ? `Click to direct message ${senderName}` : senderName}
          >
            <span>{senderName}</span>
          </button>
        )}

        {/* Message Bubble with Tooltip for Hover Timestamp */}
        <Tooltip
          content={
            <div className="flex items-center gap-1.5 font-normal">
              <span>{tooltipTime}</span>
              {isMe && (
                <span className="opacity-75">
                  {status === 'sending' && '· Sending...'}
                  {status === 'sent' && '· Sent'}
                  {status === 'failed' && '· Failed'}
                </span>
              )}
            </div>
          }
          side={isMe ? 'left' : 'right'}
        >
          <div
            className={cn(
              'relative transition-colors break-words leading-relaxed select-text shadow-xs',
              'rounded-2xl',
              isMe ? 'rounded-br-xs' : 'rounded-bl-xs',
              padding,
              textSize,
              isMe
                ? cn(sentBg[accentColor] || sentBg.blue)
                : 'bg-muted/70 dark:bg-muted/40 text-foreground border border-border/50',
              status === 'failed' && 'bg-destructive/10 border-destructive/40 text-destructive dark:text-red-300'
            )}
          >
            {/* Quick copy on hover */}
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                'absolute -top-3 z-10 opacity-0 group-hover:opacity-100',
                'flex h-6 w-6 items-center justify-center rounded-full',
                'bg-background border border-border shadow-xs',
                'text-muted-foreground hover:text-foreground transition-all duration-100 cursor-pointer',
                isMe ? '-left-3' : '-right-3'
              )}
              title="Copy message"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>

            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
        </Tooltip>

        {/* Status icon for sent message if failed or sending */}
        {isMe && status === 'sending' && (
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Sending…</span>
          </div>
        )}

        {/* Inline Retry Action for Failed Messages */}
        {isMe && status === 'failed' && (
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-xs text-destructive">Failed to send</span>
            <button
              type="button"
              onClick={() => onRetry?.(message)}
              className="inline-flex items-center gap-1 rounded-md border border-destructive/30 px-2 py-0.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <RotateCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
