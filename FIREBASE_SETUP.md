# 🔥 Panduan Setup Firebase untuk Space Runner

## Langkah 1: Buat Project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik **"Create a project"** (atau "Add project")
3. Masukkan nama project: `space-runner-game`
4. Klik **Continue**
5. (Opsional) Disable Google Analytics jika tidak diperlukan
6. Klik **Create Project**
7. Tunggu hingga selesai, lalu klik **Continue**

## Langkah 2: Setup Realtime Database

1. Di sidebar kiri, klik **Build** → **Realtime Database**
2. Klik **Create Database**
3. Pilih lokasi: **Singapore (asia-southeast1)** atau terdekat
4. Pilih **Start in test mode** (untuk development)
5. Klik **Enable**

### ⚠️ PENTING: Update Security Rules

Untuk production, update rules di tab **Rules**:

```json
{
  "rules": {
    "scores": {
      ".read": true,
      ".write": true,
      ".indexOn": ["score"]
    }
  }
}
```

## Langkah 3: Register Web App

1. Di halaman Project Overview, klik ikon **Web** (`</>`)
2. Masukkan nickname: `Space Runner Web`
3. ❌ **JANGAN** centang Firebase Hosting (kita pakai Vercel)
4. Klik **Register app**
5. **COPY konfigurasi** yang muncul (lihat contoh di bawah)

## Langkah 4: Update Konfigurasi di Kode

Buka file `core/firebase.js` dan ganti bagian `firebaseConfig`:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy.....................",
    authDomain: "space-runner-game.firebaseapp.com",
    databaseURL: "https://space-runner-game-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "space-runner-game",
    storageBucket: "space-runner-game.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

> ⚠️ **Ganti semua nilai di atas dengan konfigurasi dari Firebase Console kamu!**

## Langkah 5: Test di Local

```bash
npx vite
```

Buka http://localhost:5173 dan coba main game. 
Setelah game over, cek Firebase Console → Realtime Database.
Skor seharusnya muncul di sana! 🎉

## Langkah 6: Deploy ke Vercel

1. Push kode ke GitHub:
```bash
git add .
git commit -m "Add Firebase for online leaderboard"
git push origin main
```

2. Buka [Vercel](https://vercel.com) dan deploy dari repository

## Troubleshooting

### Error: Permission Denied
- Pastikan rules database sudah diupdate (Langkah 2)
- Pastikan `databaseURL` sudah benar

### High Score Tidak Muncul
- Buka Console browser (F12) untuk lihat error
- Pastikan Firebase sudah terinisialisasi (cek log `✅ Firebase berhasil diinisialisasi!`)

### Error CORS
- Firebase SDK dari CDN seharusnya tidak ada masalah CORS
- Pastikan URL database benar

---

## 📊 Struktur Data di Firebase

```
space-runner-game/
└── scores/
    ├── 1704067200000/
    │   ├── name: "Player1"
    │   ├── score: 150
    │   ├── level: 3
    │   └── date: "2024-01-01T00:00:00.000Z"
    └── 1704153600000/
        ├── name: "Player2"
        ├── score: 200
        ├── level: 5
        └── date: "2024-01-02T00:00:00.000Z"
```

---

💡 **Tips**: High score akan terlihat oleh SEMUA pemain karena disimpan di cloud!
