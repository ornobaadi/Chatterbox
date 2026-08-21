import { apiClient } from './client';
import { Conversation, GetConversationsResponse, GetMessagesResponse, Message } from '../types';

export const conversationsApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const res = await apiClient<GetConversationsResponse>('/conversations');
    return res.data || [];
  },

  createDirectConversation: async (userId: string): Promise<Conversation> => {
    return apiClient<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  createGroupConversation: async (name: string, participantIds: string[]): Promise<Conversation> => {
    return apiClient<Conversation>('/conversations/group', {
      method: 'POST',
      body: JSON.stringify({ name, participantIds }),
    });
  },

  renameGroup: async (conversationId: string, name: string): Promise<Conversation> => {
    return apiClient<Conversation>(`/conversations/${conversationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  },

  promoteAdmin: async (conversationId: string, userId: string): Promise<Conversation> => {
    return apiClient<Conversation>(`/conversations/${conversationId}/admins`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  addParticipants: async (conversationId: string, userIds: string[]): Promise<Conversation> => {
    return apiClient<Conversation>(`/conversations/${conversationId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
  },

  removeParticipant: async (conversationId: string, userId: string): Promise<Conversation> => {
    return apiClient<Conversation>(`/conversations/${conversationId}/participants/${userId}`, {
      method: 'DELETE',
    });
  },

  getMessages: async (conversationId: string): Promise<GetMessagesResponse> => {
    return apiClient<GetMessagesResponse>(`/conversations/${conversationId}/messages`);
  },

  sendMessage: async (conversationId: string, text: string): Promise<Message> => {
    return apiClient<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId, text }),
    });
  },
};
