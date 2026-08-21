'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users';
import { conversationsApi } from '@/lib/api/conversations';
import { User } from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, Users, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

interface GroupCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: string) => void;
}

export function GroupCreateModal({
  isOpen,
  onClose,
  onSelectConversation,
}: GroupCreateModalProps) {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((s) => s.user?._id);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: searchResults, isLoading: isSearching } = useQuery<User[]>({
    queryKey: ['users', 'group-search', debouncedQuery],
    queryFn: () => usersApi.searchUsers(debouncedQuery),
    enabled: isOpen && debouncedQuery.length > 0,
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: { name: string; participantIds: string[] }) =>
      conversationsApi.createGroupConversation(data.name, data.participantIds),
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      onSelectConversation(newGroup._id);
      handleClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to create group');
    },
  });

  const handleClose = () => {
    setGroupName('');
    setSearchTerm('');
    setSelectedUsers([]);
    setErrorMsg(null);
    onClose();
  };

  const toggleSelectUser = (user: User) => {
    if (selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = groupName.trim();
    if (!trimmedName) {
      setErrorMsg('Please provide a group name.');
      return;
    }

    if (selectedUsers.length < 2) {
      setErrorMsg('Please select at least 2 participants (groups require 3+ members including yourself).');
      return;
    }

    createGroupMutation.mutate({
      name: trimmedName,
      participantIds: selectedUsers.map((u) => u._id),
    });
  };

  const filteredResults = (searchResults || []).filter(
    (u) => u._id !== currentUserId
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Group Conversation"
      description="Add team members and give your group a name"
      maxWidth="md"
    >
      <form onSubmit={handleCreateGroup} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Group Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Group Name
          </label>
          <Input
            placeholder="e.g. Design Sync, Product Team"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="h-11"
            autoFocus
          />
        </div>

        {/* Selected Participants Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider">
              Selected Members ({selectedUsers.length})
            </span>
            <span className="text-[11px] text-muted-foreground/75">
              Minimum 2 required
            </span>
          </div>

          {selectedUsers.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 rounded-xl bg-muted/40 border border-border/50">
              {selectedUsers.map((user) => (
                <div
                  key={user._id}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-card px-2.5 py-1 text-xs font-medium text-foreground border border-border shadow-xs"
                >
                  <Avatar name={user.name} size="sm" className="w-5 h-5 text-[10px]" />
                  <span className="truncate max-w-[120px]">{user.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleSelectUser(user)}
                    className="rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-muted-foreground/70 bg-muted/20 rounded-xl border border-dashed border-border/60">
              No participants selected yet. Search below to add.
            </div>
          )}
        </div>

        {/* User Search */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Add Members
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search user to add..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 text-xs"
            />
          </div>
        </div>

        {/* Search Results List */}
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border-t border-border/40 pt-2">
          {isSearching && (
            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Searching users...</span>
            </div>
          )}

          {!isSearching && filteredResults.map((user) => {
            const isSelected = selectedUsers.some((u) => u._id === user._id);
            return (
              <div
                key={user._id}
                onClick={() => toggleSelectUser(user)}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors text-xs ${
                  isSelected
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-muted/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={user.name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.phone}</p>
                  </div>
                </div>

                <div className={`h-5 w-5 rounded-full flex items-center justify-center border transition-colors ${
                  isSelected
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border bg-background'
                }`}>
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
          <Button type="button" variant="outline" onClick={handleClose} className="h-10 text-xs">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createGroupMutation.isPending || !groupName.trim() || selectedUsers.length < 2}
            className="h-10 text-xs font-semibold gap-2"
          >
            {createGroupMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Users className="h-4 w-4" />
                <span>Create Group</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
