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
    this.backgroundGainNode = null;
    this.audioBuffers = {};
    this.backgroundAudio = null;
  }

  /**
   * Initialize the audio context
   */
  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.isInitialized = true;
      console.log('🎵 Audio Manager initialized successfully!');
      this.loadAudioFiles();
    } catch (error) {
      console.log('Audio not supported or blocked by browser:', error);
      this.soundEnabled = false;
    }
  }

  /**
   * Load Mario game audio files
   */
  async loadAudioFiles() {
    // Using reliable Mario game audio sources
    const audioFiles = {
      coin: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Coin-like sound
      powerup: 'https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav', // Power-up like sound
      jump: 'https://www.soundjay.com/misc/sounds/fail-buzzer-01.wav', // Jump-like sound
      gameOver: 'https://www.soundjay.com/misc/sounds/fail-buzzer-03.wav', // Game over sound
      victory: 'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav', // Victory sound
      background: 'https://www.soundjay.com/misc/sounds/bell-ringing-03.wav' // Background music placeholder
    };

    // Alternative Mario-style audio sources (if primary sources fail)
    const fallbackAudioFiles = {
      coin: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      powerup: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
      jump: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
      gameOver: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
      victory: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
      background: 'https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3'
    };

    try {
      for (const [name, url] of Object.entries(audioFiles)) {
        try {
          console.log(`🎵 Loading ${name} audio from: ${url}`);
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
          this.audioBuffers[name] = audioBuffer;
          console.log(`✅ Successfully loaded ${name} audio file`);
        } catch (error) {
          console.log(`❌ Failed to load ${name} from primary source:`, error);
          
          // Try fallback source
          try {
            const fallbackUrl = fallbackAudioFiles[name];
            console.log(`🔄 Trying fallback source for ${name}: ${fallbackUrl}`);
            const fallbackResponse = await fetch(fallbackUrl);
            
            if (fallbackResponse.ok) {
              const fallbackArrayBuffer = await fallbackResponse.arrayBuffer();
              const fallbackAudioBuffer = await this.audioContext.decodeAudioData(fallbackArrayBuffer);
              this.audioBuffers[name] = fallbackAudioBuffer;
              console.log(`✅ Successfully loaded ${name} from fallback source`);
            } else {
              throw new Error(`Fallback HTTP ${fallbackResponse.status}`);
            }
          } catch (fallbackError) {
            console.log(`❌ Failed to load ${name} from fallback source:`, fallbackError);
            console.log(`🎵 Will use generated sound for ${name}`);
          }
        }
      }
      
      console.log(`🎵 Audio loading complete. Loaded ${Object.keys(this.audioBuffers).length} audio files.`);
    } catch (error) {
      console.log('❌ Critical error loading audio files, falling back to generated sounds:', error);
    }
  }

  /**
   * Play audio from buffer
   */
  playAudioFromBuffer(bufferName, volume = 0.3) {
    if (!this.soundEnabled || !this.audioContext || !this.audioBuffers[bufferName]) return;
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = this.audioBuffers[bufferName];
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    
    source.start(0);
  }

  /**
   * Start continuous background audio (Mario game music)
   */
  startBackgroundAudio() {
    if (!this.soundEnabled || !this.audioContext || this.backgroundAudioEnabled) return;
    
    this.backgroundAudioEnabled = true;
    console.log('🎵 Starting Mario background music...');
    
    if (this.audioBuffers.background) {
      // Use actual Mario background music
      this.playBackgroundMusic();
    } else {
      // Fallback to generated music
      this.playGeneratedBackgroundMusic();
    }
  }

  /**
   * Play actual Mario background music
   */
  playBackgroundMusic() {
    const source = this.audioContext.createBufferSource();
    this.backgroundGainNode = this.audioContext.createGain();
    
    source.buffer = this.audioBuffers.background;
    source.connect(this.backgroundGainNode);
    this.backgroundGainNode.connect(this.audioContext.destination);
    
    // Set lower volume for background music
    this.backgroundGainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    
    // Loop the music
    source.loop = true;
    source.start(0);
    
    this.backgroundAudio = source;
  }

  /**
   * Fallback to generated background music
   */
  playGeneratedBackgroundMusic() {
    // Create master gain node for background audio
    this.backgroundGainNode = this.audioContext.createGain();
    this.backgroundGainNode.connect(this.audioContext.destination);
    this.backgroundGainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    
    // Mario-style background music using multiple oscillators
    this.createBackgroundMelody();
    
    // Loop the background music
    this.loopBackgroundAudio();
  }

  /**
   * Create Mario-style background melody (fallback)
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
        oscillator.type = 'triangle';
        
        // Create envelope for each note
        gainNode.gain.setValueAtTime(0, startTime + (index * noteDuration));
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + (index * noteDuration) + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + (index * noteDuration) + noteDuration);
        
        oscillator.start(startTime + (index * noteDuration));
        oscillator.stop(startTime + (index * noteDuration) + noteDuration);
      }
    });
    
    // Add a subtle bass line
    this.createBackgroundBass(startTime, sequenceDuration);
  }

  /**
   * Create background bass line (fallback)
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
      oscillator.type = 'sine';
      
      // Softer bass envelope
      gainNode.gain.setValueAtTime(0, startTime + (index * bassDuration));
      gainNode.gain.linearRampToValueAtTime(0.1, startTime + (index * bassDuration) + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + (index * bassDuration) + bassDuration);
      
      oscillator.start(startTime + (index * bassDuration));
      oscillator.stop(startTime + (index * bassDuration) + bassDuration);
    });
  }

  /**
   * Loop the background audio (fallback)
   */
  loopBackgroundAudio() {
    if (!this.backgroundAudioEnabled) return;
    
    // Schedule the next loop
    setTimeout(() => {
      if (this.backgroundAudioEnabled) {
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
    
    if (this.backgroundAudio) {
      this.backgroundAudio.stop();
      this.backgroundAudio = null;
    }
    
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
   * Play Mario coin sound
   */
  playCoinSound() {
    if (this.audioBuffers.coin) {
      this.playAudioFromBuffer('coin', 0.4);
    } else {
      // Fallback to generated sound
      this.playGeneratedCoinSound();
    }
  }

  /**
   * Play generated coin sound (fallback)
   */
  playGeneratedCoinSound() {
    if (!this.soundEnabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
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
   * Play Mario power-up sound
   */
  playPowerUpSound() {
    if (this.audioBuffers.powerup) {
      this.playAudioFromBuffer('powerup', 0.4);
    } else {
      // Fallback to generated sound
      this.playGeneratedPowerUpSound();
    }
  }

  /**
   * Play generated power-up sound (fallback)
   */
  playGeneratedPowerUpSound() {
    if (!this.soundEnabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
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
   * Play Mario jump sound
   */
  playJumpSound() {
    if (this.audioBuffers.jump) {
      this.playAudioFromBuffer('jump', 0.4);
    } else {
      // Fallback to generated sound
      this.playGeneratedJumpSound();
    }
  }

  /**
   * Play generated jump sound (fallback)
   */
  playGeneratedJumpSound() {
    if (!this.soundEnabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
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
   * Play Mario game over sound
   */
  playGameOverSound() {
    if (this.audioBuffers.gameOver) {
      this.playAudioFromBuffer('gameOver', 0.4);
    } else {
      // Fallback to generated sound
      this.playGeneratedGameOverSound();
    }
  }

  /**
   * Play generated game over sound (fallback)
   */
  playGeneratedGameOverSound() {
    if (!this.soundEnabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
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
   * Play Mario victory sound
   */
  playVictorySound() {
    if (this.audioBuffers.victory) {
      this.playAudioFromBuffer('victory', 0.4);
    } else {
      // Fallback to generated sound
      this.playGeneratedVictorySound();
    }
  }

  /**
   * Play generated victory sound (fallback)
   */
  playGeneratedVictorySound() {
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
   * Play Mario level complete sound
   */
  playLevelCompleteSound() {
    if (this.audioBuffers.powerup) {
      // Use power-up sound for level complete
      this.playAudioFromBuffer('powerup', 0.4);
      setTimeout(() => {
        this.playAudioFromBuffer('coin', 0.4);
      }, 500);
    } else {
      // Fallback to generated sound
      this.playGeneratedLevelCompleteSound();
    }
  }

  /**
   * Play generated level complete sound (fallback)
   */
  playGeneratedLevelCompleteSound() {
    if (!this.soundEnabled || !this.audioContext) return;
    
    // First play power-up sound
    this.playGeneratedPowerUpSound();
    
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