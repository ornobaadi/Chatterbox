'use client';

import React from 'react';
import { Conversation } from '@/lib/types';
import { Avatar } from '@/components/ui/avatar';
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

  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  return format(date, 'MMM d');
}

export function ConversationListItem({
  conversation,
  isActive,
  currentUserId,
  onClick,
}: ConversationListItemProps) {
  const isGroup = conversation.type === 'group';
  
  const title = isGroup
    ? (conversation.name || 'Group Chat')
    : (conversation.participant?.name || 'Direct Chat');

  const subtitlePhone = !isGroup ? conversation.participant?.phone : null;

  const lastMsg = conversation.lastMessage;
  const timeFormatted = formatMessageTime(lastMsg?.createdAt || conversation.updatedAt || conversation.createdAt);

  const isSentByMe = lastMsg && currentUserId && lastMsg.sender === currentUserId;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center gap-3.5 rounded-2xl p-3 text-left transition-all duration-200 select-none cursor-pointer',
        isActive
          ? 'bg-primary/10 text-foreground border border-primary/20 shadow-xs'
          : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-transparent'
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar
          name={title}
          size="md"
          isGroup={isGroup}
          className={cn(isActive && 'ring-2 ring-primary/40 ring-offset-2 ring-offset-background')}
        />
        {isGroup && (
          <div className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-background border border-border text-[9px] font-bold text-muted-foreground shadow-xs">
            <Users className="h-2.5 w-2.5" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 min-w-0 flex-col justify-center">
        <div className="flex items-center justify-between gap-1.5">
          <span className={cn(
            'truncate text-sm font-semibold tracking-tight',
            isActive ? 'text-foreground font-bold' : 'text-foreground/90'
          )}>
            {title}
          </span>
          {timeFormatted && (
            <span className="shrink-0 text-[11px] font-medium text-muted-foreground/70">
              {timeFormatted}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          {isSentByMe && (
            <CheckCheck className="h-3.5 w-3.5 text-primary shrink-0" />
          )}
          <p className="truncate text-xs text-muted-foreground/85">
            {lastMsg?.text ? (
              <span>{lastMsg.text}</span>
            ) : (
              <span className="italic opacity-60">No messages yet</span>
            )}
          </p>
        </div>
      </div>
    </button>
  );
}
