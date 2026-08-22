'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from '@/lib/api/conversations';
import { Conversation, Message, DirectParticipant } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { NewMessagesPill } from './NewMessagesPill';
import { GroupInfoModal } from './GroupInfoModal';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/store/authStore';
import { useChatStore } from '@/lib/store/chatStore';
import { useUIStore } from '@/lib/store/uiStore';
import { playSendChime } from '@/lib/audio';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Info,
  RotateCw,
  Sparkles,
  Search,
  X,
  Calendar,
  MessageCircle,
} from 'lucide-react';
import { isSameDay, format, isToday, isYesterday } from 'date-fns';
import { useRouter } from 'next/navigation';

interface MessagePanelProps {
  conversationId: string;
  onBack?: () => void;
}

function formatDateDivider(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

export function MessagePanel({ conversationId, onBack }: MessagePanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((s) => s.user?._id);
  const sentSound = useUIStore((s) => s.sentSound);

  const {
    messages: storeMessagesMap,
    setMessagesForConversation,
    addOptimisticMessage,
    reconcileMessageSuccess,
    markMessageFailed,
    setActiveConversationId,
  } = useChatStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef<boolean>(true);
  const [showScrollPill, setShowScrollPill] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [hasScrolledInit, setHasScrolledInit] = useState(false);
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [composerDraft, setComposerDraft] = useState('');

  // Set active conversation in store
  useEffect(() => {
    setActiveConversationId(conversationId);
    return () => setActiveConversationId(null);
  }, [conversationId, setActiveConversationId]);

  // Fetch Conversation metadata
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['conversations', currentUserId],
    queryFn: conversationsApi.getConversations,
    enabled: Boolean(currentUserId),
  });

  const activeConversation = conversations.find((c) => c._id === conversationId);

  // Fetch message history
  const {
    data: historyData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['messages', conversationId, currentUserId],
    queryFn: () => conversationsApi.getMessages(conversationId),
    enabled: Boolean(conversationId) && Boolean(currentUserId),
  });

  // Sync server history into chat store
  useEffect(() => {
    if (historyData?.messages) {
      setMessagesForConversation(conversationId, historyData.messages);
    }
  }, [historyData, conversationId, setMessagesForConversation]);

  const rawMessagesList = useMemo(() => {
    const raw = storeMessagesMap[conversationId] || [];
    return [...raw].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeA - timeB;
    });
  }, [storeMessagesMap, conversationId]);

  // Filter messages if search is active
  const messagesList = useMemo(() => {
    if (!isSearchingInChat || !chatSearchQuery.trim()) {
      return rawMessagesList;
    }
    const q = chatSearchQuery.toLowerCase().trim();
    return rawMessagesList.filter((m) => m.text?.toLowerCase().includes(q));
  }, [rawMessagesList, isSearchingInChat, chatSearchQuery]);

  // Smooth scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior,
      });
      setShowScrollPill(false);
    }
  }, []);

  // Detect scroll position
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom < 100;
    isAtBottomRef.current = isNearBottom;

    if (isNearBottom) {
      setShowScrollPill(false);
    }
  };

  // Initial scroll on load
  useEffect(() => {
    if (!isLoading && messagesList.length > 0 && !hasScrolledInit) {
      scrollToBottom('auto');
      setHasScrolledInit(true);
    }
  }, [isLoading, messagesList.length, hasScrolledInit, scrollToBottom]);

  // Handle incoming messages auto-scroll vs pill
  const prevMessagesCountRef = useRef(messagesList.length);
  useEffect(() => {
    if (messagesList.length > prevMessagesCountRef.current) {
      const latestMsg = messagesList[messagesList.length - 1];
      const isMyMessage = latestMsg.sender === currentUserId;

      if (isMyMessage || isAtBottomRef.current) {
        scrollToBottom('smooth');
      } else {
        setShowScrollPill(true);
      }
    }
    prevMessagesCountRef.current = messagesList.length;
  }, [messagesList, currentUserId, scrollToBottom]);

  // Send Message Mutation
  const sendMutation = useMutation({
    mutationFn: ({ text, tempId }: { text: string; tempId: string }) =>
      conversationsApi.sendMessage(conversationId, text),
    onSuccess: (serverMessage, variables) => {
      reconcileMessageSuccess(conversationId, variables.tempId, serverMessage);
      queryClient.setQueryData<Conversation[]>(['conversations', currentUserId], (old) => {
        if (!old) return old;
        return old.map((c) =>
          c._id === conversationId
            ? {
                ...c,
                lastMessage: {
                  text: serverMessage.text,
                  sender: serverMessage.sender,
                  createdAt: serverMessage.createdAt,
                },
                updatedAt: serverMessage.createdAt,
              }
            : c
        ).sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      });
    },
    onError: (_, variables) => {
      markMessageFailed(conversationId, variables.tempId);
    },
  });

  const handleSendMessage = (text: string) => {
    if (!currentUserId) return;
    const tempId = addOptimisticMessage(conversationId, text, currentUserId);
    if (sentSound) {
      playSendChime();
    }
    scrollToBottom('smooth');
    sendMutation.mutate({ text, tempId });
  };

  const handleRetryMessage = (failedMessage: Message) => {
    const tempId = failedMessage.tempId || failedMessage._id;
    sendMutation.mutate({ text: failedMessage.text, tempId });
  };

  const handleStartDirectChat = async (participant?: DirectParticipant) => {
    if (!participant?._id || participant._id === currentUserId) return;

    // 1. Check if direct chat already exists in user's conversations
    const existing = conversations.find(
      (c) => c.type === 'direct' && c.participant?._id === participant._id
    );

    if (existing) {
      router.push(`/chat/${existing._id}`);
      return;
    }

    // 2. Otherwise create a new direct conversation
    try {
      const newConv = await conversationsApi.createDirectConversation(participant._id);
      queryClient.invalidateQueries({ queryKey: ['conversations', currentUserId] });
      router.push(`/chat/${newConv._id}`);
    } catch {
      // Fallback
    }
  };

  const isGroup = activeConversation?.type === 'group';
  const headerTitle = isGroup
    ? activeConversation?.name || 'Group'
    : activeConversation?.participant?.name || 'Direct Chat';

  const headerSubtitle = isGroup
    ? `${(activeConversation?.participants || []).length} participants`
    : activeConversation?.participant?.phone || 'Direct Chat';

  // Build participant lookup map for avatars and names in group chats
  const participantMap = useMemo(() => {
    const map = new Map<string, DirectParticipant>();
    if (activeConversation?.participants && Array.isArray(activeConversation.participants)) {
      activeConversation.participants.forEach((p) => {
        if (typeof p === 'object' && p._id) {
          map.set(p._id, p);
        }
      });
    }
    if (activeConversation?.participant) {
      map.set(activeConversation.participant._id, activeConversation.participant);
    }
    return map;
  }, [activeConversation]);

  // Dynamic Browser Tab Title
  useEffect(() => {
    if (headerTitle) {
      document.title = `${headerTitle} | Chatterbox`;
    }
    return () => {
      document.title = 'Messages | Chatterbox';
    };
  }, [headerTitle]);

  return (
    <div className="relative flex h-full w-full flex-col bg-background overflow-hidden">

      {/* ── Top Header ── */}
      <div className="shrink-0 z-20">
        <div className="flex h-16 items-center justify-between gap-3 border-b border-border/60 bg-background/85 backdrop-blur-md px-4">
          {/* Left: back + avatar + name */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 text-left cursor-default"
              onClick={() => isGroup && setIsGroupInfoOpen(true)}
              disabled={!isGroup}
            >
              <Avatar
                name={headerTitle}
                size="md"
                isGroup={isGroup}
                className="shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-sm sm:text-base font-semibold text-foreground">
                    {headerTitle}
                  </h2>
                  {isGroup && (
                    <span className="shrink-0 rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      Group
                    </span>
                  )}
                </div>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {headerSubtitle}
                </p>
              </div>
            </button>
          </div>

          {/* Right: actions */}
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setIsSearchingInChat(!isSearchingInChat);
                if (isSearchingInChat) setChatSearchQuery('');
              }}
              className={cn(
                'flex h-8.5 w-8.5 items-center justify-center rounded-xl transition-colors cursor-pointer',
                isSearchingInChat
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              title="Search in conversation"
            >
              <Search className="h-4 w-4" />
            </button>

            {isGroup && (
              <button
                type="button"
                onClick={() => setIsGroupInfoOpen(true)}
                className="flex h-8.5 w-8.5 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Group details"
              >
                <Info className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Inline search reveal */}
        {isSearchingInChat && (
          <div className="flex items-center gap-2.5 border-b border-border/50 bg-muted/40 px-4 py-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground/70" />
            <Input
              placeholder="Filter messages…"
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              className="h-8 flex-1 border-none bg-transparent text-sm shadow-none focus-visible:ring-0 p-0"
              autoFocus
            />
            {chatSearchQuery && (
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {messagesList.length} match{messagesList.length !== 1 ? 'es' : ''}
              </span>
            )}
            <button
              type="button"
              onClick={() => { setIsSearchingInChat(false); setChatSearchQuery(''); }}
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Message List ── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4 space-y-0 relative"
      >
        {/* Loading: Realistic chat bubble skeletons with shimmer */}
        {isLoading && (
          <div className="space-y-4 py-8 max-w-xl mx-auto px-2">
            <div className="flex justify-center my-2">
              <Skeleton className="h-6 w-24 rounded-full bg-muted/60" />
            </div>
            <div className="flex items-end gap-2.5 justify-start">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <Skeleton className="h-12 w-48 sm:w-56 rounded-2xl rounded-bl-xs" />
            </div>
            <div className="flex items-end gap-2.5 justify-end">
              <Skeleton className="h-10 w-60 sm:w-72 rounded-2xl rounded-br-xs bg-primary/20" />
            </div>
            <div className="flex items-end gap-2.5 justify-start">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <Skeleton className="h-16 w-64 sm:w-80 rounded-2xl rounded-bl-xs" />
            </div>
            <div className="flex items-end gap-2.5 justify-end">
              <Skeleton className="h-10 w-40 rounded-2xl rounded-br-xs bg-primary/20" />
            </div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground">
            <p className="text-sm">Could not load messages</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="h-8 text-xs gap-1.5 rounded-xl">
              <RotateCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        )}

        {/* Playful & Modern Empty State for New Conversations */}
        {!isLoading && !isError && messagesList.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="relative z-10 max-w-sm flex flex-col items-center">
              {/* Clean Avatar / Brand Icon */}
              <div className="relative mb-4">
                <Avatar
                  name={headerTitle}
                  size="lg"
                  isGroup={isGroup}
                  className="h-16 w-16 text-xl shadow-md ring-4 ring-background/80"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-tight font-heading text-foreground">
                {isGroup ? `Welcome to ${headerTitle}!` : `Say hello to ${headerTitle}!`}
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed max-w-[32ch]">
                {isGroup
                  ? 'Be the first one to send a message to kick off the conversation.'
                  : 'Pick an icebreaker below or type a message to start chatting.'}
              </p>

              {/* Quick Icebreaker Prompts */}
              <div className="mt-6 w-full space-y-2">
                <span className="text-[10.5px] font-semibold text-muted-foreground/70 uppercase tracking-wider block">
                  Quick Icebreakers
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[
                    { label: '👋 Wave hello', text: 'Hey! How are you doing?' },
                    { label: "🚀 How's the project?", text: "Hey! How's the project coming along?" },
                    { label: '✨ Quick catch-up?', text: 'Hey, got a minute to chat?' },
                    { label: '☕ Coffee break?', text: 'Time for a quick coffee break! ☕' },
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setComposerDraft(prompt.text)}
                      className="rounded-full border border-border/80 bg-card/80 hover:bg-primary/10 hover:text-primary hover:border-primary/30 px-3.5 py-1.5 text-xs font-medium text-foreground transition-all duration-150 shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                    >
                      <span>{prompt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages with clustering and Date Dividers */}
        {!isLoading &&
          !isError &&
          messagesList.map((msg, index) => {
            const isMe = msg.sender === currentUserId;
            const prevMsg = messagesList[index - 1];
            const nextMsg = messagesList[index + 1];

            // Check if day changed from prevMsg
            const isNewDay =
              !prevMsg ||
              !isSameDay(new Date(prevMsg.createdAt), new Date(msg.createdAt));

            // Message clustering threshold: 2 minutes (120,000ms)
            const isSameSenderAsPrev =
              prevMsg &&
              !isNewDay &&
              prevMsg.sender === msg.sender &&
              Math.abs(new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) < 120000;

            const isSameSenderAsNext =
              nextMsg &&
              isSameDay(new Date(nextMsg.createdAt), new Date(msg.createdAt)) &&
              nextMsg.sender === msg.sender &&
              Math.abs(new Date(nextMsg.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 120000;

            const isFirstInGroup = !isSameSenderAsPrev;
            const isLastInGroup = !isSameSenderAsNext;

            const senderParticipant = participantMap.get(msg.sender);

            return (
              <React.Fragment key={msg._id || msg.tempId || index}>
                {/* Sticky / Centered Date Divider */}
                {isNewDay && (
                  <div className="flex items-center justify-center my-4 select-none">
                    <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-[10.5px] font-semibold text-muted-foreground shadow-xs backdrop-blur-sm">
                      <Calendar className="h-3 w-3 text-primary" />
                      <span>{formatDateDivider(msg.createdAt)}</span>
                    </div>
                  </div>
                )}

                <MessageBubble
                  message={msg}
                  isMe={isMe}
                  isGroup={Boolean(isGroup)}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                  isLastOverall={index === messagesList.length - 1}
                  senderParticipant={senderParticipant}
                  onRetry={handleRetryMessage}
                  onStartDirectChat={handleStartDirectChat}
                />
              </React.Fragment>
            );
          })}
      </div>

      {/* Floating "New Messages ↓" Pill */}
      <NewMessagesPill
        show={showScrollPill}
        onClick={() => scrollToBottom('smooth')}
      />

      {/* Composer */}
      <MessageComposer
        value={composerDraft}
        onChange={setComposerDraft}
        onSend={(text) => {
          setComposerDraft('');
          handleSendMessage(text);
        }}
        disabled={isLoading || isError}
        placeholder={isGroup ? `Message ${headerTitle}...` : 'Type a message...'}
      />

      {/* Group Info Modal */}
      {isGroup && activeConversation && (
        <GroupInfoModal
          isOpen={isGroupInfoOpen}
          onClose={() => setIsGroupInfoOpen(false)}
          conversation={activeConversation}
          onLeaveSuccess={() => {
            if (onBack) onBack();
            else router.push('/chat');
          }}
          onStartDirectChat={handleStartDirectChat}
        />
      )}
    </div>
  );
}
