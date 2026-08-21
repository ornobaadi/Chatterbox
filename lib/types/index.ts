export interface User {
  _id: string;
  name: string;
  phone: string;
  createdAt?: string;
}

export interface DirectParticipant {
  _id: string;
  name: string;
  phone: string;
}

export interface ConversationLastMessage {
  text: string;
  sender: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  type: 'direct' | 'group';
  name?: string;
  createdBy?: string;
  admins?: string[];
  participants?: DirectParticipant[] | string[];
  participant?: DirectParticipant; // for direct chats
  lastMessage?: ConversationLastMessage;
  createdAt?: string;
  updatedAt?: string;
}

export type MessageStatus = 'sending' | 'sent' | 'failed';

export interface Message {
  _id: string;
  conversation: string;
  sender: string; // userId string
  text: string;
  createdAt: string;
  status?: MessageStatus;
  tempId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GetMessagesResponse {
  messages: Message[];
  hasMore: boolean;
}

export interface GetConversationsResponse {
  data: Conversation[];
}
