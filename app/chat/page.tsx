'use client';

import React, { useState } from 'react';
import { MessageSquare, MessageSquarePlus, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchStartConversation } from '@/components/chat/SearchStartConversation';
import { GroupCreateModal } from '@/components/chat/GroupCreateModal';
import { useRouter } from 'next/navigation';

export default function ChatEmptyPage() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);

  React.useEffect(() => {
    document.title = 'Messages | Chatterbox';
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-background/50 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-sm flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner mb-4">
          <MessageSquare className="h-8 w-8" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
          Your Conversations
        </h2>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
          Select a chat from the sidebar to view messages, or start a new conversation.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="sm"
            onClick={() => setIsSearchOpen(true)}
            className="h-10 rounded-xl px-4 text-xs font-semibold gap-2 shadow-sm"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>New Direct Chat</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGroupOpen(true)}
            className="h-10 rounded-xl px-4 text-xs font-semibold gap-2"
          >
            <Users className="h-4 w-4" />
            <span>Create Group</span>
          </Button>
        </div>
      </div>

      <SearchStartConversation
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectConversation={(id) => router.push(`/chat/${id}`)}
      />

      <GroupCreateModal
        isOpen={isGroupOpen}
        onClose={() => setIsGroupOpen(false)}
        onSelectConversation={(id) => router.push(`/chat/${id}`)}
      />
    </div>
  );
}
