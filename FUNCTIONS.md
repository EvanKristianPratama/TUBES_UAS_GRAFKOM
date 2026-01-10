# 📖 Penjelasan Detail Kode (Step-by-Step)

Dokumen ini menjelaskan apa yang terjadi di balik layar pada setiap fungsi di kode kita. Kita bagi berdasarkan file-nya ya!

---

## 1. `main.js` (Otak Utama)

Ini adalah tempat logika game dijalankan.

### 🛠️ Setup & Kamera
*   **`scene`**: Bayangkan ini sebagai "panggung" kosong tempat kita menaruh semua benda 3D.
*   **`camera`**: Mata kita di dalam game. Kita pakai `PerspectiveCamera` supaya benda yang jauh kelihatan kecil, mirip mata manusia.
*   **`renderer`**: Ini adalah "pelukis" yang menggambar panggung (scene) ke layar HP atau Laptop kita. Kita buat transparan biar keren!
*   **`GridHelper`**: Garis-garis di lantai buat bantu kita tahu posisi (biar nggak bingung terbang di ruang hampa).

### 🚀 Membuat Pesawat (`player`)
*   Kita menggabungkan beberapa bentuk dasar:
    *   **Cone (Kerucut)**: Untuk badan utama pesawat.
    *   **Box (Kotak)**: Untuk kokpit dan sayap.
    *   **Cylinder (Tabung)**: Untuk mesin di kiri dan kanan.
*   Semua digabung ke dalam satu grup bernama `player` supaya kalau badannya gerak, sayap dan mesinnya ikut gerak.

### 👾 Fungsi `spawnObstacle()`
*   **Fungsi:** Memunculkan musuh (kotak merah).
*   **Cara Kerja:** Dia bikin kotak baru, dikasih warna merah, ditaruh di posisi acak di depan pesawat, terus dimasukkan ke daftar "antrian" bernama `obstacles`.

### ⌨️ Event Listener `keydown`
*   **Fungsi:** Mendengarkan tombol yang kita tekan.
*   **Logika:** Kalau kita tekan `A`, posisi pesawat geser ke kiri. Kalau `D`, geser ke kanan. Begitu juga buat `W` (maju/naik) dan `S` (mundur/turun).

### 🔄 Fungsi `animate()` (Jantung Game)
*   Ini adalah fungsi yang jalan terus-menerus (sekitar 60 kali per detik).
*   **Tugasnya:**
    1.  Nambah skor tiap detik.
    2.  Manggil `spawnObstacle()` setiap 1 detik sekali (pakai `obstacleTimer`).
    3.  Menggerakkan semua musuh (kotak merah) mendekat ke arah kita (`obs.position.z += 0.4`).
    4.  **Cek Tabrakan:** Dia ngecek jarak antara pesawat sama tiap kotak. Kalau terlalu dekat, game berhenti (`gameOver()`).
    5.  Hapus kotak yang sudah lewat di belakang kita biar RAM komputer nggak penuh.

### 💀 Fungsi `gameOver()`
*   Fungsi ini dipanggil kalau kita tabrakan.
*   Dia bakal stop game, cek apakah skor kita itu skor tertinggi (*High Score*), terus munculin pesan "Game Over!".

### 🧹 Fungsi `resetGame()`
*   Dipanggil pas kita tekan tombol **ENGAGE**.
*   Tugasnya bersihin semua kotak yang ada di layar, balikin skor ke 0, dan naruh pesawat di posisi awal.

### 📡 Fungsi `updateRadar()`
*   **Fungsi:** Menggambar titik-titik di radar kecil (kotak di dashboard).
*   **Logika:** Dia mengubah koordinat 3D yang luas menjadi koordinat 2D yang kecil di layar radar, jadi kita bisa tahu musuh datang dari mana.

---

## 2. `background.js` (Luar Angkasa)

### ✨ Fungsi `setupBackground()`
*   **Fungsi:** Bikin 6000 bintang di langit.
*   **Cara Kerja:** Dia naruh titik-titik putih di posisi acak yang sangat jauh dari pesawat. Biar kelihatan bulat cantik, kita pakai gambar lingkaran kecil (`disc.png`).

### 🌠 Fungsi `updateBackground()`
*   **Fungsi:** Bikin bintang berputar.
*   **Cara Kerja:** Putar seluruh kumpulan bintang sedikit demi sedikit biar langitnya nggak kaku.

---

## 3. `index.html` (Struktur Tampilan)

*   **`<div id="cockpit">`**: Bungkus besar buat semua tampilan di depan mata kita.
*   **`<div id="dashboard">`**: Bagian bawah tempat panel-panel berada.
*   **`<span id="score">`**: Tempat "nampang" angka skor yang dikirim dari `main.js`.
*   **`<button id="startBtn">`**: Tombol yang kalau diklik bakal jalanin `resetGame()` dan mulai main.

---

## 4. `style.css` (Gaya & Animasi)

*   **`:root`**: Tempat nyimpen warna-warna utama biar gampang kalau mau ganti warna satu game (misal ganti dari oranye ke hijau).
*   **`body::after`**: Ini yang bikin efek garis-garis CRT (kayak monitor jadul).
*   **`@keyframes radar-spin`**: Animasi yang bikin garis di radar muter 360 derajat terus-menerus.
*   **`transform: perspective(500px) rotateX(10deg)`**: Teknik CSS buat bikin panel dashboard kelihatan agak miring, jadi ada kesan 3D-nya.

---
**Tips:** Kalau mau belajar, coba ganti angka-angka di `main.js` (misal `0.4` jadi `1.0`) dan lihat bedanya!
