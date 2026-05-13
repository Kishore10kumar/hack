export type AlertType = 'notification' | 'warning' | 'critical' | 'emergency';

class AudioAlerts {
  private audioContext: AudioContext | null = null;
  private isEnabled = true;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private ensureContext() {
    if (!this.audioContext) return false;
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return true;
  }

  private createTone(
    frequency: number,
    startTime: number,
    duration: number,
    volume: number = 0.3,
    type: OscillatorType = 'square'
  ): void {
    if (!this.audioContext || !this.isEnabled) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.setValueAtTime(volume, startTime + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private createSweep(
    freqStart: number,
    freqEnd: number,
    startTime: number,
    duration: number,
    volume: number = 0.35
  ): void {
    if (!this.audioContext || !this.isEnabled) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freqStart, startTime);
    osc.frequency.linearRampToValueAtTime(freqEnd, startTime + duration);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.setValueAtTime(volume, startTime + duration - 0.03);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  async playNotification(): Promise<void> {
    if (!this.ensureContext() || !this.audioContext) return;
    const t = this.audioContext.currentTime;
    this.createTone(880, t, 0.12, 0.2, 'sine');
    this.createTone(1100, t + 0.15, 0.12, 0.2, 'sine');
  }

  async playWarning(): Promise<void> {
    if (!this.ensureContext() || !this.audioContext) return;
    const t = this.audioContext.currentTime;
    // Two sharp descending tones
    this.createTone(1000, t, 0.18, 0.3, 'square');
    this.createTone(700, t + 0.22, 0.18, 0.3, 'square');
    this.createTone(1000, t + 0.48, 0.18, 0.3, 'square');
    this.createTone(700, t + 0.70, 0.18, 0.3, 'square');
  }

  async playCritical(): Promise<void> {
    if (!this.ensureContext() || !this.audioContext) return;
    const t = this.audioContext.currentTime;
    // Fast repeating horn-like bursts
    for (let i = 0; i < 4; i++) {
      this.createTone(900, t + i * 0.25, 0.18, 0.35, 'square');
      this.createTone(600, t + i * 0.25 + 0.10, 0.10, 0.25, 'square');
    }
  }

  async playEmergency(): Promise<void> {
    if (!this.ensureContext() || !this.audioContext) return;
    const t = this.audioContext.currentTime;
    // Siren wail: alternating high-low sweeps x4
    for (let i = 0; i < 4; i++) {
      const base = t + i * 0.6;
      this.createSweep(600, 1200, base, 0.28, 0.4);
      this.createSweep(1200, 600, base + 0.30, 0.28, 0.4);
    }
  }

  enable(): void { this.isEnabled = true; }
  disable(): void { this.isEnabled = false; }
  isAudioEnabled(): boolean { return this.isEnabled; }
}

const audioAlerts = new AudioAlerts();

export async function playAlertSound(type: AlertType): Promise<void> {
  try {
    switch (type) {
      case 'notification': await audioAlerts.playNotification(); break;
      case 'warning':      await audioAlerts.playWarning();      break;
      case 'critical':     await audioAlerts.playCritical();     break;
      case 'emergency':    await audioAlerts.playEmergency();    break;
    }
  } catch (error) {
    console.warn('Failed to play alert sound:', error);
  }
}

export function enableAudioAlerts(): void  { audioAlerts.enable(); }
export function disableAudioAlerts(): void { audioAlerts.disable(); }
export function isAudioEnabled(): boolean  { return audioAlerts.isAudioEnabled(); }
