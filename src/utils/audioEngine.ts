// Web Audio API Procedural Sound Engine for Vice Customs

class ViceAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  
  private muteListeners: Set<(muted: boolean) => void> = new Set();
  private radioListeners: Set<(station: string | null) => void> = new Set();

  constructor() {
    this.isMuted = localStorage.getItem('vice_audio_muted') === '1';
  }

  public subscribeMute(cb: (muted: boolean) => void) {
    this.muteListeners.add(cb);
    return () => this.muteListeners.delete(cb);
  }

  public subscribeRadio(cb: (station: string | null) => void) {
    this.radioListeners.add(cb);
    return () => this.radioListeners.delete(cb);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('vice_audio_muted', this.isMuted ? '1' : '0');
    if (this.isMuted) {
      this.stopEngine();
      this.stopRadio();
    }
    this.muteListeners.forEach(cb => cb(this.isMuted));
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Engine Rev System
  private engineIdleOsc1: OscillatorNode | null = null;
  private engineIdleOsc2: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private turboOsc: OscillatorNode | null = null;
  private isEngineRunning: boolean = false;
  private currentRPM: number = 800; // Idle 800 RPM up to 8000 RPM

  // Spray Paint SFX
  private sprayNoiseNode: AudioBufferSourceNode | null = null;
  private sprayGain: GainNode | null = null;
  private sprayFilter: BiquadFilterNode | null = null;

  // Radio Synth
  private radioInterval: any = null;
  private currentRadioStation: string | null = null;
  private radioMasterGain: GainNode | null = null;
  private radioVolume: number = 0.4;

  private initCtx() {
    if (this.isMuted) return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- ENGINE REV SOUNDS ---
  public toggleEngine(on?: boolean) {
    this.initCtx();
    if (!this.ctx) return;

    const targetState = on !== undefined ? on : !this.isEngineRunning;
    if (targetState === this.isEngineRunning) return;

    if (targetState) {
      this.startEngineAudio();
    } else {
      this.stopEngineAudio();
    }
  }

  private startEngineAudio() {
    if (!this.ctx) return;
    this.isEngineRunning = true;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    // V8 Engine Rumble Oscillators (Sawtooth + Lowpass)
    this.engineIdleOsc1 = this.ctx.createOscillator();
    this.engineIdleOsc2 = this.ctx.createOscillator();

    this.engineIdleOsc1.type = 'sawtooth';
    this.engineIdleOsc2.type = 'triangle';

    this.engineIdleOsc1.frequency.setValueAtTime(40, this.ctx.currentTime); // 40Hz base
    this.engineIdleOsc2.frequency.setValueAtTime(20, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, this.ctx.currentTime);

    this.engineIdleOsc1.connect(filter);
    this.engineIdleOsc2.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);

    this.engineIdleOsc1.start();
    this.engineIdleOsc2.start();
  }

  private revTimeout: any = null;

  public isEngineActive(): boolean {
    return this.isEngineRunning;
  }

  public revEngine(durationMs: number = 2200, onComplete?: () => void) {
    this.initCtx();
    if (!this.ctx) return;

    // Clear previous rev timeout if re-triggered
    if (this.revTimeout) {
      clearTimeout(this.revTimeout);
      this.revTimeout = null;
    }

    if (!this.isEngineRunning) {
      this.startEngineAudio();
    }

    const now = this.ctx.currentTime;
    const revTime = durationMs / 1000;

    if (this.engineIdleOsc1 && this.engineIdleOsc2 && this.engineGain) {
      // RPM curve up then ramp down to silent
      this.engineIdleOsc1.frequency.cancelScheduledValues(now);
      this.engineIdleOsc2.frequency.cancelScheduledValues(now);
      this.engineGain.gain.cancelScheduledValues(now);

      // Pitch up (Rev scream)
      this.engineIdleOsc1.frequency.setValueAtTime(45, now);
      this.engineIdleOsc1.frequency.exponentialRampToValueAtTime(180, now + revTime * 0.4);
      this.engineIdleOsc1.frequency.exponentialRampToValueAtTime(35, now + revTime * 0.95);

      this.engineIdleOsc2.frequency.setValueAtTime(22, now);
      this.engineIdleOsc2.frequency.exponentialRampToValueAtTime(90, now + revTime * 0.4);
      this.engineIdleOsc2.frequency.exponentialRampToValueAtTime(18, now + revTime * 0.95);

      this.engineGain.gain.setValueAtTime(0.25, now);
      this.engineGain.gain.linearRampToValueAtTime(0.55, now + revTime * 0.4);
      this.engineGain.gain.linearRampToValueAtTime(0.15, now + revTime * 0.75);
      this.engineGain.gain.exponentialRampToValueAtTime(0.0001, now + revTime);

      // Turbo Spool Whistle
      const turboOsc = this.ctx.createOscillator();
      const turboGain = this.ctx.createGain();
      turboOsc.type = 'sine';
      turboOsc.frequency.setValueAtTime(1200, now);
      turboOsc.frequency.exponentialRampToValueAtTime(4500, now + revTime * 0.4);
      
      turboGain.gain.setValueAtTime(0.01, now);
      turboGain.gain.linearRampToValueAtTime(0.12, now + revTime * 0.4);
      turboGain.gain.linearRampToValueAtTime(0, now + revTime * 0.5);

      turboOsc.connect(turboGain);
      turboGain.connect(this.ctx.destination);
      turboOsc.start(now);
      turboOsc.stop(now + revTime * 0.55);

      // Blow-off Valve Hiss (White noise burst at peak rev)
      setTimeout(() => {
        this.playBlowOffValve();
        this.triggerExhaustPop();
      }, revTime * 400);

      // Auto stop engine audio after revTime completes
      this.revTimeout = setTimeout(() => {
        this.stopEngineAudio();
        if (onComplete) onComplete();
      }, durationMs);
    }
  }

  public stopEngine() {
    if (this.revTimeout) {
      clearTimeout(this.revTimeout);
      this.revTimeout = null;
    }
    this.stopEngineAudio();
  }

  private playBlowOffValve() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25; // 250ms hiss
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  private triggerExhaustPop() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    popOsc.type = 'triangle';
    popOsc.frequency.setValueAtTime(150, now);
    popOsc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

    popGain.gain.setValueAtTime(0.4, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    popOsc.connect(popGain);
    popGain.connect(this.ctx.destination);
    popOsc.start(now);
    popOsc.stop(now + 0.08);
  }

  public stopEngineAudio() {
    this.isEngineRunning = false;
    if (this.engineIdleOsc1) {
      try {
        this.engineIdleOsc1.stop();
        this.engineIdleOsc1.disconnect();
      } catch {}
      this.engineIdleOsc1 = null;
    }
    if (this.engineIdleOsc2) {
      try {
        this.engineIdleOsc2.stop();
        this.engineIdleOsc2.disconnect();
      } catch {}
      this.engineIdleOsc2 = null;
    }
  }

  // --- SPRAY PAINT AEROSOL SFX ---
  public playSprayPaintSFX() {
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.15; // 150ms spray burst
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4500, now);
    filter.Q.setValueAtTime(1.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  public playClickSFX() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playTransitionSFX() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // --- SYNTHWAVE RADIO ENGINE ---
  public playRadioStation(stationId: string) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.stopRadio();
    this.currentRadioStation = stationId;
    this.radioListeners.forEach(cb => cb(stationId));

    this.radioMasterGain = this.ctx.createGain();
    this.radioMasterGain.gain.setValueAtTime(this.radioVolume, this.ctx.currentTime);
    this.radioMasterGain.connect(this.ctx.destination);

    // Synth beat generator per station
    let step = 0;
    const bpm = stationId === 'vrock' ? 140 : stationId === 'wave103' ? 125 : stationId === 'wildstyle' ? 115 : 120;
    const intervalMs = (60 / bpm / 4) * 1000;

    // Frequencies for synthwave arpeggio
    const flashNotes = [220, 261.63, 329.63, 392, 440, 523.25]; // A minor / C major
    const waveNotes = [146.83, 174.61, 220, 261.63, 293.66]; // D minor dark synth
    const rockNotes = [110, 130.81, 146.83, 164.81, 220]; // A power chord riffs
    const wildNotes = [130.81, 155.56, 174.61, 196, 233.08]; // C minor synth electro

    this.radioInterval = setInterval(() => {
      if (!this.ctx || !this.radioMasterGain) return;
      const now = this.ctx.currentTime;

      // Kick drum on beats 0, 4, 8, 12
      if (step % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.frequency.setValueAtTime(130, now);
        kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.08);
        kickGain.gain.setValueAtTime(0.35, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        kickOsc.connect(kickGain);
        kickGain.connect(this.radioMasterGain);
        kickOsc.start(now);
        kickOsc.stop(now + 0.08);
      }

      // Synth Note
      let notes = flashNotes;
      if (stationId === 'wave103') notes = waveNotes;
      if (stationId === 'vrock') notes = rockNotes;
      if (stationId === 'wildstyle') notes = wildNotes;

      const noteFreq = notes[step % notes.length];

      const synthOsc = this.ctx.createOscillator();
      const synthGain = this.ctx.createGain();
      const synthFilter = this.ctx.createBiquadFilter();

      synthOsc.type = stationId === 'vrock' ? 'sawtooth' : stationId === 'wave103' ? 'square' : 'sawtooth';
      synthOsc.frequency.setValueAtTime(noteFreq, now);

      synthFilter.type = 'lowpass';
      synthFilter.frequency.setValueAtTime(1200 + Math.sin(step) * 600, now);

      synthGain.gain.setValueAtTime(0.12, now);
      synthGain.gain.exponentialRampToValueAtTime(0.005, now + 0.12);

      synthOsc.connect(synthFilter);
      synthFilter.connect(synthGain);
      synthGain.connect(this.radioMasterGain);

      synthOsc.start(now);
      synthOsc.stop(now + 0.12);

      step++;
    }, intervalMs);
  }

  public stopRadio() {
    if (this.radioInterval) {
      clearInterval(this.radioInterval);
      this.radioInterval = null;
    }
    if (this.radioMasterGain) {
      this.radioMasterGain.disconnect();
      this.radioMasterGain = null;
    }
    this.currentRadioStation = null;
    this.radioListeners.forEach(cb => cb(null));
  }

  public setRadioVolume(vol: number) {
    this.radioVolume = vol;
    if (this.radioMasterGain && this.ctx) {
      this.radioMasterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  public getCurrentStation() {
    return this.currentRadioStation;
  }
}

export const audioEngine = new ViceAudioEngine();
