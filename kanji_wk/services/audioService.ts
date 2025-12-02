
import { Theme } from '../types';

class AudioService {
  private ctx: AudioContext | null = null;
  private currentTheme: Theme = 'KIRBY';

  private getContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  public setTheme(theme: Theme) {
    this.currentTheme = theme;
  }

  // --- Helpers for Synthesis ---

  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.1) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  }

  private playSweep(startFreq: number, endFreq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  // --- Specialized Animal Sounds ---

  private playCatSound(type: 'happy' | 'sad' | 'short') {
    const ctx = this.getContext();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Triangle wave is good for a soft "Meow"
    osc.type = 'triangle'; 
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'happy') {
        // Shortened "Meow"
        osc.frequency.setValueAtTime(500, t);
        osc.frequency.exponentialRampToValueAtTime(900, t + 0.1); // Me-
        osc.frequency.exponentialRampToValueAtTime(700, t + 0.25);  // -ow
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.05); // Faster Attack
        gain.gain.linearRampToValueAtTime(0, t + 0.25);    // Faster Decay
        
        osc.start(t);
        osc.stop(t + 0.25);
    } else if (type === 'sad') {
        // "Meeeooo..." (Descending pitch, slightly rougher)
        osc.type = 'sawtooth'; 
        // Filter to soften the sawtooth
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        osc.disconnect();
        osc.connect(filter);
        filter.connect(gain);

        osc.frequency.setValueAtTime(500, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.6);

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.6);

        osc.start(t);
        osc.stop(t + 0.6);
    } else {
        // Short "Mew"
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.linearRampToValueAtTime(800, t + 0.1);
        
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.1);
        
        osc.start(t);
        osc.stop(t + 0.1);
    }
  }

  private playDogSound(type: 'happy' | 'sad' | 'short') {
      const ctx = this.getContext();
      const t = ctx.currentTime;

      // Helper for a single bark
      const bark = (startTime: number, dur: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth'; // Sawtooth for a rougher "bark" sound
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          // Fast pitch drop
          osc.frequency.setValueAtTime(400, startTime);
          osc.frequency.exponentialRampToValueAtTime(150, startTime + dur);
          
          // Sharp volume envelope
          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);

          osc.start(startTime);
          osc.stop(startTime + dur);
      };

      if (type === 'happy') {
          // "Woof! Woof!" (Double bark, tighter timing)
          bark(t, 0.08); // Shorter individual bark
          setTimeout(() => bark(t + 0.12, 0.08), 120); // Closer second bark
      } else if (type === 'sad') {
          // "Whine..." (High pitched Sine wave)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.frequency.setValueAtTime(800, t);
          osc.frequency.linearRampToValueAtTime(600, t + 0.3);
          osc.frequency.linearRampToValueAtTime(700, t + 0.6); // Wobble
          osc.frequency.linearRampToValueAtTime(500, t + 0.9);
          
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.9);
          
          osc.start(t);
          osc.stop(t + 0.9);
      } else {
           // Short "Yip"
           bark(t, 0.08);
      }
  }

  // --- Public Methods ---

  public playCorrect() {
    const ctx = this.getContext();
    const t = ctx.currentTime;

    switch (this.currentTheme) {
      case 'MARIO':
        // Coin sound: B5 -> E6 (Square wave)
        this.playTone(987.77, 'square', 0.1, 0, 0.1); // B5
        this.playTone(1318.51, 'square', 0.3, 0.1, 0.1); // E6
        break;

      case 'PIKACHU':
        // "Pi-Ka!" (High pitch sine chirp)
        // Pi
        this.playSweep(1500, 1800, 'sine', 0.1, 0.1);
        // Ka
        setTimeout(() => this.playSweep(1800, 1200, 'sine', 0.15, 0.1), 150);
        break;

      case 'CAT':
        this.playCatSound('happy');
        break;

      case 'DOG':
        this.playDogSound('happy');
        break;

      case 'KIRBY':
      default:
        // Happy Chord Arpeggio
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, t); // C5
        osc.frequency.setValueAtTime(659.25, t + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, t + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, t + 0.3); // C6
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.6);
        break;
    }
  }

  public playWrong() {
    const ctx = this.getContext();
    
    switch (this.currentTheme) {
      case 'MARIO':
        // Descending "Die" sound (Square)
        this.playSweep(300, 50, 'square', 0.3, 0.1);
        break;
      
      case 'PIKACHU':
        // Sad "Pika..." (Descending sine)
        this.playSweep(800, 300, 'sine', 0.6, 0.1);
        break;

      case 'CAT':
        this.playCatSound('sad');
        break;

      case 'DOG':
        this.playDogSound('sad');
        break;

      case 'KIRBY':
      default:
        // Buzzer
        this.playSweep(150, 100, 'sawtooth', 0.3, 0.2);
        break;
    }
  }

  public playSelect() {
    const ctx = this.getContext();

    switch (this.currentTheme) {
      case 'MARIO':
        // Jump Sound (Rising Square)
        this.playSweep(200, 600, 'square', 0.15, 0.05);
        break;

      case 'PIKACHU':
        // "Pi!"
        this.playSweep(1200, 1500, 'sine', 0.08, 0.05);
        break;

      case 'CAT':
        this.playCatSound('short');
        break;
        
      case 'DOG':
        this.playDogSound('short');
        break;

      case 'KIRBY':
      default:
        // Pop sound
        this.playTone(800, 'sine', 0.1, 0, 0.1);
        break;
    }
  }

  public playMilestone() {
    const ctx = this.getContext();
    // Use generic fanfares for milestones, but could be themed if desired
    if (this.currentTheme === 'MARIO') {
        // Level Clear Fanfare mimic (Square)
        const notes = [523, 523, 523, 659, 0, 523, 0, 659, 783]; // Approx
        notes.forEach((freq, i) => {
            if (freq > 0) this.playTone(freq, 'square', 0.1, i * 0.12, 0.1);
        });
    } else {
        // Generic Fanfare
        [440, 440, 440, 523, 659, 523, 659].forEach((freq, i) => {
            this.playTone(freq, 'triangle', 0.3, i * 0.15, 0.2);
        });
    }
  }

  public playInhale() {
    const ctx = this.getContext();
    // Inhale is mostly a vacuum sound, fairly generic but can be styled
    const type = this.currentTheme === 'MARIO' ? 'square' : 'triangle';
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.5);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.5);

    osc.start(now);
    osc.stop(now + 0.5);
  }
}

export const audio = new AudioService();
