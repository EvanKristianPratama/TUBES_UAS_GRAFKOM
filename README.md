# 🚀 Game Pesawat Luar Angkasa (Tubes Grafkom)

Halo! Ini adalah dokumentasi sederhana untuk proyek game pesawat 3D kita. Dokumentasi ini dibuat supaya mudah dipahami, bahkan kalau kamu baru belajar pemrograman.

## 📝 Deskripsi Singkat
Game ini adalah simulasi pesawat luar angkasa sederhana. Kamu mengendalikan pesawat untuk menghindari rintangan (kotak merah) sambil mengumpulkan poin. Semakin lama kamu bertahan, skor kamu makin tinggi!

## 📂 Penjelasan File (Mirip Bahan Masakan)

1.  **`index.html` (Rangka Rumah)**
    *   Ini adalah "tulang" dari web kita. Di sini kita menentukan di mana tombol **ENGAGE** (Mulai) dan **ABORT** (Berhenti) diletakkan.
    *   Ada juga tempat buat nampilin skor dan dashboard pesawat biar kelihatan keren.

2.  **`style.css` (Cat & Dekorasi)**
    *   File ini yang bikin game kita kelihatan kayak layar komputer canggih (kecanggihan gaya *Cyberpunk*/*Sci-Fi*).
    *   Kita kasih efek garis-garis (scanline) biar kayak TV jadul dan warna oranye biar kerasa kayak di dalam kokpit.

3.  **`main.js` (Otak Game)**
    *   Ini adalah file paling penting! Fungsinya buat gerakin pesawat pakai tombol `W, A, S, D`.
    *   Dia juga yang bertugas "manggil" musuh (kotak merah) secara otomatis setiap beberapa detik.
    *   Terakhir, dia yang ngecek kalau pesawat kita tabrakan sama kotak itu.

4.  **`background.js` (Pemandangan Luar)**
    *   File ini khusus buat bikin ribuan bintang di luar angkasa biar nggak sepi. Bintang-bintang ini muter pelan-pelan biar kerasa pesawatnya lagi jalan.

---

## 👥 Pembagian Tugas (3 Developer)

Biar kerjanya rapi, kita bagi jadi 3 bagian utama:

### 1. Developer 1: Si Tukang Desain (UI/UX)
*   **Fokus:** Tampilan visual di layar.
*   **Tugas:**
    *   Ngerapihin `index.html` dan `style.css`.
    *   Bikin dashboard biar kelihatan makin canggih.
    *   Nambahin animasi radar yang muter-muter.
    *   Mastikan tampilan game tetap oke kalau dibuka di HP.

### 2. Developer 2: Si Pembuat Aturan (Game Logic)
*   **Fokus:** Cara main dan mesin game.
*   **Tugas:**
    *   Ngelola file `main.js`.
    *   Bikin sistem gerak pesawat (Keyboard input).
    *   Bikin musuh muncul terus-menerus (Obstacle Spawning).
    *   Nghitung skor dan nyimpen *High Score* di memori browser.

### 3. Developer 3: Si Penata Cahaya & Kamera (Graphics Specialist)
*   **Fokus:** Dunia 3D dan atmosfir.
*   **Tugas:**
    *   Ngelola `background.js` dan setting-an Three.js di `main.js`.
    *   Bikin model pesawat jadi lebih bagus pakai bangun ruang (Box, Cone, Cylinder).
    *   Ngelola lampu (Lighting) biar pesawatnya kelihatan nyata.
    *   Ngelola kamera supaya posisinya enak dilihat pas main.

---

## 🚀 Cara Menjalankan
1. Open folder ini di Visual Studio Code.
2. Klik kanan pada `index.html` lalu pilih **Open with Live Server**.
3. Klik tombol **ENGAGE** buat mulai terbang!

**Selamat Belajar & Selamat Ngoding!** 👨‍💻👩‍💻
