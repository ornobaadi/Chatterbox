'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { conversationsApi } from '@/lib/api/conversations';
import { usersApi } from '@/lib/api/users';
import { Conversation, DirectParticipant, User } from '@/lib/types';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, UserMinus, UserPlus, Edit3, LogOut, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  onLeaveSuccess: () => void;
}

export function GroupInfoModal({
  isOpen,
  onClose,
  conversation,
  onLeaveSuccess,
}: GroupInfoModalProps) {
  const currentUserId = useAuthStore((s) => s.user?._id);
  const queryClient = useQueryClient();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState(conversation.name || '');
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedNewUsers, setSelectedNewUsers] = useState<User[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAdmin = Boolean(
    currentUserId &&
    (conversation.admins?.includes(currentUserId) || conversation.createdBy === currentUserId)
  );

  const participants = (conversation.participants || []) as DirectParticipant[];

  // Mutations
  const renameMutation = useMutation({
    mutationFn: (name: string) => conversationsApi.renameGroup(conversation._id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setIsEditingName(false);
    },
    onError: (err: any) => setErrorMsg(err.message || 'Failed to rename group'),
  });

  const promoteMutation = useMutation({
    mutationFn: (userId: string) => conversationsApi.promoteAdmin(conversation._id, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
    onError: (err: any) => setErrorMsg(err.message || 'Failed to promote member'),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => conversationsApi.removeParticipant(conversation._id, userId),
    onSuccess: (_, removedUserId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (removedUserId === currentUserId) {
        onLeaveSuccess();
        onClose();
      }
    },
    onError: (err: any) => setErrorMsg(err.message || 'Failed to remove member'),
  });

  const addMembersMutation = useMutation({
    mutationFn: (userIds: string[]) => conversationsApi.addParticipants(conversation._id, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setIsAddingMembers(false);
      setSelectedNewUsers([]);
      setMemberSearchQuery('');
    },
    onError: (err: any) => setErrorMsg(err.message || 'Failed to add members'),
  });

  const { data: searchResults, isLoading: isSearching } = useQuery<User[]>({
    queryKey: ['users', 'add-group-search', memberSearchQuery],
    queryFn: () => usersApi.searchUsers(memberSearchQuery),
    enabled: isAddingMembers && memberSearchQuery.trim().length > 0,
  });

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      renameMutation.mutate(newGroupName.trim());
    }
  };

  const handleAddSelectedMembers = () => {
    if (selectedNewUsers.length > 0) {
      addMembersMutation.mutate(selectedNewUsers.map((u) => u._id));
    }
  };

  const existingParticipantIds = new Set(participants.map((p) => p._id));
  const filteredCandidates = (searchResults || []).filter((u) => {
    if (existingParticipantIds.has(u._id)) return false;
    if (!memberSearchQuery.trim()) return true;
    const q = memberSearchQuery.trim().toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(q);
    const phoneMatch = u.phone?.toLowerCase().includes(q);
    return nameMatch || phoneMatch;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Group Details"
      description="Manage members and group configuration"
      maxWidth="md"
    >
      <div className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Group Name & Header */}
        <div className="rounded-2xl bg-muted/40 p-4 border border-border/50">
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-2">
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="h-9 text-sm"
                autoFocus
              />
              <Button type="submit" size="sm" disabled={renameMutation.isPending} className="h-9">
                {renameMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditingName(false)}
                className="h-9"
              >
                Cancel
              </Button>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-foreground truncate">{conversation.name}</h3>
                <p className="text-xs text-muted-foreground">{participants.length} participants</p>
              </div>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingName(true)}
                  className="h-8 text-xs gap-1.5"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Rename</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Add Members Section (Admins only) */}
        {isAdmin && !isAddingMembers && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingMembers(true)}
            className="w-full h-9.5 text-xs gap-2 border-dashed"
          >
            <UserPlus className="h-4 w-4 text-primary" />
            <span>Add More Participants</span>
          </Button>
        )}

        {isAdmin && isAddingMembers && (
          <div className="p-3.5 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Add New Participants</span>
              <button
                onClick={() => {
                  setIsAddingMembers(false);
                  setSelectedNewUsers([]);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
            <Input
              placeholder="Search user to add..."
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              className="h-9 text-xs"
            />
            {isSearching && <p className="text-xs text-muted-foreground text-center">Searching...</p>}
            <div className="max-h-36 overflow-y-auto space-y-1">
              {filteredCandidates.map((user) => {
                const isSelected = selectedNewUsers.some((u) => u._id === user._id);
                return (
                  <div
                    key={user._id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedNewUsers(selectedNewUsers.filter((u) => u._id !== user._id));
                      } else {
                        setSelectedNewUsers([...selectedNewUsers, user]);
                      }
                    }}
                    className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer text-xs ${
                      isSelected ? 'bg-primary/20' : 'hover:bg-muted/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar name={user.name} size="sm" className="w-6 h-6 text-[10px]" />
                      <span>{user.name}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                );
              })}
            </div>
            {selectedNewUsers.length > 0 && (
              <Button
                size="sm"
                onClick={handleAddSelectedMembers}
                disabled={addMembersMutation.isPending}
                className="w-full h-8 text-xs font-semibold"
              >
                {addMembersMutation.isPending ? 'Adding...' : `Add Selected (${selectedNewUsers.length})`}
              </Button>
            )}
          </div>
        )}

        {/* Participants List */}
        <div className="space-y-1.5">
          <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Members
          </span>
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {participants.map((member) => {
              const isMemberAdmin =
                conversation.admins?.includes(member._id) ||
                conversation.createdBy === member._id;
              const isMe = member._id === currentUserId;

              return (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/50 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={member.name} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground truncate">
                          {member.name} {isMe && '(You)'}
                        </span>
                        {isMemberAdmin && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-1">
                            <Crown className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                            <span>Admin</span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{member.phone}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {isAdmin && !isMemberAdmin && !isMe && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => promoteMutation.mutate(member._id)}
                        disabled={promoteMutation.isPending}
                        className="h-7 text-[11px] px-2"
                        title="Promote to admin"
                      >
                        Make Admin
                      </Button>
                    )}

                    {isAdmin && !isMe && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMemberMutation.mutate(member._id)}
                        disabled={removeMemberMutation.isPending}
                        className="h-7 w-7 p-0"
                        title="Remove member"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Group Action */}
        <div className="pt-2 border-t border-border/50 flex justify-between items-center">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (currentUserId && confirm('Are you sure you want to leave this group?')) {
                removeMemberMutation.mutate(currentUserId);
              }
            }}
            disabled={removeMemberMutation.isPending}
            className="h-9 text-xs gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Leave Group</span>
          </Button>

          <Button variant="outline" size="sm" onClick={onClose} className="h-9 text-xs">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
