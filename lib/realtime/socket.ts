import { io, Socket } from 'socket.io-client';
import { SOCKET_BASE_URL } from '../api/client';
import { useChatStore } from '../store/chatStore';
import { QueryClient } from '@tanstack/react-query';
import { Conversation, Message } from '../types';
import { playIncomingChime } from '../audio';

let socketInstance: Socket | null = null;

export const initSocket = (token: string, queryClient?: QueryClient): Socket => {
  if (socketInstance) {
    if (socketInstance.connected) {
      return socketInstance;
    }
    socketInstance.disconnect();
  }

  socketInstance = io(SOCKET_BASE_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socketInstance.on('connect', () => {
    console.log('[Socket.io] Connected with id:', socketInstance?.id);
    useChatStore.getState().setSocketConnected(true);
  });

  socketInstance.on('disconnect', (reason) => {
    console.log('[Socket.io] Disconnected:', reason);
    useChatStore.getState().setSocketConnected(false);
  });

  socketInstance.on('connect_error', (err) => {
    console.warn('[Socket.io] Connection error:', err.message);
    useChatStore.getState().setSocketConnected(false);
  });

  // Real-time incoming message
  socketInstance.on('message:new', (rawMessage: any) => {
    const chatStore = useChatStore.getState();
    chatStore.addIncomingSocketMessage(rawMessage);

    // Audio chime if incoming from another user
    playIncomingChime();

    // Update conversation lastMessage in TanStack query cache if queryClient is provided
    if (queryClient) {
      const convId = rawMessage.conversation;
      const normalizedMsg: Message = {
        _id: rawMessage._id || rawMessage.id,
        conversation: convId,
        sender: rawMessage.sender,
        text: rawMessage.text,
        createdAt: typeof rawMessage.createdAt === 'number'
          ? new Date(rawMessage.createdAt).toISOString()
          : rawMessage.createdAt,
      };

      queryClient.setQueryData<Conversation[]>(['conversations'], (old) => {
        if (!old) return old;
        return old.map((conv) => {
          if (conv._id === convId) {
            return {
              ...conv,
              lastMessage: {
                text: normalizedMsg.text,
                sender: normalizedMsg.sender,
                createdAt: normalizedMsg.createdAt,
              },
              updatedAt: normalizedMsg.createdAt,
            };
          }
          return conv;
        }).sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      });
    }
  });

  // Real-time conversation updated (group rename, member changes, new group)
  socketInstance.on('conversation:updated', (updatedConv: Conversation) => {
    console.log('[Socket.io] conversation:updated:', updatedConv);
    if (queryClient) {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (updatedConv._id) {
        queryClient.invalidateQueries({ queryKey: ['conversation', updatedConv._id] });
      }
    }
  });

  return socketInstance;
};

export const getSocket = (): Socket | null => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    useChatStore.getState().setSocketConnected(false);
  }
};
