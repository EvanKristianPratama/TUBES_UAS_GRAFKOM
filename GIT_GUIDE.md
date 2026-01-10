# 📥 Tutorial: Cara Menggunakan Git Pull

Halo! Tutorial ini bakal bantu kamu paham gimana cara mengambil perubahan terbaru dari GitHub ke komputer kamu sendiri.

## 🤔 Apa itu Git Pull?
Bayangkan kamu punya file tugas kelompok. Teman kamu sudah nambahin bagian dia di GitHub. Nah, `git pull` itu ibarat tombol **"Update"** atau **"Refresh"** supaya file di komputer kamu dapet tambahan dari temen kamu tadi.

---

## 🚀 Langkah-Langkah Pull

### 1. Pull Standard (Paling Umum)
Kalau kamu baru mau mulai kerja dan mau mastikan file kamu sudah yang paling baru:
```bash
git pull origin main
```
*Gunakan ini kalau kamu belum ngetik kode apa-apa hari ini.*

### 2. Pull Rebase (Kalau Error saat Push)
Kalau kamu dapet error pas mau `git push` (biasanya karena ada perubahan di GitHub yang belum ada di komputer kamu), gunakan ini:
```bash
git pull --rebase origin main
```
*Gunakan ini supaya perubahan kamu "ditaruh" di atas perubahan temen kamu secara rapi.*

---

## ⚠️ Tips Biar Nggak Error:

1.  **Commit Dulu Sebelum Pull:** Selalu simpan kerjaan kamu pakai `git add .` dan `git commit -m "pesan"` sebelum melakukan pull. Kalau tidak, Git bingung mau naruh filenya di mana.
2.  **Cek Status:** Kalau bingung, ketik `git status`. Dia bakal kasih tahu kamu lagi di posisi mana.
3.  **Sering-sering Pull:** Biasakan sebelum mulai ngoding, lakukan `git pull` biar nggak ketinggalan jauh sama temen setim.

---
**Gampang kan? Ingat: Pull dulu baru Ngoding!** 🚀
