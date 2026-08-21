'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/authStore';
import { initSocket, disconnectSocket } from '@/lib/realtime/socket';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30 seconds
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      })
  );

  const initAuth = useAuthStore((s) => s.initAuth);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    // Clear previous user cache on session switch
    queryClient.clear();

    if (isAuthenticated && token) {
      const socket = initSocket(token, queryClient);
      return () => {
        // We keep socket active across navigation, disconnect only if logged out
      };
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, token, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
