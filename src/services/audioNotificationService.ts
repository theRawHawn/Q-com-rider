/**
 * Audio Notification Service (Swiggy / Zomato style dispatch order chime & alert tones)
 * Uses Web Audio API for zero-latency, offline-capable synthesized acoustics.
 */

class AudioNotificationService {
  private audioCtx: AudioContext | null = null;
  private alertIntervalId: number | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;

  constructor() {
    // Restore mute preference if saved
    try {
      const savedMute = localStorage.getItem('qcom_rider_audio_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      const savedVol = localStorage.getItem('qcom_rider_audio_volume');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol) || 0.8;
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
    peakGain: number = 0.3
  ) {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Add slight pitch drop for authentic punchy bell acoustic
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(40, freq * 0.96),
        startTime + duration
      );

      // ADSR envelope: punchy instant attack, exponential smooth decay
      const effGain = peakGain * this.volume;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(effGain, startTime + 0.015);
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
   * Swiggy/Zomato style signature energetic Dispatch Ringtone (Triple ascending chime + double accent)
   */
  public playNewOrderTone(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Note frequencies (C Major / E Major bright pentatonic bell pattern)
      // E5 (659.25), G#5 (830.61), B5 (987.77), E6 (1318.51)
      const notes = [
        { freq: 659.25, time: 0.00, dur: 0.18, type: 'triangle' as OscillatorType },
        { freq: 830.61, time: 0.11, dur: 0.18, type: 'triangle' as OscillatorType },
        { freq: 987.77, time: 0.22, dur: 0.22, type: 'sine' as OscillatorType },
        { freq: 1318.51, time: 0.35, dur: 0.38, type: 'sine' as OscillatorType },
        // Secondary energetic double ping
        { freq: 987.77, time: 0.58, dur: 0.16, type: 'triangle' as OscillatorType },
        { freq: 1318.51, time: 0.70, dur: 0.45, type: 'sine' as OscillatorType },
      ];

      notes.forEach((n) => {
        this.playTone(n.freq, now + n.time, n.dur, n.type, 0.42);
      });

      // Synchronized mobile haptic vibration
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([180, 80, 180, 80, 320]);
        } catch {
          // Ignore vibration errors
        }
      }
    } catch {
      // Safe fallback
    }
  }

  /**
   * Starts looping the high-priority dispatch ringtone every 2.2 seconds (while incoming order modal is open)
   */
  public startOrderAlertLoop(): void {
    this.stopOrderAlertLoop();
    this.playNewOrderTone();

    this.alertIntervalId = window.setInterval(() => {
      this.playNewOrderTone();
    }, 2200);
  }

  /**
   * Stops the incoming order dispatch ringtone loop
   */
  public stopOrderAlertLoop(): void {
    if (this.alertIntervalId !== null) {
      clearInterval(this.alertIntervalId);
      this.alertIntervalId = null;
    }
  }

  /**
   * Celebratory success chime when order is delivered & cash/payout credited
   */
  public playDeliverySuccessChime(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Rich celebratory chord progression (C5 -> E5 -> G5 -> C6)
      this.playTone(523.25, now, 0.2, 'triangle', 0.25);
      this.playTone(659.25, now + 0.1, 0.2, 'triangle', 0.28);
      this.playTone(783.99, now + 0.2, 0.25, 'sine', 0.32);
      this.playTone(1046.5, now + 0.3, 0.5, 'sine', 0.4);

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
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.playTone(880, now, 0.06, 'sine', 0.15);
    } catch {
      // Safe fallback
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('qcom_rider_audio_muted', String(this.isMuted));
    } catch {
      // Ignore
    }
    if (this.isMuted) {
      this.stopOrderAlertLoop();
    } else {
      this.playNewOrderTone();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
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
