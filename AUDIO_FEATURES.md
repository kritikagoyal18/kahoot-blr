# 🎵 Mario-Style Audio Features

This Kahoot-like platform now includes fun Mario-style audio effects that enhance the user experience!

## 🎮 Audio Features

### **Automatic Page Load Audio**
- **Welcome Sequence**: When the page loads, you'll hear a Mario coin sound followed by a power-up sound
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

## 🎵 Available Sound Effects

### **AudioManager Class** (`scripts/audio-utils.js`)

1. **`playCoinSound()`** - High-pitched ascending beep (Mario coin)
2. **`playPowerUpSound()`** - Ascending arpeggio (Mario power-up)
3. **`playJumpSound()`** - Quick ascending beep (Mario jump)
4. **`playGameOverSound()`** - Descending tone (Mario game over)
5. **`playVictorySound()`** - Ascending fanfare (Mario victory)
6. **`playLevelCompleteSound()`** - Power-up + completion sound
7. **`playWelcomeSequence()`** - Coin + power-up sequence

## 🔧 Technical Implementation

### **Audio Context**
- Uses Web Audio API for high-quality sound generation
- Fallback support for older browsers
- Graceful degradation if audio is not supported

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

// Toggle sound on/off
if (window.audioManager) {
  const isEnabled = window.audioManager.toggleSound();
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
- [ ] Background music
- [ ] Sound effect customization
- [ ] Accessibility options for hearing-impaired users

---

**Note**: All sounds are generated programmatically using the Web Audio API, ensuring fast loading and no external dependencies! 🎮✨ 