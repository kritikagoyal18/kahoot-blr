# 🎵 Mario Game Audio Files

This directory is for storing actual Mario game audio files to be used in the Kahoot-like platform.

## 📁 File Structure

Place your Mario game audio files in this directory with the following naming convention:

```
audio/
├── coin.wav          # Mario coin collection sound
├── powerup.wav       # Mario power-up sound
├── jump.wav          # Mario jump sound
├── gameover.wav      # Mario game over sound
├── victory.wav       # Mario victory fanfare
└── background.mp3    # Mario background music (looping)
```

## 🎮 Recommended Audio Sources

### **Official Mario Game Audio**
- **Super Mario Bros.** (NES) - Classic 8-bit sounds
- **Super Mario World** (SNES) - 16-bit enhanced sounds
- **Super Mario 64** (N64) - 3D era sounds
- **New Super Mario Bros.** (DS/Wii) - Modern retro sounds

### **Legal Audio Sources**
1. **Nintendo Official Soundtracks** - Purchase official soundtracks
2. **Public Domain Mario Remixes** - Creative Commons licensed remixes
3. **Royalty-Free Mario-Style Sounds** - Similar sounds from audio libraries

## 🔧 Integration Instructions

### **Option 1: Local Audio Files**
1. Place your audio files in this `audio/` directory
2. Update the `audioFiles` object in `scripts/audio-utils.js`:

```javascript
const audioFiles = {
  coin: '/audio/coin.wav',
  powerup: '/audio/powerup.wav',
  jump: '/audio/jump.wav',
  gameOver: '/audio/gameover.wav',
  victory: '/audio/victory.wav',
  background: '/audio/background.mp3'
};
```

### **Option 2: CDN/External Hosting**
1. Upload audio files to a CDN or hosting service
2. Update URLs in `scripts/audio-utils.js`:

```javascript
const audioFiles = {
  coin: 'https://your-cdn.com/audio/coin.wav',
  powerup: 'https://your-cdn.com/audio/powerup.wav',
  jump: 'https://your-cdn.com/audio/jump.wav',
  gameOver: 'https://your-cdn.com/audio/gameover.wav',
  victory: 'https://your-cdn.com/audio/victory.wav',
  background: 'https://your-cdn.com/audio/background.mp3'
};
```

## 🎵 Audio File Requirements

### **Format Support**
- **WAV** - Best quality, larger file size
- **MP3** - Good quality, smaller file size
- **OGG** - Open source, good compression

### **Recommended Specifications**
- **Sample Rate**: 44.1 kHz
- **Bit Depth**: 16-bit
- **Channels**: Mono or Stereo
- **Duration**: 
  - Sound effects: 0.1 - 2 seconds
  - Background music: 30 seconds - 2 minutes (will loop)

### **File Size Guidelines**
- **Sound Effects**: < 100 KB each
- **Background Music**: < 2 MB
- **Total Audio**: < 5 MB for all files

## ⚖️ Legal Considerations

### **Copyright Notice**
⚠️ **Important**: Mario game audio is copyrighted by Nintendo. For commercial use:

1. **Obtain proper licenses** from Nintendo
2. **Use royalty-free alternatives** that sound similar
3. **Create original compositions** inspired by Mario style
4. **Use for educational/demo purposes only**

### **Fair Use Guidelines**
- **Educational purposes** - Limited fair use
- **Personal projects** - May be acceptable
- **Commercial use** - Requires licensing
- **Public distribution** - Requires permission

## 🎯 Alternative Solutions

### **1. Royalty-Free Mario-Style Audio**
- **Freesound.org** - Creative Commons licensed sounds
- **Zapsplat** - Professional sound effects
- **AudioJungle** - Premium audio marketplace

### **2. Generated Mario-Style Sounds**
The current system includes programmatically generated Mario-style sounds as fallbacks:
- Uses Web Audio API oscillators
- Authentic Mario-style frequencies and waveforms
- No copyright issues
- Always available

### **3. Original Compositions**
- Create original 8-bit/16-bit style music
- Use similar instruments and melodies
- Avoid direct copying of Mario themes
- Ensure originality and copyright compliance

## 🚀 Quick Start

1. **Add your audio files** to this directory
2. **Update the file paths** in `scripts/audio-utils.js`
3. **Test the audio** by refreshing the page
4. **Check console logs** for loading status
5. **Enjoy authentic Mario game audio!** 🎮

## 🔍 Troubleshooting

### **Audio Not Loading**
- Check file paths and URLs
- Verify file formats are supported
- Check browser console for errors
- Ensure CORS is properly configured

### **Audio Quality Issues**
- Use higher quality source files
- Check sample rate and bit depth
- Optimize file compression
- Test on different browsers

### **Performance Issues**
- Compress audio files appropriately
- Use CDN for faster loading
- Implement lazy loading for background music
- Monitor memory usage

---

**Note**: The system will automatically fall back to generated Mario-style sounds if external audio files cannot be loaded, ensuring the audio experience always works! 🎵✨ 