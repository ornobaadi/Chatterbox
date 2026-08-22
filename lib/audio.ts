/**
 * High-reliability Web Audio + HTML5 Audio fallback chime synthesizer.
 * Generates crisp, audible message notification chimes.
 */

let globalAudioCtx: AudioContext | null = null;
let isUnlocked = false;

// Pre-cached audio fallback elements
let incomingAudioFallback: HTMLAudioElement | null = null;
let sendAudioFallback: HTMLAudioElement | null = null;

/**
 * Generate a 16-bit mono PCM WAV Data URI from float samples [-1.0, 1.0]
 */
function createWavDataUri(samples: Float32Array, sampleRate: number = 22050): string {
  const numSamples = samples.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // Helper to write ASCII string
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');

  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample (16-bit)

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  // Base64 encoding
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

/**
 * Synthesize incoming two-tone chime buffer (E5: 659.25Hz -> B5: 987.77Hz with warm harmonics)
 */
function buildIncomingChimeWav(): string {
  const sampleRate = 22050;
  const duration = 0.45;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Tone 1: E5 (659Hz) starting at t=0s
    if (t < 0.3) {
      const decay = Math.exp(-t * 12);
      const tone = Math.sin(2 * Math.PI * 659.25 * t) * 0.7 +
                   Math.sin(2 * Math.PI * 1318.5 * t) * 0.2;
      sample += tone * decay * 0.55;
    }

    // Tone 2: B5 (988Hz) starting at t=0.09s
    if (t >= 0.09) {
      const t2 = t - 0.09;
      const decay = Math.exp(-t2 * 10);
      const tone = Math.sin(2 * Math.PI * 987.77 * t2) * 0.7 +
                   Math.sin(2 * Math.PI * 1975.5 * t2) * 0.2;
      sample += tone * decay * 0.6;
    }

    samples[i] = sample;
  }

  return createWavDataUri(samples, sampleRate);
}

/**
 * Synthesize sent swoosh-pop buffer (C5 -> G5 upward pitch sweep)
 */
function buildSendChimeWav(): string {
  const sampleRate = 22050;
  const duration = 0.22;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const freq = 523.25 + (783.99 - 523.25) * (t / duration);
    const decay = Math.exp(-t * 14);
    const sample = Math.sin(2 * Math.PI * freq * t) * decay * 0.5;
    samples[i] = sample;
  }

  return createWavDataUri(samples, sampleRate);
}

/**
 * Unlocks audio context on user interaction globally
 */
function setupGlobalUnlock() {
  if (typeof window === 'undefined' || isUnlocked) return;

  const unlock = async () => {
    if (isUnlocked) return;
    try {
      if (!globalAudioCtx) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          globalAudioCtx = new AudioContextClass();
        }
      }
      if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
        await globalAudioCtx.resume();
      }
      isUnlocked = true;

      // Remove interaction listeners once unlocked
      ['pointerdown', 'touchstart', 'click', 'keydown'].forEach((event) => {
        window.removeEventListener(event, unlock);
      });
    } catch {
      // Ignored
    }
  };

  ['pointerdown', 'touchstart', 'click', 'keydown'].forEach((event) => {
    window.addEventListener(event, unlock, { once: true, passive: true });
  });
}

// Initialize global unlock on import if in browser
if (typeof window !== 'undefined') {
  setupGlobalUnlock();
}

async function getAudioContext(): Promise<AudioContext | null> {
  if (typeof window === 'undefined') return null;

  if (!globalAudioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }

  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    try {
      await globalAudioCtx.resume();
      isUnlocked = true;
    } catch {
      // May fail if no gesture yet
    }
  }

  return globalAudioCtx;
}

/**
 * Play HTML5 Audio fallback
 */
function playFallback(type: 'incoming' | 'sent') {
  if (typeof window === 'undefined') return;
  try {
    if (type === 'incoming') {
      if (!incomingAudioFallback) {
        incomingAudioFallback = new Audio(buildIncomingChimeWav());
      }
      incomingAudioFallback.currentTime = 0;
      incomingAudioFallback.volume = 0.6;
      incomingAudioFallback.play().catch(() => {});
    } else {
      if (!sendAudioFallback) {
        sendAudioFallback = new Audio(buildSendChimeWav());
      }
      sendAudioFallback.currentTime = 0;
      sendAudioFallback.volume = 0.5;
      sendAudioFallback.play().catch(() => {});
    }
  } catch {
    // Ignored
  }
}

/**
 * Play a crisp, pleasant two-tone incoming chime (E5 -> B5).
 */
export async function playIncomingChime(): Promise<void> {
  try {
    const ctx = await getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      playFallback('incoming');
      return;
    }

    const now = ctx.currentTime;

    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.35, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.28);

    // Note 2: B5 (987.77 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.09);
    gain2.gain.setValueAtTime(0, now + 0.09);
    gain2.gain.linearRampToValueAtTime(0.4, now + 0.105);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.42);
  } catch {
    playFallback('incoming');
  }
}

/**
 * Play a subtle upward swoosh on sent message (C5 -> G5).
 */
export async function playSendChime(): Promise<void> {
  try {
    const ctx = await getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      playFallback('sent');
      return;
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  } catch {
    playFallback('sent');
  }
}

/**
 * Warm up audio context on user interaction
 */
export async function primeAudioContext(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await getAudioContext();
  } catch {}
}

export function isSoundEnabled(): boolean {
  return true;
}

export function setSoundEnabled(_enabled: boolean): void {}
