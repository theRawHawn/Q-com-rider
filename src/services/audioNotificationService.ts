/**
 * Audio Notification Service (Swiggy / Zomato / Zepto style dispatch order notification tone)
 * Uses Web Audio API for zero-latency, offline-capable synthesized acoustics.
 * Plays crisp, single-shot operational notification chimes when new orders arrive.
 */

class AudioNotificationService {
  private audioCtx: AudioContext | null = null;
  private volume: number = 0.85;

  constructor() {
    try {
      const savedVol = localStorage.getItem('qcom_rider_audio_volume');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol) || 0.85;
      }
    } catch {
      // Ignore localStorage restrictions
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    try {
      if (!this.audioCtx) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }

      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch {
      // Audio context might be restricted before first interaction
    }

    return this.audioCtx;
  }

  /**
   * Plays a synthesized musical bell tone
   */
  private playTone(
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType = 'triangle',
    peakGain: number = 0.35
  ) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Slight frequency ramp for organic chime resonance
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(40, freq * 0.98),
        startTime + duration
      );

      // Smooth attack and clean exponential decay
      const effGain = peakGain * this.volume;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(effGain, startTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch {
      // Browser audio restriction safeguard
    }
  }

  /**
   * Swiggy/Zomato/Zepto style signature dispatch order chime (Plays once per order, clean & non-repeating)
   */
  public playNewOrderTone(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Clean, bright, energetic 4-note ascending chord chime (~0.65s total)
      // D5 (587.33Hz) -> F#5 (739.99Hz) -> A5 (880.00Hz) -> D6 (1174.66Hz)
      this.playTone(587.33, now + 0.00, 0.20, 'triangle', 0.40);
      this.playTone(739.99, now + 0.10, 0.22, 'triangle', 0.42);
      this.playTone(880.00, now + 0.20, 0.26, 'sine', 0.45);
      this.playTone(1174.66, now + 0.32, 0.45, 'sine', 0.50);

      // Synchronized single mobile haptic pulse
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([180, 80, 240]);
        } catch {
          // Ignore vibration errors
        }
      }
    } catch {
      // Safe fallback
    }
  }

  /**
   * Celebratory success chime when order is delivered & payout credited
   */
  public playDeliverySuccessChime(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.playTone(523.25, now, 0.18, 'triangle', 0.28);
      this.playTone(659.25, now + 0.08, 0.20, 'triangle', 0.32);
      this.playTone(783.99, now + 0.16, 0.24, 'sine', 0.36);
      this.playTone(1046.5, now + 0.26, 0.45, 'sine', 0.42);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([100, 50, 150]);
        } catch {
          // Ignore
        }
      }
    } catch {
      // Safe fallback
    }
  }

  /**
   * Subdued tactile operational beep for button taps and state toggles
   */
  public playActionBeep(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.playTone(880, now, 0.06, 'sine', 0.18);
    } catch {
      // Safe fallback
    }
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0.2, Math.min(1, vol));
    try {
      localStorage.setItem('qcom_rider_audio_volume', String(this.volume));
    } catch {
      // Ignore
    }
  }

  public getVolume(): number {
    return this.volume;
  }
}

export const audioNotificationService = new AudioNotificationService();
