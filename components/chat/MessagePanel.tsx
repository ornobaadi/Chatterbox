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
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/store/authStore';
import { useChatStore } from '@/lib/store/chatStore';
import { playSendChime } from '@/lib/audio';
import {
  ArrowLeft,
  Users,
  Info,
  RotateCw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MessagePanelProps {
  conversationId: string;
  onBack?: () => void;
}

export function MessagePanel({ conversationId, onBack }: MessagePanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((s) => s.user?._id);

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

  // Set active conversation in store
  useEffect(() => {
    setActiveConversationId(conversationId);
    return () => setActiveConversationId(null);
  }, [conversationId, setActiveConversationId]);

  // Fetch Conversation metadata from query cache or list
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

  const messagesList = useMemo(() => {
    const raw = storeMessagesMap[conversationId] || [];
    return [...raw].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeA - timeB;
    });
  }, [storeMessagesMap, conversationId]);

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
      queryClient.setQueryData<Conversation[]>(['conversations'], (old) => {
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
    playSendChime();
    scrollToBottom('smooth');
    sendMutation.mutate({ text, tempId });
  };

  const handleRetryMessage = (failedMessage: Message) => {
    const tempId = failedMessage.tempId || failedMessage._id;
    sendMutation.mutate({ text: failedMessage.text, tempId });
  };

  const isGroup = activeConversation?.type === 'group';
  const headerTitle = isGroup
    ? activeConversation?.name || 'Group'
    : activeConversation?.participant?.name || 'Direct Chat';

  const headerSubtitle = isGroup
    ? `${(activeConversation?.participants || []).length} participants`
    : activeConversation?.participant?.phone || 'Encrypted Direct Chat';

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

  return (
    <div className="relative flex h-full w-full flex-col bg-background/95 overflow-hidden">
      {/* Conversation Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/70 bg-card/80 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0 rounded-xl md:hidden shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <Avatar
            name={headerTitle}
            size="md"
            isGroup={isGroup}
            className="shrink-0 cursor-pointer"
            onClick={() => isGroup && setIsGroupInfoOpen(true)}
          />

          <div
            className="min-w-0 cursor-pointer"
            onClick={() => isGroup && setIsGroupInfoOpen(true)}
          >
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-foreground truncate">{headerTitle}</h2>
              {isGroup && (
                <span className="text-[10px] font-semibold bg-muted px-1.5 py-0.2 rounded-md text-muted-foreground">
                  Group
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{headerSubtitle}</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {isGroup && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGroupInfoOpen(true)}
              className="h-8 rounded-xl text-xs gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              <Info className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Details</span>
            </Button>
          )}
        </div>
      </div>

      {/* Message List Body */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1 relative"
      >
        {/* Loading State with shaped bubble skeletons */}
        {isLoading && (
          <div className="space-y-4 py-4 max-w-xl mx-auto">
            <div className="flex justify-start">
              <Skeleton className="h-14 w-48 rounded-2xl rounded-tl-sm bg-muted/60" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-12 w-64 rounded-2xl rounded-tr-sm bg-primary/20" />
            </div>
            <div className="flex justify-start">
              <Skeleton className="h-16 w-56 rounded-2xl rounded-tl-sm bg-muted/60" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-40 rounded-2xl rounded-tr-sm bg-primary/20" />
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3 py-12">
            <p className="text-sm">Could not load message history</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-8.5 text-xs gap-1.5 rounded-xl"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && messagesList.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">No messages here yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Break the ice! Send a message below to start the conversation.
              </p>
            </div>
          </div>
        )}

        {/* Messages with clustering */}
        {!isLoading &&
          !isError &&
          messagesList.map((msg, index) => {
            const isMe = msg.sender === currentUserId;
            const prevMsg = messagesList[index - 1];
            const nextMsg = messagesList[index + 1];

            // Message clustering threshold: 2 minutes (120,000ms)
            const isSameSenderAsPrev =
              prevMsg &&
              prevMsg.sender === msg.sender &&
              Math.abs(new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) < 120000;

            const isSameSenderAsNext =
              nextMsg &&
              nextMsg.sender === msg.sender &&
              Math.abs(new Date(nextMsg.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 120000;

            const isFirstInGroup = !isSameSenderAsPrev;
            const isLastInGroup = !isSameSenderAsNext;

            const senderParticipant = participantMap.get(msg.sender);

            return (
              <MessageBubble
                key={msg._id || msg.tempId || index}
                message={msg}
                isMe={isMe}
                isGroup={Boolean(isGroup)}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
                senderParticipant={senderParticipant}
                onRetry={handleRetryMessage}
              />
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
        onSend={handleSendMessage}
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
        />
      )}
    </div>
  );
}
