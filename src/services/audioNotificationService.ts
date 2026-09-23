/**
 * Audio Notification Service (Swiggy / Zomato style dispatch order chime & alert tones)
 * Uses Web Audio API for zero-latency, offline-capable synthesized acoustics.
 * Notification sounds are mandatory and always active for operational dispatch alerts.
 */

class AudioNotificationService {
  private audioCtx: AudioContext | null = null;
  private alertIntervalId: number | null = null;
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

      // Slight pitch drop for punchy dispatch acoustic
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(40, freq * 0.96),
        startTime + duration
      );

      // ADSR envelope
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
   * Swiggy/Zomato style signature energetic Dispatch Ringtone (Ascending chime + double accent)
   */
  public playNewOrderTone(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Note frequencies (C Major / E Major bright pentatonic bell pattern)
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
        this.playTone(n.freq, now + n.time, n.dur, n.type, 0.45);
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
   * Celebratory success chime when order is delivered & payout credited
   */
  public playDeliverySuccessChime(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.playTone(523.25, now, 0.2, 'triangle', 0.28);
      this.playTone(659.25, now + 0.1, 0.2, 'triangle', 0.32);
      this.playTone(783.99, now + 0.2, 0.25, 'sine', 0.36);
      this.playTone(1046.5, now + 0.3, 0.5, 'sine', 0.42);

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
