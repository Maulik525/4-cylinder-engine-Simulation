/**
 * Web Audio API Engine Sound Synthesizer
 * Generates dynamic 4-cylinder engine exhaust rumble and ignition pulses
 */

class EngineAudioSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private lowRumbleOsc: OscillatorNode | null = null;
  private midRumbleOsc: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private isRunning: boolean = false;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.15, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch {
      // Audio not supported in environment
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      if (this.ctx.state === 'suspended' && !muted) {
        this.ctx.resume();
      }
      const targetGain = muted ? 0 : 0.14;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public startSound(rpm: number) {
    if (!this.ctx) {
      this.init();
    }
    if (!this.ctx || this.isRunning) return;

    try {
      // 4-cylinder firing frequency: (RPM / 60) * 2 pulses per second
      const baseFreq = Math.max(12, (rpm / 60) * 2);

      // Sub-bass cylinder pulse oscillator
      this.lowRumbleOsc = this.ctx.createOscillator();
      this.lowRumbleOsc.type = 'sawtooth';
      this.lowRumbleOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(baseFreq * 3.5, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      // Mid harmonic engine growl
      this.midRumbleOsc = this.ctx.createOscillator();
      this.midRumbleOsc.type = 'triangle';
      this.midRumbleOsc.frequency.setValueAtTime(baseFreq * 2, this.ctx.currentTime);

      const midFilter = this.ctx.createBiquadFilter();
      midFilter.type = 'bandpass';
      midFilter.frequency.setValueAtTime(baseFreq * 4, this.ctx.currentTime);
      midFilter.Q.setValueAtTime(1.0, this.ctx.currentTime);

      if (this.masterGain) {
        this.lowRumbleOsc.connect(filter);
        filter.connect(this.masterGain);

        this.midRumbleOsc.connect(midFilter);
        midFilter.connect(this.masterGain);
      }

      this.lowRumbleOsc.start();
      this.midRumbleOsc.start();
      this.isRunning = true;
    } catch {
      // ignore
    }
  }

  public updateRpm(rpm: number) {
    if (!this.ctx || !this.isRunning) return;
    const baseFreq = Math.max(12, (rpm / 60) * 2);
    const now = this.ctx.currentTime;

    if (this.lowRumbleOsc) {
      this.lowRumbleOsc.frequency.setTargetAtTime(baseFreq, now, 0.08);
    }
    if (this.midRumbleOsc) {
      this.midRumbleOsc.frequency.setTargetAtTime(baseFreq * 2, now, 0.08);
    }
  }

  public triggerSparkPop() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      // High frequency spark arc zap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + Math.random() * 300, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // ignore
    }
  }

  public stopSound() {
    try {
      if (this.lowRumbleOsc) {
        this.lowRumbleOsc.stop();
        this.lowRumbleOsc.disconnect();
        this.lowRumbleOsc = null;
      }
      if (this.midRumbleOsc) {
        this.midRumbleOsc.stop();
        this.midRumbleOsc.disconnect();
        this.midRumbleOsc = null;
      }
      this.isRunning = false;
    } catch {
      // ignore
    }
  }
}

export const engineAudio = new EngineAudioSystem();
