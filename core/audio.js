// ============================================================
// AUDIO.JS - AUDIO/MUSIC MANAGER
// ============================================================
// Mengelola background music dan sound effects

export class AudioManager {
  constructor() {
    // Buat audio element untuk background music
    this.backgroundMusic = new Audio();
    this.backgroundMusic.loop = true; // Loop musik
    this.backgroundMusic.volume = 0.5; // Volume 50%
    
    // Set path ke file musik
    // PENTING: Ganti 'blinding-light.mp3' dengan file musik Anda
    // File musik harus disimpan di folder: assets/
    // Path absolut untuk Vercel deployment
    this.backgroundMusic.src = '/assets/blinding-light.mp3';
    
    this.isPlaying = true; // Default ON
  }

  /**
   * Mulai main musik background
   */
  playBackgroundMusic() {
    if (!this.isPlaying) {
      this.backgroundMusic.play().catch(error => {
        console.warn('Could not autoplay music:', error);
        // Coba lagi saat user interact
      });
      this.isPlaying = true;
    }
  }

  /**
   * Hentikan musik background
   */
  stopBackgroundMusic() {
    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
    this.isPlaying = false;
  }

  /**
   * Toggle musik on/off
   */
  toggleMusic() {
    if (this.isPlaying) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
    return this.isPlaying;
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume) {
    this.backgroundMusic.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Hentikan musik saat game selesai
   */
  stop() {
    this.stopBackgroundMusic();
  }
}
