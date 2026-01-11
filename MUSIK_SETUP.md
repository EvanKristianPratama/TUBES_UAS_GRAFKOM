# 🎵 CARA MENAMBAHKAN MUSIK

Fitur musik sudah ditambahkan ke game! Sekarang Anda tinggal menambahkan file musik.

## 📝 Langkah-langkah:

### 1. **Download lagu "The Weeknd - Blinding Light"**
   - Download dari YouTube, Spotify, atau sumber musik lainnya
   - Format: **MP3** atau **WAV**
   - Simpan dengan nama: `blinding-light.mp3`

### 2. **Pindahkan file ke folder yang benar**
   - File musik harus disimpan di: `assets/blinding-light.mp3`
   - Struktur folder akan terlihat seperti ini:
   ```
   TUBES_UAS_GRAFKOM/
   ├── assets/
   │   └── blinding-light.mp3  ← File musik di sini!
   ├── core/
   ├── modules/
   ├── index.html
   ├── main.js
   ├── style.css
   └── ...
   ```

### 3. **Jalankan game dan test musiknya**
   - Buka game di browser
   - Klik tombol **"🔊 MUSIC ON"** untuk main/stop musik
   - Musik akan otomatis play saat Anda klik **"▶ PLAY"**

## 🎮 Fitur Musik:
- ✅ Tombol on/off untuk kontrol musik
- ✅ Musik loop otomatis (putar ulang terus)
- ✅ Musik mulai saat game dimulai
- ✅ Volume 50% (bisa diatur di `core/audio.js` jika perlu)

## 🔧 Cara mengubah musik lain:

Edit file `core/audio.js` dan ubah baris ini:
```javascript
this.backgroundMusic.src = './assets/blinding-light.mp3';
```

Ganti `blinding-light.mp3` dengan nama file musik Anda.

## 📁 File yang berubah:
- ✅ Buat folder `assets/`
- ✅ Buat file `core/audio.js` (Audio Manager)
- ✅ Update `index.html` (tambah tombol musik)
- ✅ Update `main.js` (import dan integrate audio)
- ✅ Update `style.css` (styling tombol musik)

## ⚠️ Catatan:
- Pastikan file musik ada di folder `assets/` dengan nama yang benar
- Format harus MP3 atau WAV untuk kompatibilitas maksimal
- Beberapa browser mungkin memerlukan user interaction sebelum audio bisa play (ini normal untuk Web Audio API)

Selamat! Musik sudah siap untuk ditambahkan! 🎵
