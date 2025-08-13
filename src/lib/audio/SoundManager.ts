// Sound Manager for Crown and Capture
export class SoundManager {
  private static instance: SoundManager;
  private context: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private masterVolume: number = 0.7;

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async initialize() {
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Generate sound effects programmatically
      await this.generateSounds();
    } catch (error) {
      console.warn('Audio not supported or failed to initialize:', error);
    }
  }

  private async generateSounds() {
    if (!this.context) return;

    // Move sound - soft click
    this.sounds.set('move', this.generateTone(400, 0.1, 'sine'));
    
    // Capture sound - dramatic thud
    this.sounds.set('capture', this.generateTone(150, 0.3, 'sawtooth'));
    
    // Ability sound - magical chime
    this.sounds.set('ability', this.generateChord([523, 659, 784], 0.4));
    
    // Check sound - warning bell
    this.sounds.set('check', this.generateTone(800, 0.2, 'triangle'));
    
    // Checkmate sound - deep dramatic chord
    this.sounds.set('checkmate', this.generateChord([130, 164, 196], 0.6));
    
    // Button hover sound
    this.sounds.set('hover', this.generateTone(600, 0.05, 'sine'));
    
    // Button click sound
    this.sounds.set('click', this.generateTone(500, 0.1, 'triangle'));
  }

  private generateTone(frequency: number, duration: number, type: OscillatorType): AudioBuffer {
    if (!this.context) throw new Error('Audio context not initialized');
    
    const sampleRate = this.context.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'sawtooth':
          sample = 2 * (t * frequency % 1) - 1;
          break;
        case 'triangle':
          sample = 2 * Math.abs(2 * (t * frequency % 1) - 1) - 1;
          break;
      }
      
      // Apply fade out to prevent clicks
      const fadeOut = Math.max(0, 1 - (t / duration) * 2);
      data[i] = sample * fadeOut * 0.3; // Lower volume
    }
    
    return buffer;
  }

  private generateChord(frequencies: number[], duration: number): AudioBuffer {
    if (!this.context) throw new Error('Audio context not initialized');
    
    const sampleRate = this.context.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Mix multiple frequencies
      frequencies.forEach(freq => {
        sample += Math.sin(2 * Math.PI * freq * t) / frequencies.length;
      });
      
      // Apply fade out
      const fadeOut = Math.max(0, 1 - (t / duration) * 1.5);
      data[i] = sample * fadeOut * 0.4;
    }
    
    return buffer;
  }

  play(soundName: string, volume: number = 1) {
    if (!this.context || !this.sounds.has(soundName)) return;

    try {
      const buffer = this.sounds.get(soundName)!;
      const source = this.context.createBufferSource();
      const gainNode = this.context.createGain();
      
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      gainNode.gain.value = Math.min(1, volume * this.masterVolume);
      
      source.start(0);
    } catch (error) {
      console.warn('Failed to play sound:', soundName, error);
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }
}

// Export convenience functions
export const playSound = (soundName: string, volume?: number) => {
  SoundManager.getInstance().play(soundName, volume);
};

export const initializeAudio = async () => {
  await SoundManager.getInstance().initialize();
};
