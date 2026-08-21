'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import { conversationsApi } from '@/lib/api/conversations';
import { User, Conversation } from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

interface SearchStartConversationProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: string) => void;
}

export function SearchStartConversation({
  isOpen,
  onClose,
  onSelectConversation,
}: SearchStartConversationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((s) => s.user?._id);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: () => usersApi.searchUsers(debouncedQuery),
    enabled: isOpen && debouncedQuery.length > 0,
  });

  const createConvMutation = useMutation({
    mutationFn: (targetUserId: string) => conversationsApi.createDirectConversation(targetUserId),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      onSelectConversation(newConv._id);
      onClose();
    },
  });

  const handleStartChat = async (user: User) => {
    // Check if conversation already exists in cache
    const existingConversations = queryClient.getQueryData<Conversation[]>(['conversations']) || [];
    const existing = existingConversations.find(
      (c) => c.type === 'direct' && c.participant?._id === user._id
    );

    if (existing) {
      onSelectConversation(existing._id);
      onClose();
      return;
    }

    createConvMutation.mutate(user._id);
  };

  // Filter out current user from results and strictly match query
  const filteredUsers = (users || []).filter((u) => {
    if (u._id === currentUserId) return false;
    if (!debouncedQuery) return true;
    const q = debouncedQuery.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(q);
    const phoneMatch = u.phone?.toLowerCase().includes(q);
    return nameMatch || phoneMatch;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Direct Chat"
      description="Search for people by name or phone number"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
            autoFocus
          />
        </div>

        {/* Results Container */}
        <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1 min-h-[160px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Searching users...</span>
            </div>
          )}

          {!isLoading && debouncedQuery && filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
              <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center">
                <Search className="h-5 w-5 opacity-50" />
              </div>
              <p className="text-sm font-medium">No users found</p>
              <p className="text-xs text-muted-foreground/80">
                Try searching with a different name or full phone number.
              </p>
            </div>
          )}

          {!isLoading && !debouncedQuery && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-2">
              <Sparkles className="h-6 w-6 text-primary/50" />
              <p className="text-xs">Type a name or phone number to find contacts.</p>
            </div>
          )}

          {!isLoading && filteredUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/60 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={user.name} size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.phone}</p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => handleStartChat(user)}
                disabled={createConvMutation.isPending}
                className="h-8.5 rounded-lg text-xs gap-1.5"
              >
                {createConvMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Chat</span>
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
