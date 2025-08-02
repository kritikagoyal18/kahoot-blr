# 🎵 Mario-Style Audio Features

This Kahoot-like platform now includes fun Mario-style audio effects that enhance the user experience!

## 🎮 Audio Features

### **Automatic Page Load Audio**
- **Welcome Sequence**: When the page loads, you'll hear a Mario coin sound followed by a power-up sound
- **Background Music**: Continuous Mario-style ambient music starts playing after 2 seconds
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
1. **`startBackgroundAudio()`** - Start continuous Mario-style background music
2. **`stopBackgroundAudio()`** - Stop background music
3. **`toggleBackgroundAudio()`** - Toggle background music on/off
4. **`createBackgroundMelody()`** - Generate Mario-style melody loop
5. **`createBackgroundBass()`** - Add bass line to background music
6. **`setBackgroundVolume(volume)`** - Set background music volume (0.0-1.0)
7. **`getBackgroundVolume()`** - Get current background music volume

#### **Sound Effects**
6. **`playCoinSound()`** - High-pitched ascending beep (Mario coin)
7. **`playPowerUpSound()`** - Ascending arpeggio (Mario power-up)
8. **`playJumpSound()`** - Quick ascending beep (Mario jump)
9. **`playGameOverSound()`** - Descending tone (Mario game over)
10. **`playVictorySound()`** - Ascending fanfare (Mario victory)
11. **`playLevelCompleteSound()`** - Power-up + completion sound
12. **`playWelcomeSequence()`** - Coin + power-up sequence

## 🔧 Technical Implementation

### **Audio Context**
- Uses Web Audio API for high-quality sound generation
- Fallback support for older browsers
- Graceful degradation if audio is not supported

### **Background Music**
- **8-second loop**: Continuous Mario-style melody with bass line
- **Low volume**: Background music plays at 10% volume to not interfere with UI
- **Triangle waveform**: Softer, more ambient sound for background
- **Automatic start**: Begins playing 2 seconds after page load
- **Separate control**: Can be toggled independently from sound effects

### **Sound Generation**
- **Oscillators**: Generate different waveforms (square, sine, triangle, sawtooth)
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

- [ ] Volume control slider
- [ ] Custom sound themes
- [ ] Multiple background music tracks
- [ ] Sound effect customization
- [ ] Accessibility options for hearing-impaired users
- [ ] Background music fade in/out effects
- [ ] Music tempo adjustment based on user activity

---

**Note**: All sounds are generated programmatically using the Web Audio API, ensuring fast loading and no external dependencies! 🎮✨ 