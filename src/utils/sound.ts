let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedCtx) {
    sharedCtx = new AudioCtx();
  }
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = 'sine',
  peakGain = 0.14,
  endFreq?: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime + startOffset;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.025);
}

export type SoundEffectName = 'correct' | 'wrong' | 'tap' | 'match' | 'complete' | 'streak';

export function playSoundEffect(effect: SoundEffectName, enabled: boolean): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    switch (effect) {
      case 'tap':
        // Subtle tactile click/pop
        playTone(ctx, 640, 0, 0.045, 'triangle', 0.08, 420);
        break;

      case 'match':
        // Crisp pair lock-in ping
        playTone(ctx, 587.33, 0, 0.1, 'triangle', 0.12);
        playTone(ctx, 880, 0.06, 0.16, 'sine', 0.13);
        break;

      case 'correct':
        // Bright ascending two-tone Duolingo-style chime (E5 -> A5 with bell overtone)
        playTone(ctx, 659.25, 0, 0.13, 'triangle', 0.15);
        playTone(ctx, 1318.5, 0, 0.09, 'sine', 0.05);
        playTone(ctx, 880.0, 0.09, 0.24, 'triangle', 0.16);
        playTone(ctx, 1760.0, 0.09, 0.18, 'sine', 0.06);
        break;

      case 'wrong':
        // Gentle low buzz/thud (soft descending tone + low percussive thud)
        playTone(ctx, 210, 0, 0.15, 'sawtooth', 0.065, 165);
        playTone(ctx, 155, 0.11, 0.24, 'triangle', 0.12, 118);
        break;

      case 'streak':
        // Cheerful sparkle chord (C5-E5-G5-B5-D6 ascending shimmer)
        playTone(ctx, 523.25, 0, 0.22, 'sine', 0.1);
        playTone(ctx, 659.25, 0.045, 0.24, 'triangle', 0.11);
        playTone(ctx, 783.99, 0.09, 0.26, 'sine', 0.12);
        playTone(ctx, 1046.5, 0.135, 0.3, 'triangle', 0.13);
        playTone(ctx, 1318.5, 0.18, 0.34, 'sine', 0.09);
        break;

      case 'complete':
        // Upbeat celebratory fanfare melody (C5 -> E5 -> G5 -> C6 with warm chord finish)
        playTone(ctx, 523.25, 0, 0.13, 'triangle', 0.14);
        playTone(ctx, 659.25, 0.11, 0.13, 'triangle', 0.14);
        playTone(ctx, 783.99, 0.22, 0.15, 'triangle', 0.15);
        playTone(ctx, 1046.5, 0.35, 0.44, 'triangle', 0.16);
        playTone(ctx, 523.25, 0.35, 0.42, 'sine', 0.09);
        playTone(ctx, 783.99, 0.35, 0.42, 'sine', 0.09);
        break;
    }
  } catch {
    // Gracefully ignore audio errors in headless or muted browsers
  }
}

export function speakJapanese(text: string, enabled: boolean, rate = 0.92): void {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = rate;
    utterance.pitch = 1.02;
    const voices = window.speechSynthesis.getVoices();
    const jpVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ja'));
    if (jpVoice) {
      utterance.voice = jpVoice;
    }
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech synthesis errors when unsupported
  }
}
