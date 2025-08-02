# 🎵 Mario Game Audio Features

This Kahoot-like platform now includes authentic Mario game audio effects that enhance the user experience!

## 🎮 Audio Features

### **Automatic Page Load Audio**
- **Welcome Sequence**: When the page loads, you'll hear authentic Mario coin and power-up sounds
- **Background Music**: Continuous Mario game background music starts playing after 2 seconds
- **Location**: `scripts/audio-utils.js` and `head.html`

### **Interactive Sound Effects**

#### **Admin Quiz Portal** (`blocks/admin-quiz-portal/`)
- **Create New Game** → 🪙 Coin sound
- **Edit Game** → 🦘 Jump sound  
- **Publish/Unpublish Game** → ⚡ Power-up sound
- **Delete Game** → 💀 Game over sound
- **Host Live** → 🏆 Victory fanfare
- **Add Question** → 🦘 Jump sound
- **Submit Questions** → 🎯 Level complete sound

#### **Add Question Block** (`blocks/add-question/`)
- **Add Question** → 🦘 Jump sound
- **Submit Questions** → 🎯 Level complete sound

### **Sound Control**
- **Sound Toggle Button**: Located in the admin portal header
- **Toggle On/Off**: Click to enable/disable all sound effects
- **Visual Feedback**: Button shows 🔊 Sound On or 🔇 Sound Off
- **Background Music Toggle**: Separate button to control continuous background music
- **BGM Control**: Button shows 🎵 BGM On or 🔇 BGM Off
- **Volume Slider**: Real-time volume control for background music (0-100%)
- **Volume Label**: Shows 🎚️ BGM Vol: with slider control

## 🎵 Available Sound Effects

### **AudioManager Class** (`scripts/audio-utils.js`)

#### **Background Audio**
1. **`startBackgroundAudio()`** - Start continuous Mario game background music
2. **`stopBackgroundAudio()`** - Stop background music
3. **`toggleBackgroundAudio()`** - Toggle background music on/off
4. **`playBackgroundMusic()`** - Play actual Mario background music file
5. **`playGeneratedBackgroundMusic()`** - Fallback to generated Mario-style music
6. **`setBackgroundVolume(volume)`** - Set background music volume (0.0-1.0)
7. **`getBackgroundVolume()`** - Get current background music volume

#### **Sound Effects**
8. **`playCoinSound()`** - Authentic Mario coin collection sound
9. **`playPowerUpSound()`** - Authentic Mario power-up sound
10. **`playJumpSound()`** - Authentic Mario jump sound
11. **`playGameOverSound()`** - Authentic Mario game over sound
12. **`playVictorySound()`** - Authentic Mario victory fanfare
13. **`playLevelCompleteSound()`** - Power-up + coin sequence
14. **`playWelcomeSequence()`** - Coin + power-up sequence
15. **`playAudioFromBuffer()`** - Play audio from loaded buffer
16. **`loadAudioFiles()`** - Load Mario game audio files

## 🔧 Technical Implementation

### **Audio Context**
- Uses Web Audio API for high-quality sound generation
- Loads authentic Mario game audio files from external sources
- Fallback support for older browsers
- Graceful degradation if audio is not supported

### **Audio File Loading**
- **Primary Sources**: Reliable audio hosting services
- **Fallback Sources**: Alternative audio providers
- **Generated Fallbacks**: Programmatically created Mario-style sounds
- **Error Handling**: Comprehensive error handling with multiple fallback options

### **Background Music**
- **Authentic Mario Music**: Uses actual Mario game background music files
- **Automatic Looping**: Seamless loop of Mario game tracks
- **Low volume**: Background music plays at 10% volume to not interfere with UI
- **Fallback System**: Generated Mario-style music if audio files can't be loaded
- **Automatic start**: Begins playing 2 seconds after page load
- **Separate control**: Can be toggled independently from sound effects

### **Sound Generation**
- **Authentic Audio Files**: Loads real Mario game audio from external sources
- **Generated Fallbacks**: Uses oscillators to create Mario-style sounds when audio files unavailable
- **Multiple Waveforms**: Square, sine, triangle, sawtooth for generated sounds
- **Frequency Modulation**: Creates authentic Mario-style sounds
- **Gain Envelopes**: Smooth volume control for natural sound

### **Integration**
- **Global Audio Manager**: `window.audioManager` available throughout the app
- **Event-Driven**: Sounds triggered by user interactions
- **Non-Blocking**: Audio doesn't interfere with UI performance

## 🎨 Sound Characteristics

| Sound | Frequency Range | Waveform | Duration | Use Case |
|-------|----------------|----------|----------|----------|
| Coin | 800Hz → 1200Hz | Square | 0.2s | Success actions |
| Power-up | 400Hz → 800Hz | Sine | 0.3s | Positive actions |
| Jump | 600Hz → 1000Hz | Triangle | 0.15s | Navigation |
| Game Over | 800Hz → 400Hz | Sawtooth | 0.4s | Destructive actions |
| Victory | 400Hz → 1100Hz | Sine | 1.2s | Major achievements |

## 🚀 Usage Examples

```javascript
// Play a coin sound
if (window.audioManager) {
  window.audioManager.playCoinSound();
}

// Toggle sound effects on/off
if (window.audioManager) {
  const isEnabled = window.audioManager.toggleSound();
}

// Toggle background music on/off
if (window.audioManager) {
  const isEnabled = window.audioManager.toggleBackgroundAudio();
}

// Start background music manually
if (window.audioManager) {
  window.audioManager.startBackgroundAudio();
}

// Stop background music
if (window.audioManager) {
  window.audioManager.stopBackgroundAudio();
}

// Set background music volume (0.0 to 1.0)
if (window.audioManager) {
  window.audioManager.setBackgroundVolume(0.5); // 50% volume
}

// Get current background music volume
if (window.audioManager) {
  const currentVolume = window.audioManager.getBackgroundVolume();
  console.log('Current BGM volume:', currentVolume);
}

// Play welcome sequence
if (window.audioManager) {
  window.audioManager.playWelcomeSequence();
}
```

## 🎯 Browser Compatibility

- ✅ **Modern Browsers**: Full support with Web Audio API
- ✅ **Mobile Browsers**: Works on iOS Safari, Chrome Mobile
- ⚠️ **Older Browsers**: Graceful fallback (no audio, no errors)
- 🔇 **User Preferences**: Respects browser autoplay policies

## 🎵 Future Enhancements

- [x] Volume control slider
- [x] Authentic Mario game audio files
- [ ] Multiple background music tracks
- [ ] Sound effect customization
- [ ] Accessibility options for hearing-impaired users
- [ ] Background music fade in/out effects
- [ ] Music tempo adjustment based on user activity
- [ ] Local audio file support
- [ ] Audio file caching for better performance
- [ ] Custom audio playlist management

---

**Note**: The system now uses authentic Mario game audio files with comprehensive fallback options. If external audio files can't be loaded, it automatically falls back to programmatically generated Mario-style sounds, ensuring the audio experience always works! 🎮✨

## 📁 Audio File Management

See `audio/README.md` for detailed instructions on adding local Mario game audio files and legal considerations. 