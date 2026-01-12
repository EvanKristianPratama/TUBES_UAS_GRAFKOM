// ============================================================
// OBSTACLE.JS - MODUL METEOR/RINTANGAN (PERSON 2)
// ============================================================
// File ini mengatur semua hal tentang meteor:
// - Membuat meteor baru (spawn)
// - Menggerakkan meteor ke arah pemain
// - Menghapus meteor yang sudah lewat
// - Deteksi tabrakan dengan pesawat
// ============================================================

// Import THREE.js untuk membuat objek 3D
import * as THREE from 'three';

// ------------------------------------------------------------
// CLASS OBSTACLE MANAGER
// ------------------------------------------------------------
// Class ini mengelola semua meteor dalam game
export class ObstacleManager {
    
    // --------------------------------------------------------
    // CONSTRUCTOR
    // --------------------------------------------------------
    constructor(scene) {
        // Simpan referensi ke scene
        this.scene = scene;
        
        // Array untuk menyimpan semua meteor aktif
        this.obstacles = [];
        
        // Timer untuk spawn meteor baru
        // Meteor akan spawn setiap X frame
        this.spawnTimer = 0;
        this.spawnInterval = 40;  // Spawn setiap 40 frame (lebih cepat)
        
        // Counter untuk membuat meteor makin banyak seiring waktu
        this.difficultyTimer = 0;
    }
    
    // --------------------------------------------------------
    // FUNGSI: SPAWN METEOR BARU
    // --------------------------------------------------------
    spawn() {
        // ====================================================
        // UKURAN RANDOM (KECIL, SEDANG, BESAR)
        // ====================================================
        // Ukuran random antara 0.2 sampai 0.5
        var randomSize = 0.2 + Math.random() * 0.3;
        
        // ====================================================
        // BUAT GEOMETRY METEOR (BENTUK BOLA TIDAK RATA)
        // ====================================================
        // IcosahedronGeometry = bentuk bola dengan permukaan kasar
        // Parameter: radius, detail (makin kecil = makin kasar)
        var geometry = new THREE.IcosahedronGeometry(randomSize, 0);
        
        // ====================================================
        // WARNA RANDOM (VARIASI METEOR)
        // ====================================================
        var colors = [0x886644, 0x664422, 0x998866, 0x554433, 0x775544];
        var randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Material meteor dengan warna random
        var material = new THREE.MeshStandardMaterial({
            color: randomColor,
            metalness: 0.3,
            roughness: 0.8,
            flatShading: true     // Shading flat untuk efek low-poly
        });
        
        // Buat mesh meteor
        var meteor = new THREE.Mesh(geometry, material);
        
        // ====================================================
        // TENTUKAN POSISI AWAL METEOR
        // ====================================================
        // Posisi X: random antara -4 sampai 4
        var randomX = Math.random() * 8 - 4;
        
        // Posisi Y: random antara 0 sampai 3 (lebih tinggi)
        var randomY = Math.random() * 3;
        
        // Posisi Z: -20 sampai -30 (variasi jarak)
        var startZ = -20 - Math.random() * 10;
        
        meteor.position.set(randomX, randomY, startZ);
        
        // ====================================================
        // KECEPATAN RANDOM (LEBIH DINAMIS)
        // ====================================================
        // Simpan kecepatan unik untuk setiap meteor
        meteor.userData.speed = 0.8 + Math.random() * 0.5;  // 0.8 - 1.3
        meteor.userData.rotationSpeed = 0.01 + Math.random() * 0.04;  // Kecepatan rotasi
        meteor.userData.size = randomSize;  // Simpan ukuran untuk collision
        
        // ====================================================
        // TAMBAHKAN KE SCENE DAN ARRAY
        // ====================================================
        this.scene.add(meteor);
        this.obstacles.push(meteor);
    }
    
    // --------------------------------------------------------
    // FUNGSI: UPDATE SEMUA METEOR
    // --------------------------------------------------------
    // Parameter: speed = kecepatan game
    update(speed) {
        // ====================================================
        // BAGIAN 1: SPAWN METEOR BARU
        // ====================================================
        // Tambah timer
        this.spawnTimer++;
        
        // Jika timer sudah mencapai interval, spawn meteor baru
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawn();
            this.spawnTimer = 0;  // Reset timer
        }
        
        // ====================================================
        // BAGIAN 2: GERAKKAN SEMUA METEOR
        // ====================================================
        // Tambah difficulty seiring waktu
        this.difficultyTimer++;
        if (this.difficultyTimer > 300 && this.spawnInterval > 20) {
            // Kurangi interval spawn setiap 5 detik (makin cepat spawn)
            this.spawnInterval -= 2;
            this.difficultyTimer = 0;
        }
        // AI Refrence
        // Loop dari belakang ke depan (untuk menghapus dengan aman)
        // Menggunakan reverse loop agar index tidak kacau saat splice
        for (var i = this.obstacles.length - 1; i >= 0; i--) {
            var meteor = this.obstacles[i];
            
            // Gerakkan meteor dengan kecepatan unik masing-masing
            var meteorSpeed = meteor.userData.speed || 1;
            meteor.position.z += speed * 3 * meteorSpeed;
            
            // Rotasi meteor dengan kecepatan unik
            var rotSpeed = meteor.userData.rotationSpeed || 0.02;
            meteor.rotation.x += rotSpeed;
            meteor.rotation.y += rotSpeed * 1.5;
            
            // ================================================
            // BAGIAN 3: HAPUS METEOR YANG SUDAH LEWAT
            // ================================================
            // Jika meteor sudah melewati pemain (z > 5)
            if (meteor.position.z > 5) {
                // Hapus dari scene
                this.scene.remove(meteor);
                
                // Hapus dari array menggunakan splice
                // splice(index, jumlah yang dihapus)
                this.obstacles.splice(i, 1);
                
                // Bersihkan memory
                meteor.geometry.dispose();
                meteor.material.dispose();
            }
        }
    }
    
    // --------------------------------------------------------
    // FUNGSI: CEK TABRAKAN DENGAN PESAWAT
    // --------------------------------------------------------
    // Parameter: playerPosition = posisi pesawat, radius = jarak tabrakan
    checkCollision(playerPosition, radius) {
        // Loop semua meteor
        for (var i = 0; i < this.obstacles.length; i++) {
            var meteor = this.obstacles[i];
            
            // Hitung jarak antara pesawat dan meteor
            // distanceTo() menghitung jarak 3D antara 2 titik
            var distance = meteor.position.distanceTo(playerPosition);
            
            // Ambil ukuran meteor (atau default 0.3)
            var meteorSize = meteor.userData.size || 0.3;
            
            // Jika jarak lebih kecil dari radius + ukuran meteor, berarti tabrakan
            if (distance < radius + meteorSize) {
                return true;  // Ada tabrakan!
            }
        }
        
        // Tidak ada tabrakan
        return false;
    }
    
    // --------------------------------------------------------
    // FUNGSI: HAPUS SEMUA METEOR
    // --------------------------------------------------------
    // Dipanggil saat game reset atau game over
    clearAll() {
        // Loop semua meteor dan hapus
        for (var i = 0; i < this.obstacles.length; i++) {
            var meteor = this.obstacles[i];
            
            // Hapus dari scene
            this.scene.remove(meteor);
            
            // Bersihkan memory
            meteor.geometry.dispose();
            meteor.material.dispose();
        }
        
        // Kosongkan array
        this.obstacles = [];
        
        // Reset timer
        this.spawnTimer = 0;
    }
}
