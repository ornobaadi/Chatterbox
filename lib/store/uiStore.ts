import { create } from 'zustand';

export type AccentColor = 'blue' | 'emerald' | 'purple' | 'coral' | 'monochrome';
export type ChatDensity = 'comfortable' | 'compact';
export type FontSize = 'sm' | 'md' | 'lg';
export type TimestampFormat = 'absolute' | 'relative';

interface UIState {
  accentColor: AccentColor;
  density: ChatDensity;
  fontSize: FontSize;
  timestampFormat: TimestampFormat;
  incomingSound: boolean;
  sentSound: boolean;
  
  setAccentColor: (color: AccentColor) => void;
  setDensity: (density: ChatDensity) => void;
  setFontSize: (size: FontSize) => void;
  setTimestampFormat: (format: TimestampFormat) => void;
  setIncomingSound: (enabled: boolean) => void;
  setSentSound: (enabled: boolean) => void;
}

const UI_SETTINGS_KEY = 'chatterbox_ui_settings';

export const useUIStore = create<UIState>((set, get) => {
  // Load saved settings
  let initialSettings = {
    accentColor: 'blue' as AccentColor,
    density: 'comfortable' as ChatDensity,
    fontSize: 'md' as FontSize,
    timestampFormat: 'absolute' as TimestampFormat,
    incomingSound: true,
    sentSound: true,
  };

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(UI_SETTINGS_KEY);
      if (saved) {
        initialSettings = { ...initialSettings, ...JSON.parse(saved) };
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

    setTimestampFormat: (timestampFormat) => {
      set({ timestampFormat });
      persist({ timestampFormat });
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
