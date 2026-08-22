'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { conversationsApi } from '@/lib/api/conversations';
import { Conversation } from '@/lib/types';
import { ConversationListItem } from './ConversationListItem';
import { SearchStartConversation } from './SearchStartConversation';
import { GroupCreateModal } from './GroupCreateModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { ChatPreferencesModal } from './ChatPreferencesModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuthStore } from '@/lib/store/authStore';
import { useChatStore } from '@/lib/store/chatStore';
import { isSoundEnabled, setSoundEnabled } from '@/lib/audio';
import {
  MessageSquarePlus,
  Users,
  Search,
  LogOut,
  WifiOff,
  RotateCw,
  Sparkles,
  Keyboard,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ConversationListProps {
  activeId: string | null;
  onSelect: (id: string) => void;
}

type TabFilter = 'all' | 'direct' | 'group';

// Deterministic pastel hue from name
function avatarHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function nameInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function ConversationList({ activeId, onSelect }: ConversationListProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const socketConnected = useChatStore((s) => s.socketConnected);

  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [filterQuery, setFilterQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const {
    data: conversations = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Conversation[]>({
    queryKey: ['conversations', user?._id],
    queryFn: conversationsApi.getConversations,
    refetchInterval: 15000,
    enabled: Boolean(user?._id),
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const filteredConversations = conversations.filter((conv) => {
    if (activeTab === 'direct' && conv.type !== 'direct') return false;
    if (activeTab === 'group' && conv.type !== 'group') return false;
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    if (conv.type === 'group') return conv.name?.toLowerCase().includes(q);
    return (
      conv.participant?.name?.toLowerCase().includes(q) ||
      conv.participant?.phone?.toLowerCase().includes(q)
    );
  });

  const directCount = conversations.filter((c) => c.type === 'direct').length;
  const groupCount = conversations.filter((c) => c.type === 'group').length;

  const userName = user?.name || 'Me';
  const userHue = avatarHue(userName);
  const userInitials = nameInitials(userName);

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: conversations.length },
    { key: 'direct', label: 'DMs', count: directCount },
    { key: 'group', label: 'Groups', count: groupCount },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-sidebar border-r border-border/60 select-none overflow-hidden">

      {/* ── Header ── */}
      <div className="px-3.5 pt-4 pb-2.5 space-y-3 shrink-0">
        {/* Top row: title + live badge + actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Messages
            </h2>
            {/* Live / offline badge */}
            <span
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium font-mono border',
                socketConnected
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
              )}
              title={socketConnected ? 'Connected to real-time server' : 'Reconnecting…'}
            >
              {socketConnected ? (
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              <span>{socketConnected ? 'Live' : 'Syncing'}</span>
            </span>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="New message"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsGroupModalOpen(true)}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="New group"
            >
              <Users className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2 transition-all',
            isSearchFocused
              ? 'border-primary/50 bg-background ring-2 ring-primary/15'
              : 'border-border/60'
          )}
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground/70" />
          <input
            type="text"
            placeholder="Search Chatterbox…"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery('')}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-1.5">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer',
                activeTab === key
                  ? 'bg-background text-foreground shadow-xs border border-border/70 font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <span>{label}</span>
              <span
                className={cn(
                  'font-mono text-xs tabular-nums',
                  activeTab === key ? 'text-muted-foreground font-normal' : 'opacity-60'
                )}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── List Body ── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-2 pb-2 space-y-0.5">

        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-1.5 pt-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-28 rounded-md" />
                    <Skeleton className="h-2.5 w-12 rounded-md" />
                  </div>
                  <Skeleton className="h-3 w-4/5 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-3">
            <p className="text-xs">Failed to load conversations</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-8 text-xs gap-1.5 rounded-lg cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">No conversations</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Start a chat or create a group to begin.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setIsSearchModalOpen(true)}
                className="h-8 text-xs rounded-xl gap-1.5 cursor-pointer"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                New Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsGroupModalOpen(true)}
                className="h-8 text-xs rounded-xl gap-1.5 cursor-pointer"
              >
                <Users className="h-3.5 w-3.5" />
                New Group
              </Button>
            </div>
          </div>
        )}

        {/* List */}
        {!isLoading && !isError && filteredConversations.map((conv) => (
          <ConversationListItem
            key={conv._id}
            conversation={conv}
            isActive={activeId === conv._id}
            currentUserId={user?._id}
            onClick={() => onSelect(conv._id)}
          />
        ))}

        {/* No filter match */}
        {!isLoading && conversations.length > 0 && filteredConversations.length === 0 && (
          <p className="px-4 pt-6 text-center text-xs text-muted-foreground">
            No results for &ldquo;{filterQuery}&rdquo;
          </p>
        )}
      </div>

      {/* ── User Footer ── */}
      <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-3.5 py-2.5 shrink-0">
        {/* User avatar + info */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs"
            style={{ background: `hsl(${userHue}, 52%, 42%)` }}
          >
            {userInitials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{user?.phone}</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsPreferencesOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Preferences"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsShortcutsOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <SearchStartConversation
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectConversation={(id) => onSelect(id)}
      />
      <GroupCreateModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSelectConversation={(id) => onSelect(id)}
      />
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
      <ChatPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </div>
  );
}
