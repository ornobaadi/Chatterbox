import { create } from 'zustand';
import { Message } from '../types';

interface ChatState {
  activeConversationId: string | null;
  messages: Record<string, Message[]>; // conversationId -> messages
  socketConnected: boolean;
  
  setActiveConversationId: (id: string | null) => void;
  setMessagesForConversation: (conversationId: string, messages: Message[]) => void;
  addOptimisticMessage: (conversationId: string, text: string, senderId: string) => string;
  reconcileMessageSuccess: (conversationId: string, tempId: string, serverMessage: Message) => void;
  markMessageFailed: (conversationId: string, tempId: string) => void;
  addIncomingSocketMessage: (message: Message) => void;
  setSocketConnected: (connected: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  activeConversationId: null,
  messages: {},
  socketConnected: false,

  setActiveConversationId: (id) => set({ activeConversationId: id }),

  setMessagesForConversation: (conversationId, messages) => {
    set((state) => {
      const currentList = state.messages[conversationId] || [];
      // Keep any currently sending / failed optimistic messages
      const pendingOptimistic = currentList.filter(m => m.status === 'sending' || m.status === 'failed');
      
      // Deduplicate server messages
      const existingIds = new Set(messages.map(m => m._id));
      const filteredPending = pendingOptimistic.filter(m => !existingIds.has(m._id) && !existingIds.has(m.tempId || ''));

      return {
        messages: {
          ...state.messages,
          [conversationId]: [...messages, ...filteredPending],
        },
      };
    });
  },

  addOptimisticMessage: (conversationId, text, senderId) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const optimisticMessage: Message = {
      _id: tempId,
      tempId,
      conversation: conversationId,
      sender: senderId,
      text,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    set((state) => {
      const currentList = state.messages[conversationId] || [];
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...currentList, optimisticMessage],
        },
      };
    });

    return tempId;
  },

  reconcileMessageSuccess: (conversationId, tempId, serverMessage) => {
    set((state) => {
      const currentList = state.messages[conversationId] || [];
      const updatedList = currentList.map((msg) => {
        if (msg.tempId === tempId || msg._id === tempId) {
          return {
            ...serverMessage,
            status: 'sent' as const,
            tempId,
          };
        }
        return msg;
      });

      return {
        messages: {
          ...state.messages,
          [conversationId]: updatedList,
        },
      };
    });
  },

  markMessageFailed: (conversationId, tempId) => {
    set((state) => {
      const currentList = state.messages[conversationId] || [];
      const updatedList = currentList.map((msg) => {
        if (msg.tempId === tempId || msg._id === tempId) {
          return {
            ...msg,
            status: 'failed' as const,
          };
        }
        return msg;
      });

      return {
        messages: {
          ...state.messages,
          [conversationId]: updatedList,
        },
      };
    });
  },

  addIncomingSocketMessage: (rawMessage) => {
    // Normalize socket message format if needed (e.g. { id, createdAt timestamp })
    const normalized: Message = {
      _id: (rawMessage as any)._id || (rawMessage as any).id,
      conversation: rawMessage.conversation,
      sender: rawMessage.sender,
      text: rawMessage.text,
      createdAt: typeof rawMessage.createdAt === 'number'
        ? new Date(rawMessage.createdAt).toISOString()
        : rawMessage.createdAt,
      status: 'sent',
    };

    const convId = normalized.conversation;
    if (!convId) return;

    set((state) => {
      const currentList = state.messages[convId] || [];
      // If message already exists by _id or matching text & sending status, reconcile / ignore
      const alreadyExists = currentList.some(m => m._id === normalized._id);
      if (alreadyExists) return state;

      // Check if there's an optimistic message with matching sender, text, and sending status
      const matchingOptimisticIndex = currentList.findIndex(
        m => m.status === 'sending' && m.text === normalized.text && m.sender === normalized.sender
      );

      if (matchingOptimisticIndex !== -1) {
        const updatedList = [...currentList];
        updatedList[matchingOptimisticIndex] = normalized;
        return {
          messages: {
            ...state.messages,
            [convId]: updatedList,
          },
        };
      }

      return {
        messages: {
          ...state.messages,
          [convId]: [...currentList, normalized],
        },
      };
    });
  },

  setSocketConnected: (connected) => set({ socketConnected: connected }),
}));
