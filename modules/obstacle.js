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
        this.spawnInterval = 60;  // Spawn setiap 60 frame (1 detik di 60 FPS)
    }
    
    // --------------------------------------------------------
    // FUNGSI: SPAWN METEOR BARU
    // --------------------------------------------------------
    spawn() {
        // ====================================================
        // BUAT GEOMETRY METEOR (BENTUK BOLA TIDAK RATA)
        // ====================================================
        // IcosahedronGeometry = bentuk bola dengan permukaan kasar
        // Parameter: radius, detail (makin kecil = makin kasar)
        var geometry = new THREE.IcosahedronGeometry(0.3, 0);
        
        // Material meteor dengan warna coklat-orange
        var material = new THREE.MeshStandardMaterial({
            color: 0x886644,       // Warna coklat
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
        // Math.random() menghasilkan angka 0-1
        // Dikali 8 jadi 0-8, dikurangi 4 jadi -4 sampai 4
        var randomX = Math.random() * 8 - 4;
        
        // Posisi Y: random antara 0 sampai 2 (tinggi)
        var randomY = Math.random() * 2;
        
        // Posisi Z: -20 (jauh di depan, akan bergerak ke pemain)
        var startZ = -20;
        
        meteor.position.set(randomX, randomY, startZ);
        
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
        // Loop dari belakang ke depan (untuk menghapus dengan aman)
        // Menggunakan reverse loop agar index tidak kacau saat splice
        for (var i = this.obstacles.length - 1; i >= 0; i--) {
            var meteor = this.obstacles[i];
            
            // Gerakkan meteor ke arah pemain (tambah Z)
            // speed * 3 untuk kecepatan meteor lebih cepat dari background
            meteor.position.z += speed * 3;
            
            // Rotasi meteor untuk efek berputar
            meteor.rotation.x += 0.02;
            meteor.rotation.y += 0.03;
            
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
            
            // Jika jarak lebih kecil dari radius, berarti tabrakan
            // radius + 0.3 (ukuran meteor)
            if (distance < radius + 0.3) {
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
