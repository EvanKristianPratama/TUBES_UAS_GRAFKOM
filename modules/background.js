// ============================================================
// BACKGROUND.JS - MODUL LATAR BELAKANG (PERSON 3)
// ============================================================
// File ini mengatur latar belakang game:
// - Membuat bintang-bintang di luar angkasa
// - Animasi bintang bergerak ke arah pemain
// - Efek kecepatan seperti warp drive
// ============================================================

// Import THREE.js untuk membuat objek 3D
import * as THREE from 'three';

// ------------------------------------------------------------
// VARIABEL GLOBAL UNTUK BINTANG
// ------------------------------------------------------------
// Array untuk menyimpan semua bintang
var stars = [];

// Kecepatan gerak bintang
var starSpeed = 0.1;

// Referensi ke scene (akan diisi saat setup)
var sceneRef = null;

// ------------------------------------------------------------
// FUNGSI: SETUP BACKGROUND
// ------------------------------------------------------------
// Membuat bintang-bintang di awal game
// Parameter: scene = tempat 3D untuk menaruh bintang
export function setupBackground(scene) {
    // Simpan referensi scene
    sceneRef = scene;
    
    // Jumlah bintang yang akan dibuat
    var starCount = 200;
    
    // ========================================================
    // BUAT BINTANG SATU PER SATU
    // ========================================================
    for (var i = 0; i < starCount; i++) {
        // Buat geometry bintang (bola kecil)
        // SphereGeometry dengan radius 0.05 = titik kecil
        var geometry = new THREE.SphereGeometry(0.05, 4, 4);
        
        // Material bintang dengan warna putih bercahaya
        var material = new THREE.MeshBasicMaterial({
            color: 0xffffff  // Putih
        });
        
        // Buat mesh bintang
        var star = new THREE.Mesh(geometry, material);
        
        // ====================================================
        // TENTUKAN POSISI ACAK UNTUK SETIAP BINTANG
        // ====================================================
        // Posisi X: random -20 sampai 20
        var randomX = Math.random() * 40 - 20;
        
        // Posisi Y: random -10 sampai 10
        var randomY = Math.random() * 20 - 10;
        
        // Posisi Z: random -50 sampai 10
        // Bintang tersebar dari jauh (depan) sampai dekat (belakang)
        var randomZ = Math.random() * 60 - 50;
        
        star.position.set(randomX, randomY, randomZ);
        
        // ====================================================
        // TAMBAHKAN KE SCENE DAN ARRAY
        // ====================================================
        scene.add(star);
        stars.push(star);
    }
}

// ------------------------------------------------------------
// FUNGSI: UPDATE BACKGROUND (ANIMASI)
// ------------------------------------------------------------
// Dipanggil setiap frame untuk menggerakkan bintang
export function updateBackground() {
    // Loop semua bintang
    for (var i = 0; i < stars.length; i++) {
        var star = stars[i];
        
        // ====================================================
        // GERAKKAN BINTANG KE ARAH PEMAIN
        // ====================================================
        // Tambah posisi Z = bergerak ke arah kamera/pemain
        star.position.z += starSpeed;
        
        // ====================================================
        // RESET POSISI JIKA BINTANG SUDAH MELEWATI KAMERA
        // ====================================================
        // Jika bintang sudah terlalu dekat (z > 10), pindahkan ke depan
        if (star.position.z > 10) {
            // Pindahkan ke posisi jauh di depan
            star.position.z = -50;
            
            // Acak ulang posisi X dan Y untuk variasi
            star.position.x = Math.random() * 40 - 20;
            star.position.y = Math.random() * 20 - 10;
        }
    }
}

// ============================================================
// PENJELASAN EFEK VISUAL
// ============================================================
/*
 * Efek yang diciptakan:
 * 1. Bintang bergerak ke arah pemain -> Ilusi pesawat bergerak maju
 * 2. Bintang yang lewat di-reset ke depan -> Loop tak terbatas
 * 3. Posisi X dan Y diacak ulang -> Tidak ada pola berulang
 * 
 * Cara kerja:
 * - Saat game dimulai, 200 bintang dibuat di posisi acak
 * - Setiap frame, semua bintang bergerak +0.1 di sumbu Z
 * - Bintang yang mencapai Z > 10 dipindah ke Z = -50
 * - Ini menciptakan ilusi perjalanan tak terbatas di luar angkasa
 */
