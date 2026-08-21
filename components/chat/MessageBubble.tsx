'use client';

import React, { useState } from 'react';
import { Message, DirectParticipant } from '@/lib/types';
import { Avatar } from '@/components/ui/avatar';
import { useUIStore } from '@/lib/store/uiStore';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, Loader2, AlertCircle, RotateCw, Copy } from 'lucide-react';
import { format, isToday, isYesterday, formatDistanceToNowStrict } from 'date-fns';
import { toast } from 'sonner';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  isGroup: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  senderParticipant?: DirectParticipant;
  onRetry?: (message: Message) => void;
}

export function MessageBubble({
  message,
  isMe,
  isGroup,
  isFirstInGroup,
  isLastInGroup,
  senderParticipant,
  onRetry,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const {
    accentColor,
    density,
    fontSize,
    timestampFormat,
  } = useUIStore();

  const senderName = senderParticipant?.name || 'Participant';
  const status = message.status || 'sent';

  // Format time based on user preference
  const formatDisplayTime = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    if (timestampFormat === 'relative') {
      try {
        return `${formatDistanceToNowStrict(date)} ago`;
      } catch {
        return 'Just now';
      }
    }

    if (isToday(date)) {
      return format(date, 'h:mm a');
    }
    if (isYesterday(date)) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, h:mm a');
  };

  const timeFormatted = formatDisplayTime(message.createdAt);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    toast.success('Message copied to clipboard', { duration: 1500 });
    setTimeout(() => setCopied(false), 2000);
  };

  // Accent color background classes for sender bubbles
  const senderBgClasses: Record<string, string> = {
    blue: 'bg-primary text-primary-foreground',
    emerald: 'bg-emerald-600 text-white',
    purple: 'bg-purple-600 text-white',
    coral: 'bg-orange-600 text-white',
    monochrome: 'bg-slate-800 text-white dark:bg-slate-700',
  };

  return (
    <div
      className={cn(
        'group relative flex w-full gap-2.5 transition-all duration-150',
        isMe ? 'justify-end' : 'justify-start',
        isFirstInGroup ? (density === 'compact' ? 'mt-2' : 'mt-3') : (density === 'compact' ? 'mt-0.5' : 'mt-1')
      )}
    >
      {/* Sender Avatar in Group Chats (received only, displayed on last item in cluster) */}
      {!isMe && isGroup && (
        <div className="w-7 shrink-0 flex items-end">
          {isLastInGroup ? (
            <Avatar
              name={senderName}
              size="sm"
              className="w-7 h-7 text-[11px] mb-0.5"
            />
          ) : (
            <div className="w-7" />
          )}
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={cn(
          'flex flex-col max-w-[78%] sm:max-w-[65%] relative',
          isMe ? 'items-end' : 'items-start'
        )}
      >
        {/* Quick Hover Copy Button */}
        <div
          className={cn(
            'absolute -top-3 z-10 hidden group-hover:flex items-center rounded-full border border-border/80 bg-background/95 p-1 shadow-sm backdrop-blur-md transition-all duration-150 animate-in fade-in zoom-in-95',
            isMe ? 'right-2' : 'left-2'
          )}
        >
          <button
            type="button"
            onClick={handleCopy}
            className="h-5 w-5 rounded-full text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
            title="Copy message"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>

        {/* Sender Name for first message in received group cluster */}
        {!isMe && isGroup && isFirstInGroup && (
          <span className="text-[11px] font-bold text-primary/90 ml-2 mb-1 select-none">
            {senderName}
          </span>
        )}

        {/* Message Bubble Body */}
        <div
          className={cn(
            'relative shadow-xs transition-all break-words leading-relaxed select-text',
            density === 'compact' ? 'px-3 py-1.5' : 'px-4 py-2.5',
            fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm',
            
            // Distinct sent styling vs received styling
            isMe
              ? senderBgClasses[accentColor] || senderBgClasses.blue
              : 'bg-card border border-border/75 text-card-foreground',
            
            // Tactile rounded corners depending on clustering
            isMe && isFirstInGroup && isLastInGroup && 'rounded-2xl rounded-tr-xs',
            isMe && isFirstInGroup && !isLastInGroup && 'rounded-2xl rounded-tr-xs rounded-br-md',
            isMe && !isFirstInGroup && isLastInGroup && 'rounded-2xl rounded-tr-md rounded-br-xs',
            isMe && !isFirstInGroup && !isLastInGroup && 'rounded-2xl rounded-r-md',

            !isMe && isFirstInGroup && isLastInGroup && 'rounded-2xl rounded-tl-xs',
            !isMe && isFirstInGroup && !isLastInGroup && 'rounded-2xl rounded-tl-xs rounded-bl-md',
            !isMe && !isFirstInGroup && isLastInGroup && 'rounded-2xl rounded-tl-md rounded-bl-xs',
            !isMe && !isFirstInGroup && !isLastInGroup && 'rounded-2xl rounded-l-md',

            status === 'failed' && 'border-destructive/40 bg-destructive/15 text-destructive dark:text-red-300'
          )}
        >
          <p className="whitespace-pre-wrap">{message.text}</p>

          {/* Time and Status Footer */}
          <div
            className={cn(
              'mt-1 flex items-center justify-end gap-1 text-[10px] select-none',
              isMe ? 'text-white/80 dark:text-white/80' : 'text-muted-foreground/75'
            )}
          >
            <span>{timeFormatted}</span>

            {/* Status Icons for Sent Messages */}
            {isMe && (
              <span className="inline-flex items-center ml-0.5">
                {status === 'sending' && (
                  <Loader2 className="h-3 w-3 animate-spin opacity-80" />
                )}
                {status === 'sent' && (
                  <CheckCheck className="h-3.5 w-3.5 text-white/90" />
                )}
                {status === 'failed' && (
                  <span className="inline-flex items-center gap-1 text-destructive font-semibold">
                    <AlertCircle className="h-3 w-3" />
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Inline Retry Action for Failed Messages */}
        {isMe && status === 'failed' && (
          <div className="flex items-center gap-1.5 mt-1 mr-1">
            <span className="text-[11px] text-destructive">Failed to send</span>
            <button
              onClick={() => onRetry?.(message)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/30 transition-colors cursor-pointer"
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
