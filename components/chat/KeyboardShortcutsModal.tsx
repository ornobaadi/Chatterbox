'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Enter', description: 'Send message' },
  { key: 'Shift + Enter', description: 'Add new line in composer' },
  { key: 'd', description: 'Toggle Dark / Light theme' },
  { key: 'Esc', description: 'Close any active modal or dialog' },
  { key: '?', description: 'Open Keyboard Shortcuts cheat sheet' },
];

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      description="Power shortcuts for fast navigation"
      maxWidth="sm"
    >
      <div className="space-y-2.5 py-1">
        {SHORTCUTS.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/50 text-xs"
          >
            <span className="text-foreground font-medium">{item.description}</span>
            <kbd className="font-mono bg-card px-2 py-0.5 rounded-md border border-border text-foreground font-bold shadow-xs">
              {item.key}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
}
