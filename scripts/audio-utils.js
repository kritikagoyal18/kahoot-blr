/**
 * Audio Utilities for Mario-style Sound Effects
 * Provides various fun sound effects for the Kahoot-like platform
 */

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.isInitialized = false;
    this.soundEnabled = true;
    this.backgroundAudioEnabled = false;
    this.backgroundOscillators = [];
    this.backgroundGainNode = null;
  }

  /**
   * Initialize the audio context
   */
  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.isInitialized = true;
      console.log('🎵 Audio Manager initialized successfully!');
    } catch (error) {
      console.log('Audio not supported or blocked by browser:', error);
      this.soundEnabled = false;
    }
  }

  /**
   * Start continuous background audio (Mario-style ambient music)
   */
  startBackgroundAudio() {
    if (!this.soundEnabled || !this.audioContext || this.backgroundAudioEnabled) return;
    
    this.backgroundAudioEnabled = true;
    console.log('🎵 Starting background audio...');
    
    // Create master gain node for background audio
    this.backgroundGainNode = this.audioContext.createGain();
    this.backgroundGainNode.connect(this.audioContext.destination);
    this.backgroundGainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime); // Lower volume for background
    
    // Mario-style background music using multiple oscillators
    this.createBackgroundMelody();
    
    // Loop the background music
    this.loopBackgroundAudio();
  }

  /**
   * Create Mario-style background melody
   */
  createBackgroundMelody() {
    const startTime = this.audioContext.currentTime;
    const noteDuration = 0.5;
    const sequenceDuration = 8; // 8 seconds per loop
    
    // Main melody notes (Mario-style ascending/descending pattern)
    const melodyNotes = [
      { freq: 262, duration: noteDuration }, // C4
      { freq: 294, duration: noteDuration }, // D4
      { freq: 330, duration: noteDuration }, // E4
      { freq: 349, duration: noteDuration }, // F4
      { freq: 392, duration: noteDuration }, // G4
      { freq: 440, duration: noteDuration }, // A4
      { freq: 494, duration: noteDuration }, // B4
      { freq: 523, duration: noteDuration }, // C5
      { freq: 494, duration: noteDuration }, // B4
      { freq: 440, duration: noteDuration }, // A4
      { freq: 392, duration: noteDuration }, // G4
      { freq: 349, duration: noteDuration }, // F4
      { freq: 330, duration: noteDuration }, // E4
      { freq: 294, duration: noteDuration }, // D4
      { freq: 262, duration: noteDuration }, // C4
      { freq: 0, duration: noteDuration }    // Rest
    ];
    
    // Create oscillators for each note
    melodyNotes.forEach((note, index) => {
      if (note.freq > 0) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.backgroundGainNode);
        
        oscillator.frequency.setValueAtTime(note.freq, startTime + (index * noteDuration));
        oscillator.type = 'triangle'; // Softer sound for background
        
        // Create envelope for each note
        gainNode.gain.setValueAtTime(0, startTime + (index * noteDuration));
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + (index * noteDuration) + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + (index * noteDuration) + noteDuration);
        
        oscillator.start(startTime + (index * noteDuration));
        oscillator.stop(startTime + (index * noteDuration) + noteDuration);
        
        this.backgroundOscillators.push(oscillator);
      }
    });
    
    // Add a subtle bass line
    this.createBackgroundBass(startTime, sequenceDuration);
  }

  /**
   * Create background bass line
   */
  createBackgroundBass(startTime, duration) {
    const bassNotes = [131, 147, 165, 175]; // Lower octave
    const bassDuration = 2; // Longer notes for bass
    
    bassNotes.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.backgroundGainNode);
      
      oscillator.frequency.setValueAtTime(freq, startTime + (index * bassDuration));
      oscillator.type = 'sine'; // Smooth bass
      
      // Softer bass envelope
      gainNode.gain.setValueAtTime(0, startTime + (index * bassDuration));
      gainNode.gain.linearRampToValueAtTime(0.1, startTime + (index * bassDuration) + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + (index * bassDuration) + bassDuration);
      
      oscillator.start(startTime + (index * bassDuration));
      oscillator.stop(startTime + (index * bassDuration) + bassDuration);
      
      this.backgroundOscillators.push(oscillator);
    });
  }

  /**
   * Loop the background audio
   */
  loopBackgroundAudio() {
    if (!this.backgroundAudioEnabled) return;
    
    // Schedule the next loop
    setTimeout(() => {
      if (this.backgroundAudioEnabled) {
        this.backgroundOscillators = []; // Clear old oscillators
        this.createBackgroundMelody();
        this.loopBackgroundAudio();
      }
    }, 8000); // 8 second loop
  }

  /**
   * Stop background audio
   */
  stopBackgroundAudio() {
    this.backgroundAudioEnabled = false;
    
    // Stop all background oscillators
    this.backgroundOscillators.forEach(oscillator => {
      try {
        oscillator.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    this.backgroundOscillators = [];
    
    if (this.backgroundGainNode) {
      this.backgroundGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    }
    
    console.log('🎵 Background audio stopped');
  }

  /**
   * Toggle background audio
   */
  toggleBackgroundAudio() {
    if (this.backgroundAudioEnabled) {
      this.stopBackgroundAudio();
      return false;
    } else {
      this.startBackgroundAudio();
      return true;
    }
  }

  /**
   * Set background audio volume (0.0 to 1.0)
   */
  setBackgroundVolume(volume) {
    if (this.backgroundGainNode) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.backgroundGainNode.gain.setValueAtTime(clampedVolume, this.audioContext.currentTime);
      console.log(`🎵 Background volume set to: ${clampedVolume}`);
    }
  }

  /**
   * Get current background audio volume
   */
  getBackgroundVolume() {
    if (this.backgroundGainNode) {
      return this.backgroundGainNode.gain.value;
    }
    return 0.1; // Default volume
  }

  /**
   * Play Mario coin sound (high-pitched ascending beep)
   */
  playCoinSound() {
    if (!this.soundEnabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Coin sound: ascending beep
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.1);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  /**
   * Play Mario power-up sound (ascending arpeggio)
   */
  playPowerUpSound() {
    if (!this.soundEnabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Power-up sound: ascending arpeggio
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * Play Mario jump sound (quick ascending beep)
   */
  playJumpSound() {
    if (!this.soundEnabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Jump sound: quick ascending beep
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.05);
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  /**
   * Play Mario game over sound (descending tone)
   */
  playGameOverSound() {
    if (!this.soundEnabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Game over sound: descending tone
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime + 0.3);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.4);
  }

  /**
   * Play Mario victory sound (ascending fanfare)
   */
  playVictorySound() {
    if (!this.soundEnabled || !this.audioContext) return;
    
    // Play a sequence of ascending notes
    const notes = [400, 500, 600, 700, 800, 900, 1000, 1100];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
      }, index * 150);
    });
  }

  /**
   * Play Mario level complete sound (ascending arpeggio with ending)
   */
  playLevelCompleteSound() {
    if (!this.soundEnabled || !this.audioContext) return;
    
    // First play power-up sound
    this.playPowerUpSound();
    
    // Then play a completion sound
    setTimeout(() => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    }, 350);
  }

  /**
   * Toggle sound on/off
   */
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    console.log(`🔊 Sound ${this.soundEnabled ? 'enabled' : 'disabled'}`);
    return this.soundEnabled;
  }

  /**
   * Play welcome sequence (coin + power-up)
   */
  playWelcomeSequence() {
    setTimeout(() => this.playCoinSound(), 300);
    setTimeout(() => this.playPowerUpSound(), 600);
  }
}

// Create global audio manager instance
window.audioManager = new AudioManager();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.audioManager.init();
    window.audioManager.playWelcomeSequence();
    // Start background audio after a short delay
    setTimeout(() => {
      window.audioManager.startBackgroundAudio();
    }, 2000);
  });
} else {
  window.audioManager.init();
  window.audioManager.playWelcomeSequence();
  // Start background audio after a short delay
  setTimeout(() => {
    window.audioManager.startBackgroundAudio();
  }, 2000);
}

export default window.audioManager; 