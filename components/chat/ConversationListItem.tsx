'use client';

import React from 'react';
import { Conversation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Users, CheckCheck } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

interface ConversationListItemProps {
  conversation: Conversation;
  isActive: boolean;
  currentUserId?: string;
  onClick: () => void;
}

export function formatMessageTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

function nameInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function avatarHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function ConversationListItem({
  conversation,
  isActive,
  currentUserId,
  onClick,
}: ConversationListItemProps) {
  const isGroup = conversation.type === 'group';

  const title = isGroup
    ? conversation.name || 'Group Chat'
    : conversation.participant?.name || 'Direct Chat';

  const lastMsg = conversation.lastMessage;
  const timeFormatted = formatMessageTime(
    lastMsg?.createdAt || conversation.updatedAt || conversation.createdAt
  );
  const isSentByMe = lastMsg && currentUserId && lastMsg.sender === currentUserId;
  const hue = avatarHue(title);
  const initials = nameInitials(title);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left',
        'transition-colors duration-100 select-none cursor-pointer overflow-hidden',
        isActive
          ? 'bg-accent/70 text-foreground font-medium'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
      )}
    >
      {/* Active left stripe */}
      {isActive && (
        <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-primary" />
      )}

      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs',
            isActive && 'ring-2 ring-primary/40 ring-offset-1 ring-offset-background'
          )}
          style={{ background: `hsl(${hue}, 52%, 42%)` }}
        >
          {initials}
        </div>

        {/* Group badge */}
        {isGroup && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-background border border-border shadow-xs">
            <Users className="h-2.5 w-2.5 text-muted-foreground" />
          </span>
        )}
      </div>

      {/* Text content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'truncate text-sm font-semibold leading-tight',
              isActive ? 'text-foreground font-bold' : 'text-foreground/90'
            )}
          >
            {title}
          </span>
          {timeFormatted && (
            <span className="shrink-0 text-xs text-muted-foreground/70 font-mono tabular-nums">
              {timeFormatted}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {isSentByMe && (
            <CheckCheck className="h-3.5 w-3.5 shrink-0 text-primary/70" />
          )}
          <p className="truncate text-xs text-muted-foreground">
            {lastMsg?.text ? (
              lastMsg.text
            ) : (
              <span className="italic opacity-60">No messages yet</span>
            )}
          </p>
        </div>
      </div>
    </button>
  );
}
