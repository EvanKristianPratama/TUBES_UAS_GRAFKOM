// ============================================================
// SPACESHIP.JS - MODUL PESAWAT (PERSON 1)
// ============================================================
// File ini mengatur semua hal tentang pesawat pemain:
// - Membuat model 3D pesawat
// - Gerakan pesawat (kiri, kanan, atas, bawah)
// - Efek engine glow (mesin menyala)
// - Batas gerakan agar tidak keluar layar
// ============================================================

// Import THREE.js untuk membuat objek 3D
import * as THREE from 'three';

// ------------------------------------------------------------
// KONSTANTA (NILAI TETAP)
// ------------------------------------------------------------
// Batas pergerakan pesawat agar tidak keluar layar
var BOUNDARY_X = 4;   // Batas kiri-kanan (sumbu X)
var BOUNDARY_Z = 3;   // Batas depan-belakang (sumbu Z)
var MOVE_SPEED = 0.1; // Kecepatan gerak pesawat

// ------------------------------------------------------------
// CLASS SPACESHIP
// ------------------------------------------------------------
// Class adalah blueprint/cetakan untuk membuat objek
// Setiap spaceship yang dibuat akan punya properties dan methods yang sama
export class Spaceship {
    
    // --------------------------------------------------------
    // CONSTRUCTOR - Dipanggil saat membuat spaceship baru
    // --------------------------------------------------------
    // Parameter: scene = tempat 3D untuk menaruh pesawat
    constructor(scene) {
        // Simpan referensi ke scene
        this.scene = scene;
        
        // Array untuk menyimpan efek glow engine
        // PENTING: Harus dibuat SEBELUM createMesh()!
        this.engineGlows = [];
        
        // Buat model 3D pesawat
        this.mesh = this.createMesh();
        
        // Tambahkan pesawat ke scene
        this.scene.add(this.mesh);
    }
    
    // --------------------------------------------------------
    // FUNGSI: MEMBUAT MODEL 3D PESAWAT
    // --------------------------------------------------------
    createMesh() {
        // Group adalah container untuk menggabungkan beberapa objek 3D
        var ship = new THREE.Group();
        
        // ====================================================
        // BAGIAN 1: BADAN UTAMA PESAWAT
        // ====================================================
        // ConeGeometry = bentuk kerucut (untuk badan pesawat)
        // Parameter: radius, height, segments
        var bodyGeometry = new THREE.ConeGeometry(0.3, 1.2, 8);
        
        // MeshStandardMaterial = material dengan efek cahaya realistis
        var bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x4488ff,       // Warna biru
            metalness: 0.7,        // Efek metalik (0-1)
            roughness: 0.3         // Kekasaran permukaan (0=licin, 1=kasar)
        });
        
        // Mesh = gabungan geometry + material
        var body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        
        // Rotasi badan agar menghadap ke depan (rotasi sumbu X)
        // Math.PI / 2 = 90 derajat dalam radian
        body.rotation.x = Math.PI / 2;
        
        // Tambahkan badan ke group ship
        ship.add(body);
        
        // ====================================================
        // BAGIAN 2: COCKPIT (KACA DEPAN)
        // ====================================================
        var cockpitGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        var cockpitMaterial = new THREE.MeshStandardMaterial({
            color: 0x88ccff,       // Biru muda
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,     // Bisa transparan
            opacity: 0.8          // Tingkat transparansi (0=invisible, 1=solid)
        });
        var cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.set(0, 0.1, -0.3);  // Posisi di atas depan badan
        ship.add(cockpit);
        
        // ====================================================
        // BAGIAN 3: SAYAP PESAWAT
        // ====================================================
        // BoxGeometry = bentuk kotak
        // Parameter: width, height, depth
        var wingGeometry = new THREE.BoxGeometry(1.5, 0.05, 0.4);
        var wingMaterial = new THREE.MeshStandardMaterial({
            color: 0x3366cc,       // Biru tua
            metalness: 0.6,
            roughness: 0.4
        });
        var wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.set(0, 0, 0.2);  // Posisi di tengah-belakang
        ship.add(wings);
        
        // ====================================================
        // BAGIAN 4: ENGINE (MESIN) DENGAN EFEK GLOW
        // ====================================================
        // Buat 2 engine di kiri dan kanan
        var enginePositions = [
            { x: -0.3, y: 0, z: 0.5 },   // Engine kiri
            { x: 0.3, y: 0, z: 0.5 }     // Engine kanan
        ];
        
        // Loop untuk membuat setiap engine
        for (var i = 0; i < enginePositions.length; i++) {
            var pos = enginePositions[i];
            
            // Buat engine (silinder kecil)
            var engineGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.2, 8);
            var engineMaterial = new THREE.MeshStandardMaterial({
                color: 0x333333,   // Abu-abu gelap
                metalness: 0.8
            });
            var engine = new THREE.Mesh(engineGeometry, engineMaterial);
            engine.rotation.x = Math.PI / 2;  // Rotasi agar menghadap belakang
            engine.position.set(pos.x, pos.y, pos.z);
            ship.add(engine);
            
            // Buat efek glow (cahaya mesin)
            // PointLight = lampu titik yang memancar ke segala arah
            var engineGlow = new THREE.PointLight(0xff6600, 1, 2);  // Orange, intensitas 1, jarak 2
            engineGlow.position.set(pos.x, pos.y, pos.z + 0.1);
            ship.add(engineGlow);
            
            // Simpan referensi glow untuk animasi nanti
            this.engineGlows.push(engineGlow);
        }
        
        // Kembalikan group ship yang sudah jadi
        return ship;
    }
    
    // --------------------------------------------------------
    // FUNGSI: UPDATE EFEK GLOW ENGINE (ANIMASI)
    // --------------------------------------------------------
    updateEngineGlow() {
        // Animasi intensitas glow berdasarkan waktu
        // Date.now() = waktu sekarang dalam millisecond
        // Math.sin() = fungsi gelombang untuk efek berkedip
        var time = Date.now() * 0.01;         // Skala waktu
        var intensity = 0.5 + Math.sin(time) * 0.3;  // Intensitas berubah 0.2 - 0.8
        
        // Terapkan ke semua engine glow
        for (var i = 0; i < this.engineGlows.length; i++) {
            this.engineGlows[i].intensity = intensity;
        }
    }
    
    // --------------------------------------------------------
    // FUNGSI: GERAK KIRI
    // --------------------------------------------------------
    moveLeft() {
        // Kurangi posisi X (geser ke kiri)
        // Tapi jangan melebihi batas kiri (-BOUNDARY_X)
        if (this.mesh.position.x > -BOUNDARY_X) {
            this.mesh.position.x -= MOVE_SPEED;
        }
    }
    
    // --------------------------------------------------------
    // FUNGSI: GERAK KANAN
    // --------------------------------------------------------
    moveRight() {
        // Tambah posisi X (geser ke kanan)
        // Tapi jangan melebihi batas kanan (+BOUNDARY_X)
        if (this.mesh.position.x < BOUNDARY_X) {
            this.mesh.position.x += MOVE_SPEED;
        }
    }
    
    // --------------------------------------------------------
    // FUNGSI: GERAK ATAS (MUNDUR)
    // --------------------------------------------------------
    moveUp() {
        // Dalam koordinat kita, "atas" = mundur = tambah Z
        if (this.mesh.position.z < BOUNDARY_Z) {
            this.mesh.position.z += MOVE_SPEED;
        }
    }
    
    // --------------------------------------------------------
    // FUNGSI: GERAK BAWAH (MAJU)
    // --------------------------------------------------------
    moveDown() {
        // "Bawah" = maju = kurang Z
        if (this.mesh.position.z > -BOUNDARY_Z) {
            this.mesh.position.z -= MOVE_SPEED;
        }
    }
    
    // --------------------------------------------------------
    // FUNGSI: AMBIL POSISI PESAWAT
    // --------------------------------------------------------
    getPosition() {
        // Return posisi mesh (Vector3 dengan x, y, z)
        return this.mesh.position;
    }
    
    // --------------------------------------------------------
    // FUNGSI: RESET POSISI KE TENGAH
    // --------------------------------------------------------
    resetPosition() {
        // Set posisi ke titik awal (tengah layar)
        this.mesh.position.set(0, 0, 0);
    }
}
