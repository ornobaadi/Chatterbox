'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { ConversationList } from '@/components/chat/ConversationList';
import { cn } from '@/lib/utils';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading } = useAuthStore();
  const conversationId = (params?.conversationId as string) || null;

  // Route protection
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          <p className="text-xs font-semibold text-muted-foreground tracking-wide">
            Loading Chatterbox...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-background">
      {/* Sidebar: hidden on mobile if active conversation selected */}
      <div
        className={cn(
          'h-full w-full md:w-80 lg:w-96 shrink-0 transition-all duration-200 overflow-hidden flex flex-col',
          conversationId ? 'hidden md:flex' : 'flex'
        )}
      >
        <ConversationList
          activeId={conversationId}
          onSelect={(id) => router.push(`/chat/${id}`)}
        />
      </div>

      {/* Main Panel: hidden on mobile if no conversation selected */}
      <div
        className={cn(
          'h-full flex-1 min-w-0 transition-all duration-200 overflow-hidden flex flex-col',
          !conversationId ? 'hidden md:flex' : 'flex'
        )}
      >
        {children}
      </div>
    </div>
  );
}
