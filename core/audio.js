// ============================================================
// AUDIO.JS - AUDIO/MUSIC MANAGER
// ============================================================

export class AudioManager {
  constructor() {
    this.backgroundMusic = new Audio();
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.5;
    this.backgroundMusic.src = '/assets/blinding-light.mp3';
    this.isPlaying = false;
    this.isEnabled = true; 
    this.setupAutoplay();
  }

  setupAutoplay() {
    const tryPlay = () => {
      if (this.isEnabled && !this.isPlaying) {
        this.backgroundMusic.play()
          .then(() => {
            this.isPlaying = true;
          })
          .catch(() => {});
      }
      document.removeEventListener('click', tryPlay);
      document.removeEventListener('keydown', tryPlay);
      document.removeEventListener('touchstart', tryPlay);
    };

    document.addEventListener('click', tryPlay, { once: true });
    document.addEventListener('keydown', tryPlay, { once: true });
    document.addEventListener('touchstart', tryPlay, { once: true });
  }

  playBackgroundMusic() {
    this.isEnabled = true;
    if (!this.isPlaying) {
      this.backgroundMusic.play()
        .then(() => { this.isPlaying = true; })
        .catch(() => {});
    }
  }

  stopBackgroundMusic() {
    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
    this.isPlaying = false;
    this.isEnabled = false;
  }

  toggleMusic() {
    if (this.isEnabled) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
    return this.isEnabled;
  }

  setVolume(volume) {
    this.backgroundMusic.volume = Math.max(0, Math.min(1, volume));
  }

  stop() {
    this.stopBackgroundMusic();
  }
}
