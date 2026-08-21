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
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuthStore } from '@/lib/store/authStore';
import { useChatStore } from '@/lib/store/chatStore';
import { isSoundEnabled, setSoundEnabled } from '@/lib/audio';
import {
  MessageSquarePlus,
  Users,
  Search,
  LogOut,
  Wifi,
  WifiOff,
  RotateCw,
  Sparkles,
  Volume2,
  VolumeX,
  Keyboard,
  Settings,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ConversationListProps {
  activeId: string | null;
  onSelect: (id: string) => void;
}

type TabFilter = 'all' | 'direct' | 'group';

export function ConversationList({ activeId, onSelect }: ConversationListProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const socketConnected = useChatStore((s) => s.socketConnected);

  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [filterQuery, setFilterQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

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

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    toast.info(next ? 'Sound notifications enabled' : 'Sound notifications muted', { duration: 1500 });
  };

  const filteredConversations = conversations.filter((conv) => {
    // 1. Tab category filter
    if (activeTab === 'direct' && conv.type !== 'direct') return false;
    if (activeTab === 'group' && conv.type !== 'group') return false;

    // 2. Query search filter
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    if (conv.type === 'group') {
      return conv.name?.toLowerCase().includes(q);
    }
    const participantName = conv.participant?.name?.toLowerCase() || '';
    const participantPhone = conv.participant?.phone?.toLowerCase() || '';
    return participantName.includes(q) || participantPhone.includes(q);
  });

  const directCount = conversations.filter((c) => c.type === 'direct').length;
  const groupCount = conversations.filter((c) => c.type === 'group').length;

  return (
    <div className="flex h-full w-full flex-col bg-card/70 backdrop-blur-md border-r border-border/80 select-none">
      {/* Header */}
      <div className="p-3.5 pb-3 border-b border-border/50 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-foreground font-heading">
              Messages
            </h2>
            {/* Live Socket Status indicator */}
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all',
                socketConnected
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              )}
              title={socketConnected ? 'Real-time WebSocket connection active' : 'Connecting to WebSocket...'}
            >
              {socketConnected ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[9.5px]">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-2.5 w-2.5" />
                  <span className="font-mono text-[9.5px]">Syncing</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSearchModalOpen(true)}
              className="h-8 w-8 p-0 rounded-xl hover:bg-primary/10 hover:text-primary hover:border-primary/30 cursor-pointer"
              title="New direct message"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGroupModalOpen(true)}
              className="h-8 w-8 p-0 rounded-xl hover:bg-primary/10 hover:text-primary hover:border-primary/30 cursor-pointer"
              title="New group conversation"
            >
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter / Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" />
          <Input
            placeholder="Filter conversations..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="pl-8.5 h-8.5 text-xs rounded-xl bg-background/50"
          />
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/50 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              'py-1 px-2 rounded-lg font-semibold transition-all text-center cursor-pointer flex items-center justify-center gap-1',
              activeTab === 'all'
                ? 'bg-background text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>All</span>
            <span className="text-[9.5px] opacity-70 font-mono">({conversations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={cn(
              'py-1 px-2 rounded-lg font-semibold transition-all text-center cursor-pointer flex items-center justify-center gap-1',
              activeTab === 'direct'
                ? 'bg-background text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>Direct</span>
            <span className="text-[9.5px] opacity-70 font-mono">({directCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('group')}
            className={cn(
              'py-1 px-2 rounded-lg font-semibold transition-all text-center cursor-pointer flex items-center justify-center gap-1',
              activeTab === 'group'
                ? 'bg-background text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>Groups</span>
            <span className="text-[9.5px] opacity-70 font-mono">({groupCount})</span>
          </button>
        </div>
      </div>

      {/* Conversation List Body */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && (
          <div className="space-y-2 p-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground gap-3">
            <p className="text-xs">Failed to load conversations</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-8 text-xs gap-1.5 rounded-lg cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {!isLoading && !isError && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-muted-foreground gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start a 1:1 chat or create a group to begin messaging.
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={() => setIsSearchModalOpen(true)}
                className="h-8 text-xs rounded-xl gap-1.5 cursor-pointer"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                <span>New Chat</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsGroupModalOpen(true)}
                className="h-8 text-xs rounded-xl gap-1.5 cursor-pointer"
              >
                <Users className="h-3.5 w-3.5" />
                <span>New Group</span>
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !isError && filteredConversations.map((conv) => (
          <ConversationListItem
            key={conv._id}
            conversation={conv}
            isActive={activeId === conv._id}
            currentUserId={user?._id}
            onClick={() => onSelect(conv._id)}
          />
        ))}

        {!isLoading && conversations.length > 0 && filteredConversations.length === 0 && (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No chats in this category match &ldquo;{filterQuery}&rdquo;
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-2.5 border-t border-border/50 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={user?.name || 'Me'} size="sm" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate font-mono">{user?.phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Chat Preferences Gear */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreferencesOpen(true)}
            className="h-7.5 w-7.5 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            title="Chat preferences & appearance"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>

          {/* Keyboard Shortcuts */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsShortcutsOpen(true)}
            className="h-7.5 w-7.5 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </Button>

          {/* Sign Out */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="h-7.5 w-7.5 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 cursor-pointer"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
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
