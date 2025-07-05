export interface SoundEffect {
  id: string;
  buffer: AudioBuffer;
  volume: number;
}

export class AudioManager {
  private context: AudioContext | null = null;
  private sounds: Map<string, SoundEffect> = new Map();
  private masterVolume = 0.7;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context if suspended (required by some browsers)
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }
      
      // Create basic sound effects procedurally
      await this.createBasicSounds();
      this.initialized = true;
      console.log('Audio system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  private async createBasicSounds() {
    if (!this.context) return;

    // Footstep sound - short noise burst
    this.createSound('footstep', this.generateFootstepSound(), 0.3);
    
    // Jump sound - quick ascending tone
    this.createSound('jump', this.generateJumpSound(), 0.5);
    
    // Landing sound - thud
    this.createSound('landing', this.generateLandingSound(), 0.4);
    
    // Success sound - cheerful chime
    this.createSound('success', this.generateSuccessSound(), 0.6);
    
    // UI click sound
    this.createSound('click', this.generateClickSound(), 0.2);
  }

  private generateFootstepSound(): AudioBuffer {
    if (!this.context) throw new Error('Audio context not initialized');
    
    const duration = 0.1;
    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Short noise burst with quick decay
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 20);
      data[i] = noise * 0.1;
    }
    
    return buffer;
  }

  private generateJumpSound(): AudioBuffer {
    if (!this.context) throw new Error('Audio context not initialized');
    
    const duration = 0.3;
    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Ascending frequency sweep
      const freq = 200 + t * 300;
      const wave = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 3);
      data[i] = wave * 0.2;
    }
    
    return buffer;
  }

  private generateLandingSound(): AudioBuffer {
    if (!this.context) throw new Error('Audio context not initialized');
    
    const duration = 0.2;
    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Low thump with harmonics
      const fundamental = Math.sin(2 * Math.PI * 80 * t);
      const harmonic = Math.sin(2 * Math.PI * 160 * t) * 0.5;
      const envelope = Math.exp(-t * 8);
      data[i] = (fundamental + harmonic) * envelope * 0.3;
    }
    
    return buffer;
  }

  private generateSuccessSound(): AudioBuffer {
    if (!this.context) throw new Error('Audio context not initialized');
    
    const duration = 0.5;
    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    // Major chord arpeggio
    const notes = [262, 330, 392, 523]; // C, E, G, C
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      notes.forEach((freq, index) => {
        const startTime = index * 0.1;
        const endTime = startTime + 0.2;
        
        if (t >= startTime && t <= endTime) {
          const noteTime = t - startTime;
          const envelope = Math.exp(-noteTime * 3);
          sample += Math.sin(2 * Math.PI * freq * noteTime) * envelope * 0.2;
        }
      });
      
      data[i] = sample;
    }
    
    return buffer;
  }

  private generateClickSound(): AudioBuffer {
    if (!this.context) throw new Error('Audio context not initialized');
    
    const duration = 0.05;
    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Quick click sound
      const wave = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 50);
      data[i] = wave * 0.1;
    }
    
    return buffer;
  }

  private createSound(id: string, buffer: AudioBuffer, volume: number) {
    this.sounds.set(id, { id, buffer, volume });
  }

  async playSound(id: string, pitch = 1.0, volume = 1.0) {
    if (!this.context || !this.initialized) {
      await this.initialize();
    }
    
    if (!this.context) return;
    
    const sound = this.sounds.get(id);
    if (!sound) {
      console.warn(`Sound '${id}' not found`);
      return;
    }
    
    try {
      const source = this.context.createBufferSource();
      const gainNode = this.context.createGain();
      
      source.buffer = sound.buffer;
      source.playbackRate.value = pitch;
      
      gainNode.gain.value = sound.volume * volume * this.masterVolume;
      
      source.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      source.start();
    } catch (error) {
      console.error(`Failed to play sound '${id}':`, error);
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  // Play context-aware sounds
  playFootstep(surface = 'default') {
    const pitch = 0.8 + Math.random() * 0.4; // Vary pitch for realism
    this.playSound('footstep', pitch);
  }

  playJump() {
    this.playSound('jump');
  }

  playLanding(intensity = 1.0) {
    const pitch = Math.max(0.5, 1.0 - intensity * 0.3);
    this.playSound('landing', pitch, intensity);
  }

  playSuccess() {
    this.playSound('success');
  }

  playClick() {
    this.playSound('click');
  }

  destroy() {
    if (this.context) {
      this.context.close();
      this.context = null;
    }
    this.sounds.clear();
    this.initialized = false;
  }
}

// Global audio manager instance
export const audioManager = new AudioManager();