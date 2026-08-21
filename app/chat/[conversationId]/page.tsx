'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessagePanel } from '@/components/chat/MessagePanel';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params?.conversationId as string;

  if (!conversationId) {
    return null;
  }

  return (
    <MessagePanel
      conversationId={conversationId}
      onBack={() => router.push('/chat')}
    />
  );
}
