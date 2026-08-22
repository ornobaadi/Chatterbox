import { create } from 'zustand';

export type AccentColor = 'blue' | 'emerald' | 'purple' | 'coral' | 'monochrome';
export type ChatDensity = 'comfortable' | 'compact';
export type FontSize = 'sm' | 'md' | 'lg';
export type TimestampDisplay = 'last_only' | 'all' | 'hidden';

interface UIState {
  accentColor: AccentColor;
  density: ChatDensity;
  fontSize: FontSize;
  timestampDisplay: TimestampDisplay;
  incomingSound: boolean;
  sentSound: boolean;
  
  setAccentColor: (color: AccentColor) => void;
  setDensity: (density: ChatDensity) => void;
  setFontSize: (size: FontSize) => void;
  setTimestampDisplay: (display: TimestampDisplay) => void;
  setIncomingSound: (enabled: boolean) => void;
  setSentSound: (enabled: boolean) => void;
}

const UI_SETTINGS_KEY = 'chatterbox_ui_settings';

export const useUIStore = create<UIState>((set, get) => {
  // Default settings: Only the last message displays relative timestamp by default
  let initialSettings = {
    accentColor: 'blue' as AccentColor,
    density: 'comfortable' as ChatDensity,
    fontSize: 'md' as FontSize,
    timestampDisplay: 'last_only' as TimestampDisplay,
    incomingSound: true,
    sentSound: true,
  };

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(UI_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Handle migration from previous timestampFormat key if present
        let display: TimestampDisplay = 'last_only';
        if (parsed.timestampDisplay) {
          display = parsed.timestampDisplay;
        } else if (parsed.timestampFormat === 'absolute') {
          display = 'all';
        }

        initialSettings = {
          ...initialSettings,
          ...parsed,
          timestampDisplay: display,
        };
      }
    } catch {}
  }

  const persist = (partial: Partial<typeof initialSettings>) => {
    if (typeof window !== 'undefined') {
      try {
        const current = JSON.parse(localStorage.getItem(UI_SETTINGS_KEY) || '{}');
        localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify({ ...current, ...partial }));
      } catch {}
    }
  };

  return {
    ...initialSettings,

    setAccentColor: (accentColor) => {
      set({ accentColor });
      persist({ accentColor });
    },

    setDensity: (density) => {
      set({ density });
      persist({ density });
    },

    setFontSize: (fontSize) => {
      set({ fontSize });
      persist({ fontSize });
    },

    setTimestampDisplay: (timestampDisplay) => {
      set({ timestampDisplay });
      persist({ timestampDisplay });
    },

    setIncomingSound: (incomingSound) => {
      set({ incomingSound });
      persist({ incomingSound });
    },

    setSentSound: (sentSound) => {
      set({ sentSound });
      persist({ sentSound });
    },
  };
});
