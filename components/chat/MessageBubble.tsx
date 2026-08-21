'use client';

import React, { useState } from 'react';
import { Message, DirectParticipant } from '@/lib/types';
import { Avatar } from '@/components/ui/avatar';
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
}

export function formatTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, h:mm a');
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

  const senderName = senderParticipant?.name || 'Participant';
  const timeFormatted = formatTime(message.createdAt);
  const status = message.status || 'sent';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    toast.success('Message copied to clipboard', { duration: 1500 });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'group flex w-full gap-2.5 transition-all duration-150',
        isMe ? 'justify-end' : 'justify-start',
        isFirstInGroup ? 'mt-3' : 'mt-0.5'
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
          'flex flex-col max-w-[78%] sm:max-w-[65%]',
          isMe ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender Name for first message in received group cluster */}
        {!isMe && isGroup && isFirstInGroup && (
          <span className="text-[11px] font-bold text-primary/90 ml-2 mb-1 select-none">
            {senderName}
          </span>
        )}

        {/* Message Bubble Body */}
        <div
          className={cn(
            'relative px-4 py-2.5 shadow-xs transition-all break-words text-sm leading-relaxed',
            // Distinct sent styling vs received styling
            isMe
              ? 'bg-primary text-primary-foreground select-text'
              : 'bg-card border border-border/75 text-card-foreground select-text',
            // Tactile rounded corners depending on clustering
            isMe && isFirstInGroup && isLastInGroup && 'rounded-2xl rounded-tr-sm',
            isMe && isFirstInGroup && !isLastInGroup && 'rounded-2xl rounded-tr-sm rounded-br-md',
            isMe && !isFirstInGroup && isLastInGroup && 'rounded-2xl rounded-tr-md rounded-br-sm',
            isMe && !isFirstInGroup && !isLastInGroup && 'rounded-2xl rounded-r-md',

            !isMe && isFirstInGroup && isLastInGroup && 'rounded-2xl rounded-tl-sm',
            !isMe && isFirstInGroup && !isLastInGroup && 'rounded-2xl rounded-tl-sm rounded-bl-md',
            !isMe && !isFirstInGroup && isLastInGroup && 'rounded-2xl rounded-tl-md rounded-bl-sm',
            !isMe && !isFirstInGroup && !isLastInGroup && 'rounded-2xl rounded-l-md',

            status === 'failed' && 'border-destructive/40 bg-destructive/15 text-destructive dark:text-red-300'
          )}
        >
          <p className="whitespace-pre-wrap">{message.text}</p>

          {/* Time and Status Footer */}
          <div
            className={cn(
              'mt-1 flex items-center justify-end gap-1 text-[10px] select-none',
              isMe ? 'text-primary-foreground/75' : 'text-muted-foreground/75'
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
                  <CheckCheck className="h-3.5 w-3.5 text-primary-foreground/90" />
                )}
                {status === 'failed' && (
                  <span className="inline-flex items-center gap-1 text-destructive font-semibold">
                    <AlertCircle className="h-3 w-3" />
                  </span>
                )}
              </span>
            )}

            {/* Quick Copy on Hover */}
            <button
              onClick={handleCopy}
              className={cn(
                'ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer',
                isMe ? 'text-primary-foreground/80' : 'text-muted-foreground'
              )}
              title="Copy text"
            >
              {copied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
            </button>
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
