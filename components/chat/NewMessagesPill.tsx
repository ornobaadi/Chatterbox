'use client';

import React from 'react';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewMessagesPillProps {
  show: boolean;
  onClick: () => void;
  count?: number;
}

export function NewMessagesPill({ show, onClick, count }: NewMessagesPillProps) {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute bottom-20 right-1/2 translate-x-1/2 z-30 flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-105 active:scale-95 animate-in slide-in-from-bottom-2 fade-in cursor-pointer border border-primary-foreground/20'
      )}
    >
      <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
      <span>{count && count > 1 ? `${count} new messages` : 'New messages'}</span>
    </button>
  );
}
